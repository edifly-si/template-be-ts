import crypto from 'crypto';
import moment from 'moment';
import m, { Model, ObjectId } from 'mongoose';
import { SignerFunction } from '../library/base_signer';
import { reqPaging } from './utils';

type tLoginFunc = (username: string, password: string) => Promise<[string, any]>;
type tInsertFunc = (data: any, uid: string) => Promise<any>;
type tUpdateFunc = (data: any, uid: string) => Promise<any>;
type tUpdateProfileFunc = (uid: string, data: any) => Promise<string>;
type tChangePasswFunc = (username: string, current: string, newPassw: string) => Promise<any>;
type tCreateUserFunc = (data: any, createdBy?: ObjectId) => Promise<any>;
type tCreateDefaultUser = (password: string) => Promise<any>;
type tPaging = (page: number, perPage: number, search: string, level: number, qry: any, sort: any) => Promise<any>;
type tUpdateLastLogin = (idUser: ObjectId) => Promise<void>;

type tListUsers = (
    page: number,
    perPage: number,
    search?: string,
    search2?: string
) => Promise<{ data: any[]; total: number; page: number; perPage: number }>;
type tGetUserById = (id: string) => Promise<any>;
type tUpdateUserById = (id: string, data: Record<string, unknown>) => Promise<any>;
type tDeleteUserById = (id: string) => Promise<{ deleted: boolean; id: string; data: any }>;
type tHashPassword = (username: string, password: string) => string;
type tCreateFromBody = (data: Record<string, unknown>) => Promise<any>;

export interface tUserIntf {
    Login: tLoginFunc;
    insert: tInsertFunc;
    update: tUpdateFunc;
    updateProfile: tUpdateProfileFunc;
    changePassword: tChangePasswFunc;
    createUser: tCreateUserFunc;
    createDefaultUser: tCreateDefaultUser;
    paging: tPaging;
    updateLastLogin: tUpdateLastLogin;
    list: tListUsers;
    getById: tGetUserById;
    updateById: tUpdateUserById;
    deleteById: tDeleteUserById;
    hashPassword: tHashPassword;
    create: tCreateFromBody;
}

const DEFAULT_USERNAME = 'admin';
const DEFAULT_LEVEL = 0x1fff0;

