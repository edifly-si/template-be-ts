import { Request, Response, Router } from 'express';
import { validate } from '../library/zod';
import UserModel, { tUserIntf } from '../model/users';
import {
    CreateUserBody,
    createUserBodySchema,
    DeleteUserBody,
    deleteUserBodySchema,
    GetUserByIdParams,
    getUserByIdParamsSchema,
    ListUsersQuery,
    listUsersQuerySchema,
    UpdateUserBody,
    updateUserBodySchema,
} from '../validator/users';
import { CtrlHandler } from './utils';

/** Users controller: list/getById/updateById/deleteById via GET/POST. Data via model; zod validates. */
export const userController = (userModel: tUserIntf = UserModel): Router => {
    const rtr = Router();

    /** GET / - paginated list of users. */
    rtr.get(
        '/',
        validate(listUsersQuerySchema, 'query'),
        (req: Request, res: Response) => {
            CtrlHandler(req, res, async () => {
                const { search, search2, page, perPage } = req.query as unknown as ListUsersQuery;
                return await userModel.list(page, perPage, search, search2);
            });
        }
    );

    /** POST /create - create a new user. */
    rtr.post(
        '/',
        validate(createUserBodySchema, 'body'),
        (req: Request, res: Response) => {
            CtrlHandler(req, res, async () => {
                const body = req.body as CreateUserBody;
                return await userModel.create(body as unknown as Record<string, unknown>);
            });
        }
    );

    /** GET /detail/:id - fetch a single user by id. */
    rtr.get(
        '/detail/:id',
        validate(getUserByIdParamsSchema, 'params'),
        (req: Request, res: Response) => {
            CtrlHandler(req, res, async () => {
                const { id } = req.params as unknown as GetUserByIdParams;
                return await userModel.getById(id);
            });
        }
    );

    /** POST /update/:id - update an existing user. */
    rtr.post(
        '/update/:id',
        validate(getUserByIdParamsSchema, 'params'),
        validate(updateUserBodySchema, 'body'),
        (req: Request, res: Response) => {
            CtrlHandler(req, res, async () => {
                const { id } = req.params as unknown as GetUserByIdParams;
                const body = req.body as UpdateUserBody;
                return await userModel.updateById(id, body as unknown as Record<string, unknown>);
            });
        }
    );

    /** POST /delete - delete a user by id carried in the body (POST-only). */
    rtr.post(
        '/delete',
        validate(deleteUserBodySchema, 'body'),
        (req: Request, res: Response) => {
            CtrlHandler(req, res, async () => {
                const { id } = req.body as DeleteUserBody;
                return await userModel.deleteById(id);
            });
        }
    );

    return rtr;
};

export default userController;
