import mongoose from "mongoose";
import OrganizationModel from "../models/OrganizationModel.js";
import SeatModel from "../models/SeatModel.js";
import authorizeActionInOrganization from "../utils/authorizeActionInOrganization.js";
import MemberModel from "../models/MemberModel.js";
import getRequiredOrganizationId from "../utils/getRequiredOrganizationId.js";

class SeatController {
  static getAllSeats = async (req, res) => {
     const {page=1, limit=10} = req.query;
     const skip = (page-1)*limit
    try {
      let requiredOrganizationId = null;
    
      //checking if admin is hiting the route then organizationId is required as query params.
      if (req.user.role == "admin") {
        const { organizationId } = req.query;
        if (!organizationId)
          throw new Error("Admin requires organization Id to fetch all seats");
        requiredOrganizationId = organizationId;
      } else {
        if (!req?.user?.organization)
          throw new Error("User is not associated with any organization");
        requiredOrganizationId = req?.user?.organization;
      }
      if (!requiredOrganizationId)
        throw new Error("Organization Id is required to fetch all seats");
      const organization = await OrganizationModel.findById(
        requiredOrganizationId
      );
      if (!organization) throw new Error(`Organization does not exists`);
      const allSeats = await SeatModel.find({
        organization: requiredOrganizationId,
      }).populate("organization schedule.morning.occupant schedule.noon.occupant schedule.evening.occupant schedule.fullDay.occupant" ).skip(skip).limit(limit);
      res.send({
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
      const organizationId = getRequiredOrganizationId(req, "Can't create seat ! admin requires Organization Id to create seats.");
      
      const organization = await OrganizationModel.findById(
        organizationId
      );
      if (!organization) throw new Error("Organization does not exists!");
      const seat = await SeatModel.create({
        seatNumber,
        description,
        organization: organizationId,
      });
      res.send({
        status: "success",
        message: `Seat ${seat?.seatNumber} created successfully in ${organization?.name} organization`,
        data: seat,
      });
    } catch (err) {
      console.log("70 createSeat Error :", err);
      if (err.code && err.code === 11000){
        res.status(422).send({status : "failed", message : "A organization can not have seats with same seat number"});
      }else{
      res.send({ status: "failed", message: err.message });
      }
    }
  };

  static updateSeat  = async (req, res)=>{
    const { seatId } = req.params;
    const{seatNumber, description} = req.body;
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


      await SeatModel.findByIdAndUpdate(seatId, {seatNumber, description})
      // Commit the transaction
      await session.commitTransaction();
      await session.endSession();

      res.send({
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
          await fetchedMember.save({session});
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

      res.send({
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
    const session = await mongoose.startSession();
    await session.startTransaction();
    try {
      // Check if memberId and seatId are provided
      if (!memberId || !seatId || !schedule) {
        throw new Error("Member ID, Seat ID, and Schedule are required.");
      }

      // Find the seat
      const seat = await SeatModel.findById(seatId);
      if (!seat) {
        throw new Error("Seat not found.");
      }

      // Find the member
      const member = await MemberModel.findById(memberId);
      if (!member) {
        throw new Error("Member not found.");
      }

      //memerber organization should be same as seat organiation
      if (member.organization.toString() != seat.organization.toString())
        throw new Error(
          "Member and Seat both should belong to the same  Organization"
        );

      //auth check
      if (
        !(
          req?.user?.role == "admin" ||
          req.user.organization.toString() === member.organization.toString()
        )
      )
        throw new Error(
          "You are not authorized to allocate the seats in this organization"
        );

      // Check if the seat is already occupied for the specified schedule
      if (seat.schedule[schedule].occupant) {
        throw new Error(`Seat is already occupied for ${schedule} schedule.`);
      }

      // Update the seat schedule with the member ID
      seat.schedule[schedule].occupant = memberId;
      member.seat = seatId;
      await Promise.all([seat.save(), member.save()]);
      session.commitTransaction();
      await session.endSession();

      res.status(200).json({
        status: "success",
        message: `Seat allocated successfully for ${schedule} schedule.`,
        data: [seat, member],
      });
    } catch (error) {
      await session.abortTransaction();
      await session.endSession();

      console.error("Error allocating seat:", error);
      res.status(400).json({
        status: "failed",
        message: error.message,
      });
    }
  };

  static deallocateSeatByMemberId = async (req, res) => {
    const { memberId } = req.query;

    const session = await mongoose.startSession();
    await session.startTransaction();

    try {
      if (!memberId) {
        throw new Error("Member ID is required.");
      }

      const member = await MemberModel.findById(memberId)
        .populate("seat")
        .session(session);

      if (!member) {
        throw new Error("Member not found.");
      }
      if (!member.seat._id) {
        throw new Error("Member have not alloted any seat.");
      }

      //check auth
      authorizeActionInOrganization(
        req.user,
        memberId,
        "You are not authorized to allocate the seat to this member"
      );

      //seting seat of member null
      member.seat = null;

      const seat = await SeatModel.findById(member.seat._id);
      if (!seat) throw new Error("Member's seat not found");

      //removing member from the curresponding shcedule of seat
      for (const key in seat?.schedule) {
        if (seat.schedule[key].occupant.toString() == memberId.toString()) {
          seat.schedule[key].occupant = null;
        }
      }

      await Promise.all([seat.save(), member.save()]);

      await session.commitTransaction();
      await session.endSession();

      res.status(200).json({
        status: "success",
        message: `Seats deallocated successfully for member ID ${memberId}.`,
        data: [member, seat],
      });
    } catch (error) {
      await session.abortTransaction();
      await session.endSession();

      console.error("Error deallocating seats by member ID:", error);
      res.status(400).json({
        status: "failed",
        message: error.message,
      });
    }
  };
}

export default SeatController;
