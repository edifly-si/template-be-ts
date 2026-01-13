import BaseSigner from './base_signer';
import dotenv from 'dotenv';

dotenv.config();

const privateKeyBase64 = process.env['PRIVATE_KEY']
const publicKeyBase64 = process.env['PUBLIC_KEY']
if (!privateKeyBase64 || !publicKeyBase64) {
    throw new Error("No Key Found");
}
const privateKey = Buffer.from(privateKeyBase64, 'base64').toString('utf-8');
const publicKey = Buffer.from(publicKeyBase64, 'base64').toString('utf-8');
const signerOptions = { expiresIn: '8h', audience: 'HKNet', subject: 'hknet@edifly-si.sys', algorithm: 'RS256' };

const sign = BaseSigner(privateKey, publicKey, signerOptions);

export const { decode, refreshToken, signer, verifyToken } = sign;