export default (USERSCH: Model<any>, saltName: string, signer: SignerFunction): tUserIntf => {
    const makeHashPassword = (username: string, password: string): string => {
        const salt = process.env[saltName] || 'SADHUWHENDMSABVHSACJASLWQPR';
        const hash = crypto.createHmac('sha256', salt);
        hash.update(username);
        hash.update(password);
        return hash.digest('hex');
    };

    /**
     * Convert the input to a plain JavaScript object so Mongoose internals
     * (`$__`, `_doc`, getters, virtuals) don't leak into API responses, and then
     * remove the hashed password field. Accepts plain objects, Mongoose documents
     * (with `toObject`), and lean query results.
     */
    const stripPassword = (resp: unknown): Record<string, unknown> => {
        let plain: Record<string, unknown>;
        if (resp && typeof (resp as { toObject?: () => unknown }).toObject === 'function') {
            plain = (resp as { toObject: () => Record<string, unknown> }).toObject();
        } else {
            plain = { ...(resp as Record<string, unknown>) };
        }
        delete plain.password;
        return plain;
    };

    const Login: tLoginFunc = async (username, password) => {
        const hashed = makeHashPassword(username, password);
        const uData = await USERSCH.findOne({ username, password: hashed });
        if (!uData) {
            throw new Error(`User ${username} Not Found or Wrong Password!`);
        }
        if (uData.block) {
            throw new Error(`User ${username} Disabled!`);
        }
        const { password: _pwd, createdBy: _cb, ...less } = JSON.parse(JSON.stringify(uData));
        const { level } = less;
        return [signer({ ...less, level }), uData];
    };

    const insert: tInsertFunc = async (data, uid) => {
        const { password: pwd, username, ...less } = data;
        const password = makeHashPassword(username, pwd);
        const createdBy = new m.Types.ObjectId(uid);
        const resp = await USERSCH.create({ ...less, username, password, createdBy });
        return stripPassword(resp);
    };

    const update: tUpdateFunc = async (data, id) => {
        const { password: pwd, username, ...less } = data;
        const _id = new m.Types.ObjectId(id);
        const setFields: Record<string, any> = { ...less };
        if (pwd) {
            setFields.password = makeHashPassword(username, pwd);
        }
        const resp = await USERSCH.findOneAndUpdate({ _id }, { $set: setFields });
        return stripPassword(resp._doc);
    };

    const updateProfile: tUpdateProfileFunc = async (userId, body) => {
        const { name, email, phone } = body;
        await USERSCH.updateOne(
            { _id: new m.Types.ObjectId(userId) },
            { $set: { name, email, phone } }
        );
        const usr: any = await USERSCH.findOne(
            { _id: new m.Types.ObjectId(userId) },
            '',
            { lean: true }
        );
        const { password: _pwd, ...less } = usr;
        return signer(less);
    };

    const changePassword: tChangePasswFunc = async (username, current, password) => {
        const hashed = makeHashPassword(username, password);
        const currPass = makeHashPassword(username, current);

        const correct = await USERSCH.findOne({ username, password: currPass });
        if (!correct) throw new Error('Wrong Current Password!');
        return await USERSCH.updateOne({ username }, { $set: { password: hashed } });
    };

    const createUser: tCreateUserFunc = async (userData, createdBy) => {
        const { username, password, ...etc } = userData;
        const hashed = makeHashPassword(username, password);
        const resp = await USERSCH.create({ ...etc, username, password: hashed, createdBy });
        const { password: _pswd, ...less } = resp._id;
        return less;
    };

    const createDefaultUser: tCreateDefaultUser = async (password) => {
        const exists = await USERSCH.findOne({ username: DEFAULT_USERNAME });
        if (exists) throw new Error('User Default Exists!');
        return await createUser({
            username: DEFAULT_USERNAME,
            password,
            name: 'Super User',
            level: DEFAULT_LEVEL,
        });
    };

    const paging: tPaging = async (page, perPage, search, level, qry, sort) => {
        const filter = {
            level: { $lte: level },
            $or: [
                { username: new RegExp(search, 'i') },
                { name: new RegExp(search, 'i') },
            ],
            ...qry,
        };
        const currSort = Object.keys(sort).length > 0 ? sort : { _id: -1 };
        return await reqPaging(USERSCH, page, perPage, filter, { ...currSort }, '-password');
    };

    const updateLastLogin: tUpdateLastLogin = async (idUser) => {
        if (!idUser) throw new Error('Not Found User Id!');
        await USERSCH.findByIdAndUpdate(idUser, { lastLogin: moment().toDate() });
    };

    const list: tListUsers = async (page, perPage, search, search2) => {
        const filter: Record<string, unknown> = {};
        if (search) {
            const r = new RegExp(search, 'i');
            filter.$or = [{ username: r }, { name: r }];
        }
        if (search2) {
            try {
                const parsed = JSON.parse(search2) as Record<string, string>;
                for (const key of Object.keys(parsed)) {
                    filter[key] = new RegExp(parsed[key], 'i');
                }
            } catch {
                throw new Error('search2 must be a valid JSON string');
            }
        }
        const skip = (page - 1) * perPage;
        const [data, total] = await Promise.all([
            USERSCH.find(filter, '-password', { skip, limit: perPage, sort: { _id: -1 } }).lean(),
            USERSCH.countDocuments(filter),
        ]);
        return { data, total, page, perPage };
    };

    const getById: tGetUserById = async (id) => {
        const data = await USERSCH.findOne({ _id: id }, '-password').lean();
        if (!data) throw new Error(`User with id ${id} not found`);
        return data;
    };

    const updateById: tUpdateUserById = async (id, data) => {
        const _id = new m.Types.ObjectId(id);
        const setFields: Record<string, unknown> = { ...data };
        if (data.password) {
            const username =
                (data.username as string | undefined) ||
                ((await USERSCH.findOne({ _id }, 'username').lean()) as { username?: string } | null)
                    ?.username;
            if (!username) throw new Error('username is required to hash a new password');
            setFields.password = makeHashPassword(username, data.password as string);
        }
        setFields.updatedAt = new Date();
        const updated = await USERSCH.findOneAndUpdate(
            { _id },
            { $set: setFields },
            { new: true, projection: '-password' }
        );
        if (!updated) throw new Error(`User with id ${id} not found`);
        return updated;
    };

    const deleteById: tDeleteUserById = async (id) => {
        const _id = new m.Types.ObjectId(id);
        const removed = await USERSCH.findOneAndDelete({ _id });
        if (!removed) throw new Error(`User with id ${id} not found`);
        const obj = removed.toObject() as Record<string, unknown>;
        const { password: _pwd, ...safe } = obj;
        return { deleted: true, id, data: safe };
    };

    const hashPassword: tHashPassword = makeHashPassword;

    /**
     * Create a user from a controller request body. The body is already validated by zod,
     * so `username` and `password` are guaranteed to exist. The password is hashed using
     * the same HMAC scheme as the legacy `insert` path, and the persisted document is
     * returned with the password field stripped.
     */
    const create: tCreateFromBody = async (data) => {
        const { username, password, ...rest } = data as {
            username: string;
            password: string;
            [key: string]: unknown;
        };
        if (!username || !password) {
            throw new Error('username and password are required');
        }
        // Pre-flight uniqueness check: the schema has a unique index on `username`,
        // but checking first lets us surface a clean, descriptive error instead of
        // the raw MongoDB duplicate-key (E11000) error.
        const existing = await USERSCH.findOne({ username }).lean();
        if (existing) {
            throw new Error(`User with username "${username}" already exists`);
        }
        const hashed = makeHashPassword(username, password);
        try {
            const doc = await USERSCH.create({ ...rest, username, password: hashed });
            return stripPassword(doc);
        } catch (err: unknown) {
            // Race-condition fallback: if another request inserted the same username
            // between our check and the create, MongoDB will reject with E11000.
            if (
                err &&
                typeof err === 'object' &&
                (err as { code?: number }).code === 11000
            ) {
                throw new Error(`User with username "${username}" already exists`);
            }
            throw err;
        }
    };

    return {
        Login,
        insert,
        update,
        updateProfile,
        changePassword,
        createUser,
        createDefaultUser,
        paging,
        updateLastLogin,
        list,
        getById,
        updateById,
        deleteById,
        hashPassword,
        create,
    };
};
