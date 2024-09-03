import express from "express";
import AuthController from "../controllers/authController.js";
import restrictTo from '../middlewares/restrictTo.js'

const authRouter  = express.Router();

authRouter.post('/signup', AuthController.signup);
authRouter.post('/login', AuthController.login);
authRouter.post('/send_reset_passwor_link', AuthController.sendResetPasswordEmail);
authRouter.post('/change_password', restrictTo(["all"]) ,AuthController.changePassword);
authRouter.post('/reset_passowrd_with_link/:userId/:token', AuthController.resetPasswordWithLink);
authRouter.get('/reset_passowrd_page/:userId/:token', AuthController.showResetPasswordPage);




export default authRouter;