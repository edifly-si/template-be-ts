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

    const stripPassword = (resp: any): Omit<any, 'password'> => {
        const { password: _pwd, ...result } = resp;
        return result;
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
        await USERSCH.findByIdAndUpdate(idUser, { last_login: moment().toDate() });
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
    };
};
