import express from 'express'
import LokerController from '../controllers/lockerController.js';
import restrictTo from '../middlewares/restrictTo.js';

const lokerRouter = express.Router();

lokerRouter.get('/', restrictTo(["all"]) ,LokerController.getAllLockers);
lokerRouter.get('/:lockerId', restrictTo(["all"]) ,LokerController.getLockerById);
lokerRouter.post('/', restrictTo(["all"]) ,LokerController.createLocker);
lokerRouter.post('/allocate', restrictTo(["all"]) ,LokerController.allocateLockerToMember);
lokerRouter.post('/de_allocate', restrictTo(["all"]) ,LokerController.deallocateLockerById);

lokerRouter.delete('/:lockerId', restrictTo(["all"]) ,LokerController.deleteLocker);
lokerRouter.put('/:lockerId', restrictTo(["all"]) ,LokerController.updateLocker);

export default lokerRouter;