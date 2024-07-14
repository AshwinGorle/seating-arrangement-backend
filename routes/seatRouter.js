import express from 'express'
import SeatController from '../controllers/seatController.js';
import SeatModel from '../models/SeatModel.js';
import restrictTo from '../middlewares/restrictTo.js';

const seatRouter  = express.Router();

seatRouter.get('/', restrictTo(["all"]), SeatController.getAllSeats);
seatRouter.get('/search', restrictTo(["all"]) ,SeatController.searchSeats);
seatRouter.post('/', restrictTo(["all"]) ,SeatController.createSeat);
seatRouter.post('/create_multiple_seats', restrictTo(["admin", "owner"]) ,SeatController.createMultipleSeats);
seatRouter.delete('/:seatId', restrictTo(["all"]) ,SeatController.deleteSeat);
seatRouter.put('/:seatId', restrictTo(["all"]) ,SeatController.updateSeat);

seatRouter.post('/allocate', restrictTo(["all"]) ,SeatController.allocateSeat);
// seatRouter.post('/de_allocate/:serviceId', restrictTo(["all"]) ,SeatController.deallocateSeatByServiceId);

export default seatRouter;