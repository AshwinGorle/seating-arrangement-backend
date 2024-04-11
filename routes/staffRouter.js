import express from 'express'
import StaffController from '../controllers/staffController.js';
import restrictTo from '../middlewares/restrictTo.js';
const staffRouter = express.Router();

staffRouter.get('/',restrictTo(["admin", "owner"]),StaffController.getAllStaff);
staffRouter.get('/:staffId',restrictTo(["admin", "owner"]),StaffController.getStaffById);
staffRouter.post('/',restrictTo(["admin", "owner"]),StaffController.createStaff);
staffRouter.put('/:staffId',restrictTo(["admin", "owner"]),StaffController.updateStaffById);

export default staffRouter;