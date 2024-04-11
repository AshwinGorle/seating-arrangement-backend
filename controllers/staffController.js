import OrganizationModel from "../models/OrganizationModel.js";
import UserModel from "../models/UserModel.js";
import authorizeActionInOrganization from "../utils/authorizeActionInOrganization.js";
import getRequiredOrganizationId from "../utils/getRequiredOrganizationId.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import transporter from "../configs/emailConfig.js";
import sendEmail from "../utils/sendEmail.js";
class StaffController {
  static getAllStaff = async (req, res) => {
    try {
      const organizarionId = await getRequiredOrganizationId(
        req,
        "Admin need organization id to get all staff"
      );
      console.log("-------", organizarionId);
      const organization = await OrganizationModel.findById(organizarionId);
      if (!organization) throw new Error("Organization does not exists");
      const allStaff = await UserModel.find({
        role: "staff",
        organization: organizarionId,
      });
      res.status(200).send({
        status: "success",
        message: "all staff of the organization fetched successfully",
        data: allStaff,
      });
    } catch (err) {
      console.log("getAllStaff err : ", err);
      res.status(500).send({ status: "failed", message: `${err.message}` });
    }
  };

  static getStaffById = async (req, res) => {
    try {
      const { staffId } = req.params;
      const staff = await UserModel.findById(staffId);
      if (!staff || staff.role != "staff")
        throw new Error("Staff does not exists");
      authorizeActionInOrganization(
        req.user,
        staff.organization,
        "Your are not allowed to get this staff detail"
      );
      res.status(200).send({
        status: "success",
        message: "all staff of the organization fetched successfully",
        data: staff,
      });
    } catch (err) {
      console.log("getStaffById err : ", err);
      res.status(500).send({ status: "failed", message: `${err.message}` });
    }
  };

  static updateStaffById = async (req, res) => {
    const {staffId} = req.params;
    const { name, phone, email , gender } = req.body;
    
    try {
       const staff = await UserModel.findById(staffId);
       if(!staff && staff.role != 'staff') throw new Error("Staff does not exists");
       authorizeActionInOrganization(
        req.user,
        staff.organization,
        "Your are not allowed to update this staff detail"
      );

      if(name) staff.name = name;
      if(phone) staff.phone = phone;
      if(email) staff.email = email;
      if(gender) staff.gender = gender;
      await staff.save();

      res.status(200).send({
        status: "success",
        message: "Staff updated successfully!",
        data: staff,
      });
      

    } catch (err) {
      console.log("getStaffById err : ", err);
      res.status(500).send({ status: "failed", message: `${err.message}` });
    }
  };

  static createStaff = async (req, res) => {
    const { name, phone, email, password, password_confirmation, gender } =
      req.body;
    const role = "staff";
    if (!(password == password_confirmation))
      return res.status(400).send({
        status: "failed",
        message: "Both passowrd doesnot mathch",
      });
    if (
      !(
        name &&
        phone &&
        email &&
        password &&
        password_confirmation &&
        gender &&
        role
      )
    )
      return res.status(400).send({
        status: "failed",
        message: "All fields are required!",
      });

    try {
      const organizarionId = getRequiredOrganizationId(
        req,
        "admin requires organization Id to create staff"
      );
      console.log("organiztionid------------", organizarionId);
      const user = await UserModel.findOne({ email: email });
      if (user)
        return res
          .status(409)
          .send({ status: "failed", message: "User Already exists!" });
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      await UserModel.create({
        name,
        phone,
        email,
        gender,
        role,
        organization: organizarionId,
        password: hashedPassword,
      });
      const newUser = await UserModel.findOne({ email: email }).select(
        "-password"
      );
      await sendEmail(
        email,
        `Congratulations ${name}! here is your libSteering password`,
        `You are now staff in ${req.user.name}'s liberary. Don't share with anyone. password : ${password}`
      );
      res
        .status(201)
        .send({ status: "success", message: "staff created successfully!" });
    } catch (err) {
      console.log("create_staff error :", err);
      return res.status(500).send({
        status: "failed",
        message: `${err.message}`,
        err: err,
      });
    }
  };


}

export default StaffController;
