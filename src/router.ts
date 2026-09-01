import { Router } from 'express';
import moment from 'moment';
import AuthCtrl from './controller/auth';
import SeederCtrl from './controller/seeder';
import UserController from './controller/users';
import { AuthMiddleware } from './controller/utils';
import { decode } from './library/signer';
import { getVersionHistory } from './library/version';

const rtr = Router();

rtr.get('/', (req, res) => {
    res.json({ error: 0, data: moment().unix() });
});

rtr.get('/version', (req, res) => {
    res.json({ error: 0, data: getVersionHistory() });
});

rtr.use('/auth', AuthCtrl);
rtr.use('/seeder', SeederCtrl);

rtr.use("/api/v1", AuthMiddleware(decode));
rtr.use('/api/v1/users', UserController());

export default rtr;
