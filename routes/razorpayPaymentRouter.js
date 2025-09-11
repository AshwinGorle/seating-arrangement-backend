import express from 'express';
import RazorpayPaymentController from '../controllers/payment/paymentController.js';
import restrictTo from '../middlewares/restrictTo.js';
const razorpayPaymentRouter = express.Router();

//create Account
razorpayPaymentRouter.post('/order',restrictTo(["all"]), RazorpayPaymentController.createOrder );
razorpayPaymentRouter.post('/verify',restrictTo(["all"]), RazorpayPaymentController.verifyPayment );


export default razorpayPaymentRouter;