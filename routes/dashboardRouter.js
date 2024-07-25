import express from 'express';
import restrictTo from '../middlewares/restrictTo.js';
import DashboardController from '../controllers/dashboardController.js';
const dashboardRouter = express.Router();


dashboardRouter.get('/payments', restrictTo(['all']), DashboardController.getPaymentsOverview);
dashboardRouter.get('/members', restrictTo(['all']), DashboardController.getMembersOverview);
dashboardRouter.get('/seats', restrictTo(['all']), DashboardController.getSeatsOverview);
dashboardRouter.get('/lockers', restrictTo(['all']), DashboardController.getLockersOverview);

