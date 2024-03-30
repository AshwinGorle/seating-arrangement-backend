import OrganizationModel from "../models/OrganizationModel.js";
import UserModel from "../models/UserModel.js";
import mongoose from "mongoose";
class OrganizationController {
  static getAllOrganizations = async (req, res) => {
    try {
      const organizations = await OrganizationModel.find({});
      return res.send({
        status: "success",
        message: "All Organizations fetched successfully!",
        data: organizations,
      });
    } catch (err) {
      console.log("54 organization fetchinf error : ", err);
      return res.send({
        status: "failed",
        message: "Something went wrong ! organization not fetched.",
        err: err,
      });
    }
  };

   static getUserOfOrganization = async (req, res)=>{
    const {organizationId} = req.params;
    const {role} = req.query;
    if(!organizationId) throw new Error("No organization id provided");
    if(!role) throw new Error("No role provided to fetch");
    if (
      !(
        req.user.role == "admin" ||
        (req.user.role == "owner" && req.user.organization == organizationId)
      )
    ) {
      return res.send({
        status: "failed",
        message:
          "you are not authorized to get user of this organization",
      });
    }

    try{
      const organization = await OrganizationModel.findById(organizationId).populate('staff owner');
      if(!organization) throw new Error("Organization does not exists!");
      const dataToSend = role == "owner" ?  organization.owner : organization.staff;
      return res.send({
        status : "success",
        message : `${role} fetched successfully`,
        data : dataToSend
      })
    }catch(err){
      console.log("60 getUserOfOrganization err : ", err);
      return res.send({
        status: "failed",
        message: `${err.message}`,
      });
    } 
   }

  static createOrganization = async (req, res) => {
    const { name, address, description } = req.body;
    if (!name || !address)
      return res.send({ status: "failed", message: "All fields are required" });
    try {
      const organization = await OrganizationModel.create({
        name,
        address,
        description,
      });
      return res.send({
        status: "success",
        message: "Organizationo created successfully!",
        data: organization,
      });
    } catch (err) {
      console.log("52 organization creation error : ", err);
      return res.send({
        status: "failed",
        message: "Something went wrong ! organization not created",
        err: err,
      });
    }
  };

  static updateOrganization = async (req, res)=>{
    const {organizationId} = req.params;
    const {name, address, description, logo, banner} = req.body;
    if(!organizationId) throw new Error("Can't update ! No valid organization id provided.");
    if(!(name || address || description || logo || banner)) throw new Error("Can't update ! Nothing to update.");
    if (
      !(
        req.user.role == "admin" ||
        (req.user.role == "owner" && req.user.organization == organizationId)
      )
    ) {
      return res.send({
        status: "failed",
        message:
          "you are not authorized to update this organization",
      });
    }

    try{
        const organization = await OrganizationModel.findById(organizationId);
        if(!organization) throw new Error("Organization does not exists!");
        const updateOrganization = await OrganizationModel.findByIdAndUpdate(organizationId, {name, description, address, logo, banner}, {new : true}) 
        return res.send({
          status: "success",
          message:
            "Organization updated successfully!",
          data : updateOrganization
        });
    }catch(err){
        console.log("58 organization update error : err");
        if (err.name === "CastError" && err.kind === "ObjectId") {
          return res.status(404).send({
            status: "failed",
            message: "Can't fetch provided details! please check and try again!",
          });
        }
        return res.send({
          status : "failed",
          message : err.message ? err.message : "Error in updating the organization",
        })
    }
  }
  static deleteOrganization = async (req, res) => {
    const { organizationId } = req.params;
    try {
      const organization = await OrganizationModel.findById(organizationId);
      if (!organization)
        return res.send({
          status: "failed",
          message: "Organization does not exits!",
        });
      const deletedOrganization = await OrganizationModel.findByIdAndDelete(
        organizationId
      );
      return res.send({
        status: "success",
        message: "Organizationo deleted successfully!",
        data: deletedOrganization,
      });
    } catch (err) {
      console.log("organization deletion err ", err);
      return res.send({
        status: "failed",
        message: "Something went wrong!, cant delete organization!",
      });
    }
  };



