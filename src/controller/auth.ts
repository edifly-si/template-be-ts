import {Router} from 'express';
import { CtrlHandler } from './utils';

const rtr=Router();

rtr.post('/login',(req, res)=>{
    CtrlHandler(req, res, async(body)=>{
        res.status(500).send('error')
        return body;
    })
})

export default rtr;