import { NextFunction, Request, Response, Router } from "express";
import moment from "moment";
import m, { Model } from "mongoose";
import { DecodeFunction, RefreshTokenFunction } from "../library/base_signer";
import { getConfigFile } from "../library/config";
import { CreateRandomString, createLog } from "../library/utils";
import { tUserIntf } from "../model/base_users";
import { createModel } from "../model/utils";

export const AuthMiddleware =
    (decode: DecodeFunction) =>
        (req: Request, res: Response, next: NextFunction) => {
            const authHeader: string = process.env.AUTHHEADER || "srawung-token";
            const aToken = req.headers[authHeader] || req.query?.token || "";
            if (!aToken) {
                res.json({ error: 403, message: "Forbidden!" });
                return;
            }
            const start = Date.now();
            res.set("before-token-timestamps", `${start}`);
            const uData = decode(`${aToken}`);
            if (!uData) {
                res.json({
                    error: 401,
                    message: "Auth Token Invalid or Expired!",
                });
                return;
            }
            res.locals.udata = { ...uData };
            res.locals.token = aToken;
            const end = Date.now();
            res.set("after-token-timestamps", `${end}`);
            res.set("token-time-ms", `${end - start}`);
            next();
        };

export const RestApiMiddleware = (
    _req: Request,
    _res: Response,
    next: NextFunction
) => {
    next();
};

type tCallbackHandler = (body: any) => any;

export const CtrlHandler = async (
    req: Request,
    res: Response,
    callback: tCallbackHandler,
    httpErrorCode: boolean = false
) => {
    const jres = {
        error: 0,
        data: [] as any,
        message: "",
        stack: {} as Record<string, unknown>,
        errorName: "",
    };
    const start = Date.now();
    res.set("before-exec-timestamps", `${start}`);
    try {
        jres.data = await callback(req.body);
    } catch (error: any) {
        if (!httpErrorCode) {
            jres.error = 500;
            jres.message = error.message;
            jres.errorName = error.name;
        } else {
            res.status(500).send(error.message);
        }
    }
    if (jres.data !== undefined) {
        const end = Date.now();
        res.set("after-exec-timestamps", `${end}`);
        res.set("execution-time-ms", `${end - start}`);
        res.json(jres);
    }
};

type tBeforeSaveData = (
    data: object,
    level: number,
    uid: string,
    req: Request
) => Promise<object>;
type tBeforeRead = (
    search: string,
    search2: string,
    filter: object
) => Promise<object>;
type tAfterSave = (data: object) => Promise<object>;
type tBeforeInq = (data: object, userData?: object) => Promise<object>;
type tBeforeDetailResp = (
    data: object,
    isMultiple: boolean,
    uid: string
) => Promise<object>;
type tAddAuthQry = (udata: object) => Promise<object>;
type tAfterInq = (inqData: object) => Promise<object>;

export interface tCrudFunctionCallback {
    beforeSaveData?: tBeforeSaveData;
    beforeRead?: tBeforeRead;
    afterSave?: tAfterSave;
    beforeInq?: tBeforeInq;
    beforeDetailResponse?: tBeforeDetailResp;
    addAuthQry?: tAddAuthQry;
    afterInq?: tAfterInq;
}

