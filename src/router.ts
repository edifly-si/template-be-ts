import { Router } from 'express';
import moment from 'moment';
import AuthCtrl from './controller/auth';
import SeederCtrl from './controller/seeder';

const rtr = Router();

rtr.get('/', (req, res) => {
    res.json({ error: 0, data: moment().unix() });
})

rtr.use('/auth', AuthCtrl);
rtr.use('/seeder', SeederCtrl);

export default rtr;