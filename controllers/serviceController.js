import ServiceModel, { serviceSchema } from "../models/ServiceModel.js";
import { ServerError } from "../utils/ErrorClasses.js";
import getRequiredOrganizationId from "../utils/getRequiredOrganizationId.js";

class ServiceController {
  static createService = async (options, session) => {
    //  const organizationId = await getRequiredOrganizationId(req, "admin requires organization id to create service" );
    const {
      serviceType,
      renewalPeriodUnit,
      renewalPeriodAmount,
      charges,
      organization,
      seat,
      locker,
      memberId,
    } = options;
    try {
      const newService =  await new ServiceModel ({
        occupant: memberId,
        organization,
        serviceType,
        renewalPeriodUnit,
        renewalPeriodAmount,
        charges,
        seat,
        locker,
      });
      return newService;
    } catch (err) {
      throw new ServerError(err.message);
    }
  };

  static getAllService = async (req, res) => {
    const services = await ServiceModel.find({}).populate("locker seat");
    console.log("all services ---------", services);
  };
}

export default ServiceController;
