import express from "express";
import AuthController from "../controllers/authController.js";
import restrictTo from '../middlewares/restrictTo.js'

const authRouter  = express.Router();

authRouter.post('/signup', AuthController.signup);
authRouter.post('/verify_email', AuthController.verifyEmail);
authRouter.post('/resend_otp', AuthController.resendOtp);
authRouter.post('/send_reset_password_mail', AuthController.sendResetPasswordEmail);
authRouter.post('/reset_password_with_otp', AuthController.resetPasswordWithOtp);
authRouter.post('/change_password' ,AuthController.changePassword);  // have to add restrictTo(["all"])
authRouter.post('/login', AuthController.login);

authRouter.post('/send_reset_passwor_link', AuthController.sendResetPasswordEmail);
authRouter.post('/reset_passowrd_with_link/:userId/:token', AuthController.resetPasswordWithLink);
authRouter.get('/reset_passowrd_page/:userId/:token', AuthController.showResetPasswordPage);




export default authRouter;