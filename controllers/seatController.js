import mongoose from "mongoose";
import OrganizationModel from "../models/OrganizationModel.js";
import SeatModel from "../models/SeatModel.js";
import authorizeActionInOrganization from "../utils/authorizeActionInOrganization.js";
import MemberModel from "../models/MemberModel.js";
import getRequiredOrganizationId from "../utils/getRequiredOrganizationId.js";
import {
  validateDuration,
  validateIsSameOrganization,
  validateSchedule,
} from "../utils/validation.js";
import { ServerError, UserInputError } from "../utils/ErrorClasses.js";
import ServiceController from "./serviceController.js";
import PaymentController from "./paymentController.js";
import { getValidityFromDuration } from "../utils/utilsFunctions.js";
import ServiceModel from "../models/ServiceModel.js";
import { getMember } from "../helper/member.js";
import { getService } from "../helper/service.js";

class SeatController {
  static searchSeats = async (req, res) => {
    console.log("seat search called -----");
    /*Query Parameters:
        - schedule : Morning, Noon, Evening, FullDay (default: FullDay)
        - status: Vacant, Occupied (default: Vacant)
        */
    try {
      const { schedule = "fullDay", status = "vacant" } = req.query;

      const organizationId = getRequiredOrganizationId(
        req,
        "Admin requires organization id to search seats"
      );
      const organization = await OrganizationModel.findById(organizationId);
      if (!organization) {
        throw new Error("Invalid organization Id is required to get seats");
      }

      const query = {
        organization: organizationId,
      };
      if (schedule) {
        query[`schedule.${schedule}.occupant`] =
          status == "occupied" ? { $ne: null } : null;
      }

      const seats = await SeatModel.find(query).populate(
        `organization schedule.morning.occupant schedule.noon.occupant schedule.evening.occupant schedule.fullDay.occupant`
      );

      return res.status(200).send({
        status: "success",
        message: "Seats found based on the search criteria",
        data: seats,
      });
    } catch (err) {
      console.log("All seats fetching err : ", err);

      res.status(500).send({
        status: "failed",
        message: `${err.message}`,
      });
    }
  };

  static getAllSeats = async (req, res) => {
    const { page = 1, limit = 10 } = req.query;

    try {
      //checking if admin is hiting the route then organizationId is required as query params.
      const requiredOrganizationId = getRequiredOrganizationId(
        req,
        "Admin requires the Organization Id to fetch all seats"
      );
      const organization = await OrganizationModel.findById(
        requiredOrganizationId
      );
      if (!organization) throw new Error(`Organization does not exists`);
      const allSeats = await SeatModel.find({
        organization: requiredOrganizationId,
      }).populate(
        "organization schedule.morning.occupant schedule.noon.occupant schedule.evening.occupant schedule.fullDay.occupant"
      );

      res.status(200).send({
        status: "success",
        message: `All seats of ${organization.name}`,
        data: allSeats,
      });
    } catch (err) {
      console.log("All seats fetching err : ", err);

      res.send({
        status: "failed",
        message: `${err.message}`,
      });
    }
  };

  static createSeat = async (req, res) => {
    //required organizatonId
    const { seatNumber, description } = req.body;

    try {
      if (!seatNumber)
        throw new Error("Can't create! Seat Number is required.");

      //fetching required organizationId
      const organizationId = getRequiredOrganizationId(
        req,
        "Can't create seat ! admin requires Organization Id to create seats."
      );

      const organization = await OrganizationModel.findById(organizationId);
      if (!organization) throw new Error("Organization does not exists!");
      const seat = await SeatModel.create({
        seatNumber,
        description,
        organization: organizationId,
      });
      res.status(201).send({
        status: "success",
        message: `Seat ${seat?.seatNumber} created successfully in ${organization?.name} organization`,
        data: seat,
      });
    } catch (err) {
      console.log("70 createSeat Error :", err);
      if (err.code && err.code === 11000) {
        res.status(422).send({
          status: "failed",
          message: "A organization can not have seats with same seat number",
        });
      } else {
        res.status(500).send({ status: "failed", message: err.message });
      }
    }
  };

