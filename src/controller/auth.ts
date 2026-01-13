import { createAuthController } from './utils';
import UserModel from '../model/users';
import { decode, refreshToken } from '../library/signer';

const rtr = createAuthController(UserModel, decode, refreshToken, {});

export default rtr;