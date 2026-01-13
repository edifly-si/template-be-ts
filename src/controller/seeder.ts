import {Router} from 'express';
import { CtrlHandler } from './utils';
import { createDefUser } from '../seeder/user';

const rtr=Router();

rtr.get('/user/:pass',(req, res)=>{
    CtrlHandler(req, res, async(body)=>{
        return await createDefUser(req.params.pass);
    });
});

export default rtr;