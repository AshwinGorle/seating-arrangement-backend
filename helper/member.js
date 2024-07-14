import MemberModel from "../models/MemberModel.js";
import { ServerError, UserInputError } from "../utils/ErrorClasses.js";


export const getMember = async (memberId)=>{
    try{
        if(!memberId) throw new UserInputError("Member id is not provided");
        const member = await MemberModel.findById(memberId);
        if(!member) throw new ServerError("Member not found");
        return member;
    }
    catch(err){
        throw new ServerError("Member not found");
    }
}
    