import { createDefaultUser } from '../model/users';

export const createDefUser = async (password: string) => {
    return await createDefaultUser(password);
};
