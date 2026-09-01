import jwt from 'jsonwebtoken';

export type DecodeFunction = (aToken: string) => any;
export type SignerFunction = (uData: any) => string;
export type RefreshTokenFunction = (aToken: string) => string;
export type VerifyTokenFunction = (aToken: string) => boolean;

export default (
    privateKey: string,
    publicKey: string,
    signerOptions: jwt.SignOptions
) => {
    const verifyToken = (aToken: string): boolean => {
        return !!jwt.verify(aToken, publicKey, signerOptions);
    };

    const signer: SignerFunction = (uData) => {
        return jwt.sign(uData, privateKey, signerOptions);
    };

    const decode: DecodeFunction = (aToken) => {
        try {
            return verifyToken(aToken) && jwt.decode(aToken, { complete: false });
        } catch {
            return false;
        }
    };

    const refreshToken: RefreshTokenFunction = (aToken) => {
        const decoded = decode(aToken) || {};
        const { aud: _a, exp: _e, iat: _i, sub: _s, ...uData } = decoded;
        return uData && signer(uData);
    };

    return { verifyToken, signer, decode, refreshToken };
};
