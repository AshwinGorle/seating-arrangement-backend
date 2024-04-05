import UserModel from "../models/UserModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import transporter from "../configs/emailConfig.js";
import sendEmail from "../utils/sendEmail.js";
import getRequiredOrganizationId from "../utils/getRequiredOrganizationId.js";
class AuthController {
  static homefunction = (req, res) => {
    return res.send("Shree Ganesh");
  };

  static getUserByToken = async (token) => {
    const tokenData = jwt.verify(token, process.env.SECRET_KEY);
    console.log("11 token data ", tokenData);
    try {
      const user = await UserModel.findOne({ _id: tokenData.userId });
      return user;
    } catch (err) {
      console.log("5 getUserByToken error : ", err);
      return null;
    }
  };

  static signup = async (req, res) => {
    const {
      name,
      phone,
      email,
      password,
      password_confirmation,
      gender,
      role = "owner",
    } = req.body;
    if (!(password == password_confirmation))
      return res.send({
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
      return res.send({
        status: "failed",
        message: "All fields are required!",
      });

    try {
      const user = await UserModel.findOne({ email: email });
      if (user)
        return res.send({ status: "failed", message: "User Already exists!" });
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      await UserModel.create({
        name,
        phone,
        email,
        gender,
        role,
        password: hashedPassword,
      });
      const newUser = await UserModel.findOne({ email: email }).select(
        "-password"
      );
      const token = jwt.sign(
        { userId: newUser._id, userEmail: newUser.email },
        process.env.SECRET_KEY,
        { expiresIn: "10d" }
      );
      console.log("1 token", token);
      res.status(201).send({
        status: "success",
        message: `${role} User Created !`,
        data: newUser,
        token: token,
      });
    } catch (err) {
      return res.send({
        status: "failed",
        message: "user not created",
        err: err,
      });
    }
  };

  static createOwner = async (req, res) => {
    const { name, phone, email, password, password_confirmation, gender } =
      req.body;
    const role = "owner";
    if (!(password == password_confirmation))
      return res.send({
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
      return res.send({
        status: "failed",
        message: "All fields are required!",
      });

    try {
      const user = await UserModel.findOne({ email: email });
      if (user)
        return res.send({ status: "failed", message: "User Already exists!" });
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      await UserModel.create({
        name,
        phone,
        email,
        gender,
        role,
        password: hashedPassword,
      });
      const newUser = await UserModel.findOne({ email: email }).select(
        "-password"
      );
      
      
      await sendEmail(
        email,
        `Congratulations ${name}! here is your libSteering password`,
        `Don't share with any one. password : ${password}`
      );
      res.send({ status: "success", message: "owner created successfully!" });
    } catch (err) {
      console.log("create owner err : ",err );
      return res.send({
        status: "failed",
        message: "user not created",
        err: err,
      });
    }
  };

  static createStaff = async (req, res) => {
    const { name, phone, email, password, password_confirmation, gender } =
      req.body;
    const role = "staff";
    if (!(password == password_confirmation))
    return res.send({
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
    return res.send({
      status: "failed",
      message: "All fields are required!",
    });
    
    try {
      const organizarionId = getRequiredOrganizationId(req, 'admin requires organization Id to create staff');
      const user = await UserModel.findOne({ email: email });
      if (user)
        return res.send({ status: "failed", message: "User Already exists!" });
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
      res.send({ status: "success", message: "owner created successfully!" });
    } catch (err) {
      return res.send({
        status: "failed",
        message: `${err.message}`,
        err: err,
      });
    }
  };

  static login = async (req, res) => {
    const { email, password } = req.body;
    if (!(email && password))
      return res.send({
        status: "failed",
        message: "All fields are required!",
      });
    try {
      const user = await UserModel.findOne({ email: email });
      if (!user)
        return res.send({
          status: "failed",
          message: "Email or Password is wrong!",
        });
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch)
        return res.send({
          status: "failed",
          message: "Email or Password is wrong!",
        });
      const token = jwt.sign(
        { userId: user._id, userEmail: user.email },
        process.env.SECRET_KEY,
        { expiresIn: "10d" }
      );
      delete user.password;
      res.cookie("token", token).send({
        status: "success",
        message: "login successfull!",
        token: token,
        data: user,
      });
    } catch (err) {
      console.log("4 login err : ", err);
      res.status(500).send({
        status: "failed",
        message: "can't login, Something went wrong!",
        err: err,
      });
    }
  };

  static sendResetPasswordEmail = async (req, res) => {
    const { email } = req.body;
    if (!email)
      return res.send({ status: "failed", message: "Email is required!" });
    try {
      const user = await UserModel.findOne({ email: email });
      if (!user)
        return res.send({ status: "failed", message: "Email does not exits!" });
      const secretKey = user._id + process.env.SECRET_KEY;
      const token = jwt.sign({ userId: user._id }, secretKey, {
        expiresIn: "10m",
      });
      const link = `${process.env.BASE_URL}/api/v1/auth/reset_passowrd_page/${user._id}/${token}`;
      console.log("14 reset password token : ", token);
      console.log("14 reset password userId : ", user._id);
      let info = await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: user.email,
        subject: "Password Reset Link for Liberary Management",
        html: `<a href=${link}> click here to reset your password </a>`,
      });
      return res.send({
        status: "success",
        message: "Email Sent Successfully!",
        data: info,
      });
    } catch (err) {
      console.log("9 email sending error : ", err);
      return res.send({
        status: "failed",
        message: "Email not sent! Something went wrong try again.",
        err: err,
      });
    }
  };

  static resetPasswordWithLink = async (req, res) => {
    console.log("50 password reset with link called ", req.body);
    const { userId, token } = req.params;
    if (!token || !userId)
      return res.send({ status: "failed", message: "invalid token!" });
    const { password, password_confirmation } = req.body;
    console.log("password ", password);
    console.log("password_confirmation ", password_confirmation);
    if (!password || !password_confirmation)
      return res.send({
        status: "failed",
        message: "All fields are required!",
      });
    if (!password == password_confirmation)
      return res.send({
        status: "failed",
        message: "Both password should  match!",
      });
    try {
      const user = await UserModel.findById(userId);
      if (!user)
        return res.send({ status: "failed", message: "invalid Credentials!" });
      const secretKey = user._id + process.env.SECRET_KEY;
      const tokenData = jwt.verify(token, secretKey);
      if (!tokenData)
        return res.send({ status: "failed", message: "Invalid Token !!!!" });
      if (tokenData.userId != user._id)
        return res.send({
          status: "failed",
          message: "user and token does not match",
        });
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      await UserModel.findByIdAndUpdate(userId, { password: hashedPassword });
      return res.send({
        status: "success",
        message: "Passowrd reset successful!",
      });
    } catch (err) {
      console.log("12 password reset error : ", err);
      if (err.name == "TokenExpiredError")
        return res.send({
          status: "failed",
          message: "Token has been Expired!",
          err: err,
        });
      return res.send({
        status: "failed",
        message: "password reset failed! try again.",
        err: err,
      });
    }
  };

  static showResetPasswordPage = async (req, res) => {
    const { token, userId } = req.params;
    res.render("resetPassword", { userId: userId, token: token });
  };

  static changePassword = async (req, res) => {
    const { currentPassword, newPassword, newPasswordConfirmation } = req.body;
    if (!currentPassword || !newPassword || !newPasswordConfirmation)
      return res.send({ status: "failed", message: "All fields are required" });
    if (newPassword !== newPasswordConfirmation)
      return res.send({
        status: "failed",
        message: "Both password does not match!",
      });
    try {
      const isMatch = await bcrypt.compare(currentPassword, req.user.password);
      if (!isMatch)
        return res.send({ status: "failed", message: "Incorrect Password!" });
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);
      await UserModel.findByIdAndUpdate(req.user._id, {
        password: hashedPassword,
      });
      return res.send({
        status: "success",
        message: "Password changed successfully!",
      });
    } catch (err) {
      console.log("51 chagne password error : ", err);
      return res.send({
        status: "failed",
        message: "Something went wrong, try again!",
        err: err,
      });
    }
  };
}
export default AuthController;
