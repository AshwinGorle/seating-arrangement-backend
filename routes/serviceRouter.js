import express from 'express'
import ServiceController from '../controllers/serviceController.js';
import multer from 'multer';
const serviceRouter = express.Router();
const upload = multer();

serviceRouter.post('/', ServiceController.createService);
serviceRouter.get('/', ServiceController.getAllService);
serviceRouter.get('/member/:memberId', ServiceController.getServiceByMemberId);
serviceRouter.get('/:serviceId', ServiceController.getServiceById);
serviceRouter.put('/:serviceId', upload.none() ,ServiceController.updateServiceById);
serviceRouter.post('/de_allocate/:serviceId', ServiceController.deActivateServiceById);

export default serviceRouter;