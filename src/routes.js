import { Router } from 'express';
import multer from 'multer';
import multerConfig from './config/multer';
import UserController from './app/controllers/UserController';
import SessionController from './app/controllers/SessionController';
import FileController from './app/controllers/FileController';
import ProviderController from './app/controllers/ProviderController';
import AppointmentsController from './app/controllers/AppointmentsController';
import authMidleware from './app/midlewares/auth';

const routes = new Router();
const upload = multer(multerConfig);

routes.post('/users', UserController.store);
routes.post('/sessions', SessionController.store);

routes.use(authMidleware);

routes.put('/users', UserController.update);
routes.get('/providers', ProviderController.index)
routes.post('/files', upload.single('file'), FileController.store)

routes.get('/appointments', AppointmentsController.index);
routes.post('/appointments', AppointmentsController.store);

export default routes;