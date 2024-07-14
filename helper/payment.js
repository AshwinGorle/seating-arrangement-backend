import { ServerError, UserInputError } from "../utils/ErrorClasses.js";
import PaymentModel from "../models/PaymentModel.js";

export const getPayment = async (paymentId)=>{
    try{
        if(!paymentId) throw new UserInputError("Payment id is required");
        const payment = await PaymentModel.findById(paymentId);
        if(!payment) throw new ServerError("payment not found");
        return payment;
    }
    catch(err){
        throw new ServerError("payment not found");
    }
}
    