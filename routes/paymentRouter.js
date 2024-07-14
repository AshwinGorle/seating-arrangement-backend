import express from 'express';
import restrictTo from '../middlewares/restrictTo.js';
import PaymentModel from '../models/PaymentModel.js';
import PaymentController from '../controllers/paymentController.js';
const paymentRouter = express.Router();

//get all payment of a member
paymentRouter.get('/service/:serviceId', restrictTo(['all']), PaymentController.getAllPaymentsByServiceId)
paymentRouter.get('/member/:memberId', restrictTo(['all']), PaymentController.getAllPaymentsOfMember)
paymentRouter.get('/', restrictTo(['all']), PaymentController.getAllPayment)
paymentRouter.get('/:paymentId', restrictTo(['all']), PaymentController.getPaymentById)
paymentRouter.post('/', restrictTo(['all']), PaymentController.makePayment)
paymentRouter.post('/complete', restrictTo(['all']), PaymentController.completePayment);
paymentRouter.put('/:paymentId', restrictTo(['all']), PaymentController.updatePaymentById)
paymentRouter.delete('/:paymentId', restrictTo(['all']), PaymentController.deletePaymentById)

export default paymentRouter;
