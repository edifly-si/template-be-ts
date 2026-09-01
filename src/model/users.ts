import { signer } from "../library/signer";
import USERSCH from "../schema/users";
import BaseUser, { tUserIntf } from "./base_users";

const userModel = BaseUser(USERSCH, "SALT", signer);
export const {
    Login,
    changePassword,
    create,
    createDefaultUser,
    createUser,
    deleteById,
    getById,
    hashPassword,
    insert,
    list,
    paging,
    update,
    updateById,
    updateProfile,
} = userModel;

export type { tUserIntf };

export default userModel;
