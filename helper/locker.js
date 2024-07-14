import LockerModel from "../models/LockerModel.js";
import MemberModel from "../models/MemberModel.js";
import { ServerError } from "../utils/ErrorClasses.js";


export const getLocker = async (lockerId)=>{
    try{
        const locker = await LockerModel.findById(lockerId);
        if(!locker) throw new ServerError("locker not found");
        return locker;
    }
    catch(err){
        throw new ServerError("locker not found");
    }
}
    