  static addOwnerToOrganization = async (req, res) => {
    const { organizationId, ownerId } = req.body;
    if (!ownerId || !organizationId)
      return res.send({
        status: "failed",
        message: "Can't add owner ! Owner Id and Organization Id is required!",
      });

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const owner = await UserModel.findById(ownerId)
        .populate("organization")
        .session(session);
      if (!owner) throw new Error("Owner does not existes");

      if (owner?.organization) {
        if (owner.organization._id == organizationId) {
          throw new Error(
            `No need to add ! Owner is already in ${owner.organization.name} organization`
          );
        } else {
          throw new Error(
            `Can't add ! This user belongs to another organization (${owner.organization.name})`
          );
        }
      }

      if (!(owner.role == "owner")) throw new Error("User is not the owner");
      const organization = await OrganizationModel.findById(
        organizationId
      ).session(session);
      if (!organization)
        throw new Error("The given organization does not exists");

      const updatedOrganization = await OrganizationModel.findByIdAndUpdate(
        organizationId,
        { $push: { owner: ownerId } },
        { new: true }
      ).session(session);

      const updatedOwner = await UserModel.findByIdAndUpdate(
        ownerId,
        {
          organization: organizationId,
        },
        { new: true }
      ).session(session);

      await session.commitTransaction();
      session.endSession();

      return res.send({
        status: "success",
        message: `Owner added successfully! ${owner.name} (owner) added to ${organization.name} (organization)`,
        data: [updatedOrganization, updatedOwner],
      });
    } catch (err) {
      await session.abortTransaction();
      session.endSession();

      console.log("55 addOwnerToOrganization err :", err);

      if (err.name === "CastError" && err.kind === "ObjectId") {
        return res.status(404).send({
          status: "failed",
          message: "Can't fetch provided details! please check and try again!",
        });
      }
      return res.status(500).send({
        status: "failed",
        message: `${err.message}`,
      });
    }
  };

  static deleteOwnerFromOrganization = async (req, res) => {
    const { organizationId, ownerId } = req.body;
    if (!ownerId || !organizationId)
      return res.send({
        status: "failed",
        message:
          "Can't delete owner ! Owner Id and Organization Id is required!",
      });
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const owner = await UserModel.findById(ownerId);
      if (!owner) throw new Error("Owner does not existes");
      if (!(owner.role == "owner")) throw new Error("User is not the owner");
      const organization = await OrganizationModel.findById(organizationId);
      if (!organization) throw new Error("Organization does not exists!");

      if (owner.organization != organizationId)
        throw new Error(
          `Can't delete! This user(${owner.name}) is not a Owner of this organization (${organization.name})`
        );

      const updatedOrganization = await OrganizationModel.findByIdAndUpdate(
        organizationId,
        { $pull: { owner: ownerId } },
        { new: true }
      ).session(session);

      const updatedOwner = await UserModel.findByIdAndUpdate(ownerId, {
        $unset: { organization: "" }
      }, {new : true}).session(session);
       
       await session.commitTransaction();
       session.endSession(); 
      return res.send({
        status: "success",
        message: "Owner deleted successfully!",
        description: `Owner ${owner.name} deleted from ${organization.name} organization`,
        data: [updatedOrganization,updatedOwner]
      });
    } catch (err) {
      await session.abortTransaction();
      session.endSession();
      console.log("55 deleteOwnerFromOrganization err :", err);

      if (err.name === "CastError" && err.kind === "ObjectId") {
        return res.status(404).send({
          status: "failed",
          message: "Can't fetch provided details! please check and try again!",
        });
      }
      return res.status(500).send({
        status: "failed",
        message: `${err.message}`,
      });
    }
  };

  //same for the staff ----------------------------

  static addStaffToOrganization = async (req, res) => {
    const { organizationId, staffId } = req.body;

    if (!staffId || !organizationId) {
      return res.status(400).send({
        status: "failed",
        message: "Can't add staff! Staff ID and Organization ID are required!",
      });
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const staff = await UserModel.findById(staffId).session(session);
      if (!staff) {
        throw new Error("Staff does not exist");
      }

      if (staff.role !== "staff") {
        throw new Error("User is not a staff");
      }

      const organization = await OrganizationModel.findById(
        organizationId
      ).session(session);

      if (!organization) {
        throw new Error("Organization does not exist");
      }

      if (organization.staff.includes(staffId))
        throw new Error("This staff already exists");

      //check autth
      if(!(req.user.role == "admin" || (req.user.role == "owner" && req.user.organization == organizationId)))
        throw new Error("You are not authorized to add staff in this organizarion");

      const updatedOrganization = await OrganizationModel.findByIdAndUpdate(
        organizationId,
        { $push: { staff: staffId } },
        { new: true }
      ).session(session);

      const updatedStaff = await UserModel.findByIdAndUpdate(
        staffId,
        { organization: organizationId },
        { new: true }
      ).session(session);

      await session.commitTransaction();
      session.endSession();

      return res.status(200).send({
        status: "success",
        message: "Staff added successfully!",
        description: `Staff ${staff.name} added to ${organization.name} organization`,
        data: [updatedOrganization, updatedStaff],
      });
    } catch (err) {
      await session.abortTransaction();
      session.endSession();
      console.error("Error adding staff:", err);

      if (err.name === "CastError" && err.kind === "ObjectId") {
        return res.status(404).send({
          status: "failed",
          message: "Can't fetch provided details! please check and try again!",
        });
      }
      return res.status(500).send({
        status: "failed",
        message: `${err.message}`,
      });
    }
  };

  static deleteStaffFromOrganization = async (req, res) => {
    const { organizationId, staffId } = req.body;
    if (!staffId || !organizationId)
      return res.send({
        status: "failed",
        message:
          "Can't delete staff ! Staff Id and Organization Id is required!",
      });
    if (
      !(
        req.user.role == "admin" ||
        (req.user.role == "owner" && req.user.organization == organizationId)
      )
    ) {
      return res.send({
        status: "failed",
        message:
          "you are not authorized to delete staff from this organization",
      });
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const staff = await UserModel.findById(staffId);
      if (!staff) throw new Error("Staff not found!");

      if (!(staff.role == "staff")) throw new Error("User is not a staff");

      const organization = await OrganizationModel.findById(organizationId);

      if (!organization)
        throw new Error("The given organization does not exists");

      if (staff.organization != organizationId)
        throw new Error(
          `Can't delete! ${staff.name} does not belongs to ${organization.name} organization`
        );

      const updatedOrganization = await OrganizationModel.findByIdAndUpdate(
        organizationId,
        { $pull: { staff: staffId } },
        { new: true }
      ).session(session);
      const updatedStaff = await UserModel.findByIdAndUpdate(
        staffId,
        { $unset: { organization: "" } },
        { new: true }
      ).session(session);

      await session.commitTransaction();
      session.endSession();
      return res.send({
        status: "success",
        message: "Staff deleted successfully!",
        description: `Staff ${staff.name} deleted from ${organization.name} organization`,
        data: [updatedOrganization, updatedStaff],
      });
    } catch (err) {
      await session.abortTransaction();
      session.endSession();

      console.log("55 deleteStagFromOrganization err :", err);

      if (err.name === "CastError" && err.kind === "ObjectId") {
        return res.status(404).send({
          status: "failed",
          message: "Can't fetch provided details! please check try again!",
        });
      }
      return res.status(500).send({
        status: "failed",
        message: `${err.message}`,
      });
    }
  };
}

export default OrganizationController;
