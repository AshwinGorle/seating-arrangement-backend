import express from 'express';
import restrictTo from '../middlewares/restrictTo.js';
import PaymentModel from '../models/PaymentModel.js';
import PaymentController from '../controllers/paymentController.js';
const paymentRouter = express.Router();


paymentRouter.get('/:paymentId', restrictTo(['all']), PaymentController.getPaymentById)
paymentRouter.post('/', restrictTo(['all']), PaymentController.makePayment)
paymentRouter.put('/:paymentId', restrictTo(['all']), PaymentController.updatePaymentById)

export default paymentRouter;