import express from 'express'
import LokerController from '../controllers/lockerController.js';
import restrictTo from '../middlewares/restrictTo.js';

const lokerRouter = express.Router();

lokerRouter.get('/', restrictTo(["all"]) ,LokerController.getAllLokers);
lokerRouter.post('/', restrictTo(["all"]) ,LokerController.createLocker);

export default lokerRouter;