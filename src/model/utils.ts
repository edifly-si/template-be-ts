import m, { Model } from 'mongoose';

export const reqPaging = async (
    schema: Model<any>,
    page: number,
    perPage: number,
    filter: object = {},
    sort: object = { _id: -1 },
    projection: string = ''
) => {
    const offset = (page - 1) * perPage;
    const data = await schema.find(filter, projection, { skip: offset, limit: perPage, sort });
    const total = await schema.estimatedDocumentCount({});
    return { data, total };
};

export const createModel = (schema: Model<any>) => {
    const insert = async (body: object, uid: string) => {
        const createdBy = new m.Types.ObjectId(uid);
        return await schema.create({ ...body, createdBy });
    };

    const update = async (body: object, id: string) => {
        const _id = new m.Types.ObjectId(id);
        return await schema.findOneAndUpdate({ _id }, { $set: { ...body } }, { new: true });
    };

    return { insert, update, reqPaging };
};

interface tquery {
    search: string;
    page: number;
    perPage: number;
}

export const pagination = async (schema: Model<any>, defSearch: string[] = [], query: tquery) => {
    const { search, page, perPage } = query;
    const { reqPaging } = createModel(schema);
    let filter: any = {};
    if (search) {
        const r = new RegExp(search, 'i');
        const o = defSearch.map((f) => ({ [f]: new RegExp(r, 'i') }));
        filter = { ...filter, $or: o };
    }
    return await reqPaging(schema, page, perPage, filter);
};
