import express from 'express'
import restrictTo from '../middlewares/restrictTo.js';
import TestingController from '../controllers/testingController.js';
const testingRouter = express.Router();

testingRouter.get("/delete_all_staff", restrictTo(["admin"]) ,TestingController.deleteAllStaff);


export default testingRouter