export const createCrudController = (
    schema: Model<any>,
    level: number = 0,
    defSearch: Array<string> = [],
    sort: object = { _id: -1 },
    projector: string = "",
    initialFilter: object = {},
    crudCallback?: tCrudFunctionCallback
): Router => {
    const rtr = Router();
    const {
        addAuthQry,
        afterInq,
        afterSave,
        beforeDetailResponse,
        beforeInq,
        beforeRead,
        beforeSaveData,
    } = crudCallback || {};
    const { insert, reqPaging, update } = createModel(schema);

    const buildSearchFilter = async (
        search: string,
        search2: string,
        baseFilter: object
    ): Promise<object> => {
        if (typeof beforeRead === "function") {
            return await beforeRead(search, search2, baseFilter);
        }
        let filter: any = { ...baseFilter };
        if (search) {
            const r = new RegExp(search, "i");
            const orClauses = defSearch.map((f) => ({ [f]: r }));
            filter = { ...filter, $or: orClauses };
        }
        if (search2) {
            const f = JSON.parse(search2);
            const regexFilter: Record<string, RegExp> = {};
            for (const key of Object.keys(f)) {
                regexFilter[key] = new RegExp(f[key], "i");
            }
            filter = { ...filter, ...regexFilter };
        }
        return filter;
    };

    rtr.get("/", (req, res) => {
        CtrlHandler(req, res, async () => {
            const search = req.query.search as string;
            const search2 = req.query.search2 as string;
            const page = req.query.page as string;
            const perPage = req.query.perPage as string;
            const filter = await buildSearchFilter(search, search2, { ...initialFilter });
            return await reqPaging(
                schema,
                parseInt(page),
                parseInt(perPage),
                filter,
                sort,
                projector
            );
        });
    });

    rtr.post("/", (req, res) => {
        CtrlHandler(req, res, async (body) => {
            const { _id: uid } = res.locals.udata;
            let data = body;
            if (typeof beforeSaveData === "function") {
                data = await beforeSaveData(data, level, uid, req);
            }

            const { _id } = data;
            if (_id) {
                let saved = await update(
                    { ...data, updatedAt: new Date() },
                    _id
                );
                if (typeof afterSave === "function") {
                    saved = await afterSave(saved);
                }
                return saved;
            }
            let saved = await insert(data, uid);
            if (typeof afterSave === "function") {
                saved = await afterSave(saved);
            }
            return saved;
        });
    });

    const cleanQry = (qry: Record<string, any>) => {
        const result: Record<string, any> = {};
        for (const key of Object.keys(qry)) {
            const v = qry[key];
            if (key.indexOf("$") >= 0) continue;
            if (key === "timestamp") continue;
            result[key] = v;
        }
        return result;
    };

    rtr.get("/pagination", (req, res) => {
        CtrlHandler(req, res, async () => {
            const search = req.query.search as string;
            const page = req.query.page as string;
            const perPage = req.query.perPage as string;

            const offset = (parseInt(page) - 1) * parseInt(perPage);

            const authQry = typeof addAuthQry === "function"
                ? await addAuthQry(res.locals.udata)
                : {};
            let filter: any = { ...initialFilter, ...authQry };

            const jsSearch = JSON.parse(search);
            const f = cleanQry(jsSearch);
            const qry: Record<string, any> = {};
            for (const key of Object.keys(f)) {
                const v = f[key];
                if (v) qry[key] = v;
            }
            const inq = (typeof beforeInq === "function" && (await beforeInq(qry))) || qry;
            filter = { ...filter, ...inq };

            const findOptions = {
                limit: parseInt(perPage) || 10,
                skip: offset,
            };

            if (filter["$text"]) {
                const iData = await schema.find(
                    filter,
                    { score: { $meta: "textScore" } },
                    { ...findOptions, sort: { score: { $meta: "textScore" } } }
                );
                const data = (typeof afterInq === "function" && (await afterInq(iData))) || iData;
                const total = await schema.estimatedDocumentCount(filter);
                const subTotal = await schema.countDocuments(filter);
                return { data, subTotal, total };
            }
            const iData = await schema.find(filter, "", { ...findOptions, sort });
            const data = (typeof afterInq === "function" && (await afterInq(iData))) || iData;
            const total = await schema.estimatedDocumentCount(filter);
            if (JSON.stringify(filter) !== "{}") {
                const subTotal = await schema.countDocuments(filter);
                return { data, subTotal, total };
            }
            return { data, subTotal: total, total };
        });
    });

    rtr.get("/inquiry", (req, res) => {
        CtrlHandler(req, res, async () => {
            const search = req.query.search as string;
            let filter: any = { ...initialFilter };
            const f = JSON.parse(search);
            const qry = f;
            const inq = (typeof beforeInq === "function" && (await beforeInq(qry, res.locals.udata))) || qry;
            filter = { ...filter, ...inq };
            const data = await schema.find(filter, "", { sort });
            return (typeof afterInq === "function" && (await afterInq(data))) || data;
        });
    });

    rtr.get("/detail/:id", (req, res) => {
        CtrlHandler(req, res, async () => {
            const { id } = req.params;
            const { _id: uid } = res.locals.udata;
            const data = await schema.findOne({ _id: id });
            return (typeof beforeDetailResponse === "function" && (await beforeDetailResponse(data, false, uid))) || data;
        });
    });

    rtr.get("/detail/:field/:id", (req, res) => {
        CtrlHandler(req, res, async () => {
            const { id, field } = req.params;
            const { _id: uid } = res.locals.udata;
            const value = new m.Types.ObjectId(id);
            const data = await schema.find({ [field]: value }, "", {
                sort: { _id: -1 },
            });
            return (typeof beforeDetailResponse === "function" && (await beforeDetailResponse(data, true, uid))) || data;
        });
    });

    return rtr;
};

