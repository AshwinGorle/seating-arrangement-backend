import { ServerError, UserInputError } from "../utils/ErrorClasses.js";
import SeatModel from "../models/SeatModel.js";

export const getSeat = async (seatId)=>{
    try{
        if(!seatId) throw new UserInputError("Payment id is required");
        const seat = await SeatModel.findById(seatId);
        if(!seat) throw new ServerError("seat not found");
        return seat;
    }
    catch(err){
        throw new ServerError("seat not found");
    }
}
    