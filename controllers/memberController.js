import MemberModel from "../models/MemberModel.js";
import OrganizationModel from "../models/OrganizationModel.js";
import SeatModel from "../models/SeatModel.js";
import mongoose from "mongoose";
import AccountController from "./accountController.js";
import getRequiredOrganizationId from "../utils/getRequiredOrganizationId.js";
import authorizeActionInOrganization from "../utils/authorizeActionInOrganization.js";
import AccountModel from "../models/AccountModel.js";

class MemberController {
  static getAllMemberByOrganizationId = async (req, res) => {
    const { organizationId } = req.query;
    // Validate organizationId
    if (!organizationId) {
      return res
        .status(400)
        .send({
          status: "failed",
          message: "Organization ID is required to fetch all members",
        });
    }
    try {
      // Authorization check

      if (
        !(
          req.user.role == "admin" ||
          ((req.user.role == "staff" || req.user.role == "owner") &&
            req.user.organization == organizationId)
        )
      ) {
        throw new Error(
          "You are not authorized to fetch all the members of this organization"
        );
      }
      const organization = await OrganizationModel.findById(organizationId);
      if (!organization) {
        throw new Error("Can't fetch all members! Organization does not exist");
      }
      const allMembers = await MemberModel.find({
        organization: organizationId,
      });
      if (allMembers.length === 0) {
        throw new Error("No members found in this organization");
      }
      res.send({
        status: "success",
        message: `All members fetched successfully`,
        data: allMembers,
      });
    } catch (err) {
      console.log("67 getAllMemberByOrganizationId error: ", err.message);
      res.status(500).send({ status: "failed", message: `${err.message}` });
    }
  };

  static getMemberById = async (req, res) => {
    const { memberId } = req.params;
    if (!memberId)
      return res.send({
        status: "failed",
        message: "To get member memberId is required",
      });
    try {
      const member = await MemberModel.findById(memberId);
      if (!member) throw new Error("No member found  with this id");

      //Authorization check
      if (
        !(
          req.user.role === "admin" ||
          ((req.user.role === "staff" || req.user.role === "owner") &&
            req.user.organization.toString() === member.organization.toString())
        )
      ) {
        throw new Error("You are not authorized to fetch this member");
      }
      res.send({
        status: "success",
        message: `user fetched successfully`,
        data: member,
      });
    } catch (err) {
      console.log("67 getMemberById err : ", err);
      res.send({ status: "failed", message: `${err.message}` });
    }
  };

  static updateMemberById = async (req, res) => {
    const { memberId } = req.params;
    const { name, phone, email, address } = req.body;
    if (!memberId)
      return res.send({
        status: "failed",
        message: "To update  memberId is required",
      });
    try {
      const member = await MemberModel.findById(memberId);
      if (!member) throw new Error("No member found  with this id");

      //Authorization check
      if (
        !(
          req.user.role === "admin" ||
          ((req.user.role === "staff" || req.user.role === "owner") &&
            req.user.organization.toString() === member.organization.toString())
        )
      ) {
        throw new Error("You are not authorized to Update this member");
      }
      const updatedMember = await MemberModel.findByIdAndUpdate(
        memberId,
        { name, email, phone, address },
        { new: true }
      );
      res.send({
        status: "success",
        message: `member (${member.name}) updated successfully`,
        data: updatedMember,
      });
    } catch (err) {
      console.log("69 updateMemberById err : ", err);
      res.send({ status: "failed", message: `${err.message}` });
    }
  };

  static createMember = async (req, res) => {
    // Extracting required fields from request body
    const { name, phone, email, address, preparation, monthlySeatFee } = req.body;

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // Checking if all required fields are present
        if (!name || !phone || !email || !address || !preparation || !monthlySeatFee) {
            throw new Error("All fields are required!");
        }

        // Fetching required organizationId
        const organizationId = getRequiredOrganizationId(req, "Can't create member! Admin requires organization ID to create member");

        const organization = await OrganizationModel.findById(organizationId).session(session);
        if (!organization) throw new Error("Organization does not exist!");

        // Creating member with provided data
        const member = await MemberModel.create([{
            name,
            phone,
            email,
            address,
            preparation,
            monthlySeatFee,
            organization: organizationId,
        }], { session }); // Passing session to create method

        // Creating and linking the account to the currently creating member
        const accountDetails = await AccountController.createAccount(member[0]._id.toString(), organizationId, monthlySeatFee ,session);

        await session.commitTransaction();
        await session.endSession();

        return res.send({
            status: "success",
            message: `Member added successfully with Account in ${organization.name} organization`,
            data: accountDetails,
        });
    } catch (err) {
        // Handling errors
        await session.abortTransaction();
        await session.endSession();

        console.log("Member creation error:", err);

        // Checking if the error is due to a duplicate key error
        if (err.code === 11000) {
            if (err.keyPattern && err.keyPattern.name && err.keyPattern.email) {
                // Both name and email are duplicated
                return res.send({
                    status: "failed",
                    message: "Name and email already exist!",
                });
            } else if (err.keyPattern && err.keyPattern.name) {
                // Only name is duplicated
                return res.send({
                    status: "failed",
                    message: "Name already exists!",
                });
            } else if (err.keyPattern && err.keyPattern.email) {
                // Only email is duplicated
                return res.send({
                    status: "failed",
                    message: "Email already exists!",
                });
            }
        }

        // Sending error response
        return res.send({ status: "failed", message: `${err.message}` });
    }
};


  static deleteMember = async (req, res) => {
    const { memberId } = req.params;
    const session = await mongoose.startSession();
     session.startTransaction();
    try {
      const member = await MemberModel.findById(memberId).session(session);
      if (!member) {
        throw new Error("No such member found to delete!");
      }
      
      //Authorization check
      authorizeActionInOrganization(req.user, member.organization, "You are not authorized to delete this member in this orgaization");
      // if (
      //   !(
      //     req.user.role === "admin" ||
      //     ((req.user.role === "staff" || req.user.role === "owner") &&
      //       req.user.organization.toString() === member.organization.toString())
      //   )
      // ) {
      //   throw new Error("You are not authorized to delete this member");
      // }
      
      //removing the currently deleting member from the seat's curresponding shcedule there this member is occupant 
      const seatUpdateMessage = "";
      if(member.seat != null){
        const seat = await SeatModel.findById(member.seat).session(session);
        if(seat){
           for(const key in seat.schedule){
            if(seat.schedule[key].occupant.toString()  == member._id.toString()){
              seat.schedule[key].occupant=null;
              seatUpdateMessage += `The member ocupies seat No. (${seat.seatNumber} - ${key}) so updated while deleting member`
           }
           await seat.save().session(session);
        }
      }
     }
      
      const deletedAcount = await AccountModel.findByIdAndDelete(member.account).session(session); 

      const deletedMember = await MemberModel.findByIdAndDelete(memberId).session(session);

      await session.commitTransaction();
      await session.endSession();
      return res.send({
        status: "success",
        message: `Member and his Account deleted successfully! ${seatUpdateMessage}` ,
        data: [deletedMember, deletedAcount],
      });
    } catch (err) {
       await session.abortTransaction();
       await session.endSession();
      console.log("53 member deletion error: ", err.message);
      return res.send({ status: "failed", message: `${err.message}` });
    }
  };
}

export default MemberController;