export const generateUniqueName = () => {
    return `${moment().unix()}_${CreateRandomString(10)}`;
};

export const createFile = (file: any) => {
    const { name } = file;
    const frag = name.split(".");
    const ext = frag.pop();
    const nm = frag.join(".");
    const imagePath = getConfigFile().image_path;
    const filename = `${generateUniqueName()}_${nm}.${ext}`;
    file.mv(`${imagePath}/${filename}`);
    return filename;
};

export interface tColumn {
    title: string;
    name: string;
    field: string;
    type: string;
    align?: string;
    format?: string;
}
type tGetReportFunc = (
    schema: Model<any>,
    req: Request,
    res: Response,
    first_date: string,
    last_date?: string
) => Promise<object>;

export const createReportCtrl = (
    schema: Model<any>,
    type: string = "daily",
    columns: Array<tColumn> = [],
    getReport: tGetReportFunc
) => {
    const rtr = Router();
    const header = columns.map(({ title }) => title);
    const fields = columns.map(({ title, ...rest }) => ({ ...rest }));
    if (type === "daily") {
        rtr.get("/:first_date/:last_date", (req, res) => {
            CtrlHandler(req, res, async () => {
                const { first_date, last_date } = req.params;
                const data = await getReport(
                    schema,
                    req,
                    res,
                    first_date,
                    last_date
                );
                return { data, header, fields };
            });
        });
    } else {
        rtr.get("/:month", (req, res) => {
            CtrlHandler(req, res, async () => {
                const { month } = req.params;
                if (typeof getReport === "function") {
                    const data = await getReport(schema, req, res, month);
                    return { data, header, fields };
                }
                throw new Error("Report callback function not found!");
            });
        });
    }

    return rtr;
};

export const createAuthController = (
    model: tUserIntf,
    decoder: DecodeFunction,
    refreshToken: RefreshTokenFunction,
    _CaptchaCache: any
) => {
    const {
        changePassword,
        createDefaultUser,
        Login,
        updateProfile,
        updateLastLogin,
    } = model;
    const rtr = Router();

    rtr.post("/login", (req, res) => {
        CtrlHandler(req, res, async (body) => {
            const { username, password } = body;
            try {
                const [token, udata] = await Login(username, password);

                await updateLastLogin(udata);
                createLog(udata._id, `Login Success For User ${username}`, req);
                return token;
            } catch (error) {
                createLog(undefined, `Login Failed For User ${username}`, req);
                throw error;
            }
        });
    });

    rtr.use("/logout", AuthMiddleware(decoder));
    rtr.use("/refreshToken", AuthMiddleware(decoder));
    rtr.use("/profile", AuthMiddleware(decoder));
    rtr.use("/changePassword", AuthMiddleware(decoder));
    rtr.use("/me", AuthMiddleware(decoder));

    rtr.get("/logout", (req, res) => {
        CtrlHandler(req, res, async () => {
            const { _id: userId, username } = res.locals.udata;
            createLog(userId, `${username} Logout`, req);
            return true;
        });
    });

    rtr.get("/refreshToken", (req, res) => {
        CtrlHandler(req, res, async () => {
            return refreshToken(res.locals.token);
        });
    });

    rtr.get("/me", (req, res) => {
        CtrlHandler(req, res, async () => {
            return res.locals.udata;
        });
    });

    rtr.post("/profile", (req, res) => {
        CtrlHandler(req, res, async (body) => {
            const { _id, username } = res.locals.udata;
            createLog(_id, `Update Profile for ${username}`, req);
            return await updateProfile(_id, body);
        });
    });

    rtr.post("/changePassword", (req, res) => {
        CtrlHandler(req, res, async (body) => {
            const { username, _id } = res.locals.udata;
            const { password, current } = body;
            await changePassword(username, current, password);
            createLog(_id, `Change password for ${username}`, req);
            return password;
        });
    });

    return rtr;
};
