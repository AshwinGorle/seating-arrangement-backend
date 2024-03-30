import express from 'express';
import AccountController from '../controllers/accountController.js';
import restrictTo from '../middlewares/restrictTo.js';
const accountRouter = express.Router();

//create Account
accountRouter.post('/:memberId',restrictTo(["all"]), AccountController.createAccount );
accountRouter.get('/',restrictTo(["all"]), AccountController.getAllAccount );


export default accountRouter;