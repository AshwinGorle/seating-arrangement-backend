import express from 'express'
import LockerController from '../controllers/lockerController.js';
import restrictTo from '../middlewares/restrictTo.js';

const lockerRouter = express.Router();

lockerRouter.get('/', restrictTo(["all"]), LockerController.getAllLockers);
lockerRouter.post('/', restrictTo(["all"]), LockerController.createLocker);
lockerRouter.post('/allocate', restrictTo(["all"]), LockerController.allocateLockerToMember);
lockerRouter.post('/de_allocate/:lockerId', restrictTo(["all"]), LockerController.deallocateLockerById);

lockerRouter.delete('/:lockerId', restrictTo(["all"]), LockerController.deleteLocker);
lockerRouter.put('/:lockerId', restrictTo(["all"]), LockerController.updateLocker);


export default lockerRouter;