import express from 'express'
import ServiceController from '../controllers/serviceController.js';

const serviceRouter = express.Router();

serviceRouter.post('/', ServiceController.createService);
serviceRouter.get('/', ServiceController.getAllService);

export default serviceRouter;