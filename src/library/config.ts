import dotenv from 'dotenv';
import moment from 'moment';
import os from 'os';
import path from 'path';
import { cpu } from 'systeminformation';
import { CreateRandomString } from './utils';

dotenv.config();

export interface tdatabase {
    connection: string;
}

interface tserver {
    port: number;
    bind: string;
}

interface tconfig {
    database: tdatabase;
    server: tserver;
    image_path: string;
    file_path: string;
    salt: string;
    isStaging: boolean;
    homePath: string;
    appName: string;
    podName: string;
    version: string;
    buildTime: string;
    privateKey: string;
    publicKey: string;
}

const getHomeDir = (): string => os.homedir();

export const getOsPlatform = (): string => os.platform();

export const getCPU = async () => {
    return await cpu();
};

const getEnv = (name: string, defValue: string): string => {
    return process.env[name] || defValue;
};

const getEnvNumber = (name: string, defValue: number): number => {
    const raw = process.env[name];
    if (raw === undefined || raw === '') return defValue;
    const parsed = Number(raw);
    return Number.isFinite(parsed) ? parsed : defValue;
};

const getEnvBool = (name: string, defValue: boolean): boolean => {
    const raw = process.env[name];
    if (raw === undefined || raw === '') return defValue;
    return raw.toLowerCase() === 'true' || raw === '1';
};

const getEnvPath = (name: string, defValue: string): string => {
    const raw = getEnv(name, defValue);
    return path.isAbsolute(raw) ? raw : path.resolve(process.cwd(), raw);
};

const getDefaultConfig = (): tconfig => ({
    database: {
        connection: '',
    },
    server: {
        bind: '0.0.0.0',
        port: 11611,
    },
    image_path: '/images/',
    file_path: path.resolve(process.cwd(), 'documents'),
    salt: CreateRandomString(24),
    isStaging: false,
    homePath: getHomeDir(),
    appName: 'appname',
    podName: CreateRandomString(6),
    version: '0.0.0',
    buildTime: moment().date().toString(),
    privateKey: '',
    publicKey: '',
});

export const getConfigFile = (): tconfig => {
    const defCfg = getDefaultConfig();

    const cfg: tconfig = {
        ...defCfg,
        server: {
            bind: getEnv('IP', defCfg.server.bind),
            port: getEnvNumber('PORT', defCfg.server.port),
        },
        database: {
            connection: getEnv('DATABASE_CONNECTION', 'mongodb://localhost:27017/default'),
        },
        file_path: getEnvPath('FILE_PATH', defCfg.file_path),
        salt: getEnv('SALT', CreateRandomString(24)),
        appName: getEnv('NAME', defCfg.appName),
        privateKey: getEnv('PRIVATE_KEY', defCfg.privateKey),
        publicKey: getEnv('PUBLIC_KEY', defCfg.publicKey),
    };
    return cfg;
};
