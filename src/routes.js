import { Router } from 'express';
import multer from 'multer';
import multerConfig from './config/multer';
import UserController from './app/controllers/UserController';
import SessionController from './app/controllers/SessionController';
import authMidleware from './app/midlewares/auth';

const routes = new Router();
const upload = multer(multerConfig);

routes.post('/users', UserController.store);
routes.post('/sessions', SessionController.store);

routes.use(authMidleware);
routes.put('/users', UserController.update);


routes.post('/files', upload.single('file'), (req, res) => {
    return res.json({ok: true});
})

export default routes;