  static createMultipleSeats = async (req, res) => {
    const { start, end } = req.body
    const noOfSeats = end - start + 1;
    try {
      if (!start) throw new Error("No of seats should be provided");
      if (end - start > 200)
        throw new Error("Maximum number of seats you can create is 200");
      const organizationId = getRequiredOrganizationId(
        req,
        "Can't create seat ! admin requires Organization Id to create seats."
      );

      const organization = await OrganizationModel.findById(organizationId);
      if (!organization) throw new Error("Organization does not exists!");

      const multipleSeats = Array.from(
        { length: noOfSeats },
        (_, index) => index + parseInt(start)
      ).map((seq) => ({
        seatNumber: seq,
        description: "",
        organization: organizationId,
      }));

      console.log("seats : ", multipleSeats);

      await SeatModel.insertMany(multipleSeats);

      return res.status(201).send({
        status: "success",
        message: `seats from ${start} to ${end} added successfully `,
      });
    } catch (err) {
      console.log("multiple seat creation err : ", err);
      return res
        .status(500)
        .send({ status: "failed", message: `${err.message}` });
    }
  };

  static updateSeat = async (req, res) => {
    const { seatId } = req.params;
    const { seatNumber, description } = req.body;
    const session = await mongoose.startSession();
    await session.startTransaction();
    try {
      const seat = await SeatModel.findById(seatId);
      if (!seat) {
        throw new Error("Seat not found!");
      }

      // Check authorization
      authorizeActionInOrganization(
        req.user,
        seat.organization,
        "You are not authorized to update the seat."
      );

      await SeatModel.findByIdAndUpdate(seatId, { seatNumber, description });
      // Commit the transaction
      await session.commitTransaction();
      await session.endSession();

      res.status(204).send({
        status: "success",
        message: `Seat ${seat.seatNumber} updated successfully`,
      });
    } catch (err) {
      console.error("Error updating seat:", err);
      await session.abortTransaction();
      await session.endSession();

      res.status(500).send({ status: "failed", message: err.message });
    }
  };

  static deleteSeat = async (req, res) => {
    const { seatId } = req.params;
    const session = await mongoose.startSession();
    await session.startTransaction();
    try {
      const seat = await SeatModel.findById(seatId);
      if (!seat) {
        throw new Error("Seat not found!");
      }

      // Check authorization
      authorizeActionInOrganization(
        req.user,
        seat.organization,
        "You are not authorized to delete the seat."
      );

      // Members which occupy the currently deleting seat
      const occupiedMembers = [];

      for (const key in seat.schedule) {
        if (seat.schedule[key].occupant != null) {
          occupiedMembers.push(seat.schedule[key].occupant);
        }
      }

      console.log("occupied member-------------------", occupiedMembers);
      // Remove the seat from all the members which occupy it
      for (let i = 0; i < occupiedMembers.length; i++) {
        try {
          const fetchedMember = await MemberModel.findById(
            occupiedMembers[i]
          ).session(session);
          if (!fetchedMember)
            throw new Error(`Member with ID ${occupiedMembers[i]} not found!`);
          fetchedMember.seat = null;
          await fetchedMember.save({ session });
        } catch (err) {
          console.error(`Error updating member ${occupiedMembers[i]}:`, err);
          throw new Error(`${err.message}`); // Rethrow the error to abort the transaction
        }
      }

      // Delete the seat
      await SeatModel.findByIdAndDelete(seatId).session(session);

      // Commit the transaction
      await session.commitTransaction();
      await session.endSession();

      res.status(200).send({
        status: "success",
        message: `Seat ${seat.seatNumber} deleted successfully`,
      });
    } catch (err) {
      console.error("Error deleting seat:", err);
      await session.abortTransaction();
      await session.endSession();
      res.status(500).send({ status: "failed", message: err.message });
    }
  };

