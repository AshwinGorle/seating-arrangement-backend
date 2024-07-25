import ServiceModel, { serviceSchema } from "../models/ServiceModel.js";
import { ServerError } from "../utils/ErrorClasses.js";
import getRequiredOrganizationId from "../utils/getRequiredOrganizationId.js";
import mongoose from "mongoose";
import SeatModel from "../models/SeatModel.js";
import MemberModel from "../models/MemberModel.js";
import authorizeActionInOrganization from "../utils/authorizeActionInOrganization.js";
import { memoryStorage } from "multer";
import { getService } from "../helper/service.js";
import { validateDuration } from "../utils/validation.js";
import { getSeat } from "../helper/seat.js";
import { getLocker } from "../helper/locker.js";
import { getMember } from "../helper/member.js";
import PaymentModel from "../models/PaymentModel.js";

class ServiceController {
  static getAllService = async (req, res) => {
    try {
      const organiationId = getRequiredOrganizationId(
        req,
        "you are not authorized to get the services of this org"
      );
      const services = await ServiceModel.find({
        organization: organiationId,
      }).populate("locker seat");
      res.status(200).json(services);
    } catch (err) {
      res.status(500).send({ status: "failed", message: err.message });
      console.log("getAllService Error : ", err);
    }
  };

  static getServiceByMemberId = async(req, res)=>{
      const {memberId} = req.params;
      console.log("memberID", memberId)
      try{
        const member = await getMember(memberId);
        const services = await ServiceModel.find({organization : member.organization, occupant:memberId}).populate("locker seat");
        if(services.length > 0){
          const allMemberPayments = await PaymentModel.find({chargedOn : member._id});
          console.log("all-member-payments-details", allMemberPayments);
          services.map((service)=>{
            service.renewalPayments = allMemberPayments.filter((payment => payment.service.toString() == service._id.toString()));
          })
        }
        res.status(200).json({status : "success", message : 'services fetched successfully', data : services });
      }catch(err){
        res.status(500).send({ status: "failed", message: err.message });
        console.log("getServiceByMemberId Error : ", err);
      }
  }

  static getServiceById = async (req, res) => {
    try {
      const { serviceId } = req.params;
      if(!serviceId) throw new ServerError("Service Id needed")
      const services = await ServiceModel.findById(serviceId);
      res.status(200).json({
        status: "success",
        message: "service fetched successfully!",
        data: services,
      });
    } catch (err) {
      res.status(500).send({ status: "failed", message: err.message });
      console.log("getAllService Error : ", err);
    }
  };

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
      occupant,
    } = options;
    console.log("option before creation", options);
    try {
      await ServiceModel.create(
        [
          {
            occupant,
            organization,
            serviceType,
            renewalPeriodUnit,
            renewalPeriodAmount,
            charges,
            seat,
            locker,
          },
        ],
        { session }
      );
    } catch (err) {
      throw new ServerError(err.message);
    }
  };

  static deactivateService = async (
    serviceToDeActivate,
    member,
    seat,
    session
  ) => {
    try {
      if (serviceToDeActivate.status != "active")
        throw new ServerError("Service is already inactive");
      if (serviceToDeActivate.seat) {
        const seat = await getSeat(serviceToDeActivate.seat);
        for (const key in seat?.schedule) {
          if (
            seat.schedule[key]?.occupant?.toString() == member._id?.toString()
          ) {
            seat.schedule[key].occupant = null;
          }
        }
        await seat.save({ session });
      }

      if (serviceToDeActivate.locker) {
        const locker = await getLocker(serviceToDeActivate.locker);
        locker.occupant = null;
        locker.save({ session });
      }

      await ServiceModel.findByIdAndUpdate(
        serviceToDeActivate._id,
        { status: "inactive" },
        { session }
      );
    } catch (err) {
      throw new ServerError(err.message);
    }
  };

  static deActivateServiceById = async (req, res) => {
    const { serviceId } = req.params;
    const session = await mongoose.startSession(); // Fixed session creation
    session.startTransaction();

    try {
      const serviceToDeAllocate = await getService(serviceId);
      // console.log("service to delete--------", serviceToDeAllocate)
      let member = await getMember(serviceToDeAllocate.occupant);
      member = await member.populate('payments')
      // console.log('payments------', member);

      const prevPendingPayments = member.payments.filter(
        (payment) =>
          payment.status == "pending" &&
          payment.service.toString() == serviceToDeAllocate._id.toString()
      );

      // console.log("prevPendingPayments", prevPendingPayments);

      if(prevPendingPayments.length != 0) throw new ServerError("Can't deactivate service . it has pending payments")
      
      await ServiceController.deactivateService(
        serviceToDeAllocate,
        member,
        session
      );

      await session.commitTransaction();
      await session.endSession(); // Fixed session end

      return res.status(200).json({
        status: "success",
        message: "Seat deallocated successfully",
        data : serviceToDeAllocate
      });
    } catch (err) {
      await session.abortTransaction();
      await session.endSession(); // Fixed session end

      console.error("delete service error", err);
      return res.status(500).json({
        status: "failed",
        message: err.message,
      });
    }
  };

  static updateServiceById = async (req, res) => {
    const { serviceId } = req.params;
    console.log("service id : ", serviceId);
    const { renewalPeriodUnit, renewalPeriodAmount, charges } = req.body;
    console.log("update-service-data-from-front-end", req.body);
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      validateDuration(req);
      const service = await getService(serviceId);
      const updatedService = await ServiceModel.findByIdAndUpdate(
        serviceId,
        { renewalPeriodUnit, renewalPeriodAmount, charges },
        { new: true }
      ).session(session);
      res.status(200).send({
        status: "success",
        message: "service updated successfully",
        data: updatedService,
      });
       
      await session.commitTransaction();
      await session.endSession();
    } catch (err) {
      console.log("update service error :", err);
      await session.abortTransaction();
      await session.endSession();
      return res.status(500).json({
        status: "failed",
        message: "Can' update the service",
        error: err.message,
      });
    }
  };

  
}

export default ServiceController;
