import { ServerError } from "../utils/ErrorClasses.js";
import ServiceModel from "../models/ServiceModel.js";

export const getService = async (serviceId)=>{
    try{
        if(!service) throw new ServerError("service not found");
        const service = await ServiceModel.findById(serviceId).populate(
            "locker seat"
          );
        return service;
    }
    catch(err){
        throw new ServerError("service not found");
    }
}
    