  static allocateSeat = async (req, res) => {
    const { schedule, memberId, seatId } = req.body;
    const { renewalPeriodUnit, renewalPeriodAmount, charges } = req.body;
    
    const session = await mongoose.startSession();
    await session.startTransaction();
    try {
      validateDuration(req);
      validateSchedule(req);

      // Check if memberId and seatId are provided
      if (!memberId || !seatId || !renewalPeriodUnit || !renewalPeriodAmount) {
        throw new UserInputError(
          "Member ID, Seat ID, and Schedule are required."
        );
      }

      // Find the seat
      const seat = await SeatModel.findById(seatId);

      if (!seat) {
        throw new ServerError("Seat not found.");
      }

      // Find the member
      const member = await MemberModel.findById(memberId).populate("services payments");
      if (!member) {
        throw new ServerError("Member not found.");
      }

      //memerber organization should be same as seat organiation
      if (!validateIsSameOrganization(member.organization, seat.organization))
        throw new UserInputError("Both organizations does not mathes");

      //auth check
      authorizeActionInOrganization(
        req.user,
        member.organization,
        "you are not authorized to allocate this seat the this member"
      );

      // Check if the seat is already occupied for the specified schedule
      if (seat.schedule[schedule].occupant) {
        throw new Error(`Seat is already occupied for ${schedule} schedule.`);
      }

      // organization Id,
      const organiationId = getRequiredOrganizationId(
        req,
        "Admin requires organizationId to create service in organization"
      );

      //create new service for the member of the seat
      const options = {
        serviceType: "SeatService",
        renewalPeriodUnit,
        renewalPeriodAmount,
        charges,
        organization: organiationId,
        seat: seat._id,
        occupant: member._id,
      };
      const newService =  new ServiceModel({
        occupant : member._id,
        organization : organiationId,
        serviceType : "SeatService",
        renewalPeriodUnit,
        renewalPeriodAmount,
        charges,
        seat : seat._id,
      });

      if(! newService) throw new ServerError("Service not created"); 
      console.log("101 newService----", newService);

      //Update the seat schedule with the member ID
      seat.schedule[schedule].occupant = memberId;

      //adding the new Service into the members service array
      member.services.push(newService);

      //geting the new validity which will be increased after the payment
      // const newValidity = getValidityFromDuration(renewalPeriodUnit, renewalPeriodAmount, newService.lastBillingDate)
      // create a pending and insert it into the member's  payments array
      const paymentOptions = {
        amount : newService.charges,
        chargedOn : member._id,
        serviceType : 'SeatService',
        service : newService._id,
        seat : seat._id,
        status : 'pending',
        desciption : "First payment at the time of purchase of seat",
        organization : organiationId,
        renewalPeriodAmount,
        renewalPeriodUnit
      };

      const newPendingPayment =  await PaymentController.createPaymentUtil(
        paymentOptions
      );
      //updating pending payment history
       newPendingPayment.timeline.push({action : "Created" , timestamp : Date.now()});
       console.log('new pending payment---', newPendingPayment);
       member.payments.push(newPendingPayment);
      
      
      await seat.save({ session }),
      await newService.save({ session }),
      await newPendingPayment.save({session})
      await member.save({ session }),
   

      await session.commitTransaction();
      await session.endSession();

      return res.status(200).json({
        status: "success",
        message: `Seat allocated to ${member.name} successfully for ${schedule} schedule.`,
        data: { seat: seat, member: member, service : newService ,payment : newPendingPayment },
      });

    } catch (error) {

      await session.abortTransaction();
      await session.endSession();
      console.error("Error allocating seat:", error);

      if (error instanceof UserInputError || error instanceof ServerError) {
        return res
          .status(error.statusCode)
          .send({ status: "failed", message: error.message });
      }

      return res.status(400).json({
        status: "failed",
        message: error.message,
      });
      
    }
  };
  

}

export default SeatController;
