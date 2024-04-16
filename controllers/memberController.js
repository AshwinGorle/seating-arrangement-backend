import MemberModel from "../models/MemberModel.js";
import OrganizationModel from "../models/OrganizationModel.js";
import SeatModel from "../models/SeatModel.js";
import mongoose from "mongoose";
import AccountController from "./accountController.js";
import getRequiredOrganizationId from "../utils/getRequiredOrganizationId.js";
import authorizeActionInOrganization from "../utils/authorizeActionInOrganization.js";
import AccountModel from "../models/AccountModel.js";
import PaymentModel from "../models/PaymentModel.js";

class MemberController {
  static getAllMemberByOrganizationId = async (req, res) => {
    // Validate organizationId
    console.log('get members')
    try {
      const organizationId = getRequiredOrganizationId(req, "admin requires organization Id to fetch all members")
      // Authorization check
      authorizeActionInOrganization(
        req.user,
        organizationId,
        "You are not authorized to fetch all the members of this organization"
      );

      const organization = await OrganizationModel.findById(organizationId);
      if (!organization) {
        throw new Error("Can't fetch all members! Organization does not exist");
      }
      const allMembers = await MemberModel.find({
        organization: organizationId,
      }).select('name membershipStatus').populate('account', 'balance').populate('seat', 'seatNumber').sort({ createdAt: -1 }).limit(10);
      if (allMembers.length === 0) {
        throw new Error("No members found in this organization");
      }
      console.log(allMembers);
      res.status(200).send({
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
      return res.status(400).send({
        status: "failed",
        message: "To get member memberId is required",
      });
    try {
      const member = await MemberModel.findById(memberId).populate(
        "organization account seat payments lockers"
      );
      if (!member) throw new Error("No member found  with this id");

      //Authorization check
      console.log("user organization :", req.user.organization);
      console.log("member organization :", member.organization);
      authorizeActionInOrganization(
        req.user,
        member.organization._id,
        "You are not authorized to fetch this member"
      );
      res.status(200).send({
        status: "success",
        message: `user fetched successfully`,
        data: member,
      });
    } catch (err) {
      console.log("67 getMemberById err : ", err);
      res.status(500).send({ status: "failed", message: `${err.message}` });
    }
  };

  static updateMemberById = async (req, res) => {
    const { memberId } = req.params;
    const { name, phone, email, address } = req.body;
    if (!memberId)
      return res.status(400).send({
        status: "failed",
        message: "To update  memberId is required",
      });
    try {
      const member = await MemberModel.findById(memberId);
      if (!member) throw new Error("No member found  with this id");

      //Authorization check
      authorizeActionInOrganization(req.user, member.organization, "You are not authorized to Update this member")

      const updatedMember = await MemberModel.findByIdAndUpdate(
        memberId,
        { name, email, phone, address },
        { new: true }
      );
      res.status(200).send({
        status: "success",
        message: `member (${member.name}) updated successfully`,
        data: updatedMember,
      });
    } catch (err) {
      console.log("69 updateMemberById err : ", err);
      res.status(500).send({ status: "failed", message: `${err.message}` });
    }
  };

  static createMember = async (req, res) => {
    // Extracting required fields from request body
    const { name, phone, email, address, preparation, gender, monthlySeatFee } =
      req.body;

    const session = await mongoose.startSession();
    await session.startTransaction();

    try {
      // Checking if all required fields are present
      if (
        !name ||
        !phone ||
        !email ||
        !gender ||
        !address ||
        !preparation ||
        !monthlySeatFee
      ) {
        throw new Error("All fields are required!");
      }

      // Fetching required organizationId
      const organizationId = getRequiredOrganizationId(
        req,
        "Can't create member! Admin requires organization ID to create member"
      );

      const organization = await OrganizationModel.findById(
        organizationId
      ).session(session);
      if (!organization) throw new Error("Organization does not exist!");

      //manageing the joining date of a new member
      const joiningDate = new Date();
      joiningDate.setTime(0, 0, 0, 0);
      const date = joiningDate.getDate();
      if (date == 29 || date == 30 || date == 31) {
        joiningDate.setDate(1);
      }

      // Creating member with provided data
      const member = await MemberModel.create(
        [
          {
            name,
            phone,
            email,
            address,
            gender,
            preparation,
            monthlySeatFee,
            organization: organizationId,
            createdAt: joiningDate,
            membershipStatus: "expired",
          },
        ],
        { session }
      ); // Passing session to create method

      // Creating and linking the account to the currently creating member
      const accountDetails = await AccountController.createAccount(
        member[0]._id.toString(),
        organizationId,
        monthlySeatFee,
        session
      );

      await session.commitTransaction();
      await session.endSession();

      return res.status(201).send({
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
          return res.status(409).send({
            status: "failed",
            message: "Name and email already exist!",
          });
        } else if (err.keyPattern && err.keyPattern.name) {
          // Only name is duplicated
          return res.status(409).send({
            status: "failed",
            message: "Name already exists!",
          });
        } else if (err.keyPattern && err.keyPattern.email) {
          // Only email is duplicated
          return res.status(409).send({
            status: "failed",
            message: "Email already exists!",
          });
        }
      }

      // Sending error response
      return res.status(500).send({ status: "failed", message: `${err.message}` });
    }
  };

  static deleteMember = async (req, res) => {
    const { memberId } = req.params;
    const session = await mongoose.startSession();
    await session.startTransaction();
    try {
      const member = await MemberModel.findById(memberId).session(session);
      if (!member) {
        throw new Error("No such member found to delete!");
      }

      //Authorization check
      authorizeActionInOrganization(
        req.user,
        member.organization,
        "You are not authorized to delete this member in this orgaization"
      );

      //removing the currently deleting member from the seat's curresponding shcedule there this member is occupant
      let seatUpdateMessage = "";
      if (member.seat != null) {
        const seat = await SeatModel.findById(member.seat).session(session);
        if (seat) {
          for (const key in seat.schedule) {
            if (
              seat.schedule[key].occupant?.toString() == member._id?.toString()
            ) {
              seat.schedule[key].occupant = null;
              seatUpdateMessage += `The member ocupies seat No. (${seat.seatNumber} - ${key}) so updated while deleting member`;
            }
            await seat.save({ session });
          }
        }
      }

      //deleting the acount of currently deleting member.

      const deletedAcount = await AccountModel.findByIdAndDelete(
        member.account
      ).session(session);

      // deleteing the payment made by the currently deleting member.

      for (let i = 0; i < member.payments.length; i++) {
        await PaymentModel.findByIdAndDelete(member.payments[i]).session(session);
      }

      const deletedMember = await MemberModel.findByIdAndDelete(
        memberId
      ).session(session);



      await session.commitTransaction();
      await session.endSession();
      return res.status(200).send({
        status: "success",
        message: `Member and his Account deleted successfully! ${seatUpdateMessage}`,
        data: [deletedMember, deletedAcount],
      });
    } catch (err) {
      await session.abortTransaction();
      await session.endSession();
      console.log("53 member deletion error: ", err.message);
      return res.status(500).send({ status: "failed", message: `${err.message}` });
    }
  };

  static memberSearch = async (req, res) => {
    /* querie params
       membershipStatus  : 'active' || 'inactive' || expired,

    */
    console.log("member search called -----")

    try {
      const { membershipStatus = "expired" } = req.query;

      const organizationId = getRequiredOrganizationId(req, "Admin requires organization id to search members");
      const organization = await OrganizationModel.findById(organizationId);
      if (!organization) {
        throw new Error("Invalid organization Id is required to get seats");
      }
      const query = {
        organization: organizationId
      };

      query[`membershipStatus`] = membershipStatus;
      console.log("query--------", query)


      const members = await MemberModel.find(query);

      return res.status(200).send({
        status: "success",
        message: "Seats found based on the search criteria",
        data: members,
      });
    } catch (err) {
      console.log("All seats fetching err : ", err);

      res.status(500).send({
        status: "failed",
        message: `${err.message}`,
      });
    }
  }
}

export default MemberController;
