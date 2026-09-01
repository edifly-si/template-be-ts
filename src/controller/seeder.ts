import { Router } from 'express';
import { createDefUser } from '../seeder/user';
import { CtrlHandler } from './utils';

const rtr = Router();

rtr.get('/user/:pass', (req, res) => {
    CtrlHandler(req, res, async () => {
        return await createDefUser(req.params.pass);
    });
});

export default rtr;
