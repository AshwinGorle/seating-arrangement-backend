import express from 'express'
import ServiceController from '../controllers/serviceController.js';

const serviceRouter = express.Router();

serviceRouter.post('/', ServiceController.createService);
serviceRouter.get('/', ServiceController.getAllService);
serviceRouter.get('/member/:memberId', ServiceController.getServiceByMemberId);
serviceRouter.get('/:serviceId', ServiceController.getServiceById);
serviceRouter.put('/:serviceId', ServiceController.updateServiceById);
serviceRouter.post('/de_allocate/:serviceId', ServiceController.deActivateServiceById);

export default serviceRouter;