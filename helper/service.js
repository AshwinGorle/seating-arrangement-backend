import { ServerError } from "../utils/ErrorClasses.js";
import ServiceModel from "../models/ServiceModel.js";

export const getService = async (serviceId)=>{
    try{
        if(!serviceId) throw new ServerError("serviceId is required");
        const service = await ServiceModel.findById(serviceId).populate(
            "locker seat"
          );
        if(!service) throw new ServerError('service not found');  
        return service;
    }
    catch(err){
        throw new ServerError("service not found");
    }
}
    