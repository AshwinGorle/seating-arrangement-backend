import UserModel from "../models/UserModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import transporter from "../configs/emailConfig.js";
import sendEmail from "../utils/sendEmail.js";
import { catchAsyncError } from "../middlewares/catchAsyncError.middleware.js";
import { ServerError, UserInputError } from "../utils/ErrorClasses.js";
import Errors from "../utils/errorMessages.js";
import generateOtp from "../utils/generateOtp.js";
import Success from "../utils/successMessages.js";

class AuthController {
  static homefunction = (req, res) => {
    return res.status(200).send("Shree Ganesh");
  };

  static getUserByToken = async (token) => {
    const tokenData = jwt.verify(token, process.env.SECRET_KEY);
    console.log("token data ", tokenData);
    try {
      const user = await UserModel.findOne({ _id: tokenData.userId });
      return user;
    } catch (err) {
      console.log("5 getUserByToken error : ", err);
      return null;
    }
  };

  static signup = catchAsyncError(async (req, res) => {
    console.log(req.body);
    const {
      name,
      phone,
      email,
      password,
      password_confirmation,
      gender,
      role = "owner",
      city,
      state,
      country,
    } = req.body;
    if (!(password == password_confirmation))
      throw new UserInputError(Errors.AUTH.PASSWORD_MISMATCHED);
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
      throw new UserInputError(Errors.AUTH.FIELDS_REQUIRED);
    const user = await UserModel.findOne({ email: email });
    // if (user) throw new UserInputError(Errors.AUTH.ALREADY_EXISTS);
    const salt = await bcrypt.genSalt(10);
    const otp = generateOtp(4); // Generate OTP
    const hashedPassword = await bcrypt.hash(password, salt);

    const address = {
      city: city || "N/A",
      state: state || "N/A",
      country: country || "N/A",
    };

    await UserModel.create({
      name,
      phone,
      email,
      gender,
      role,
      address,
      otp,
      otpExpiresAt: Date.now() + 10 * 60 * 1000, // OTP valid for 10 minutes
      password: hashedPassword,
    });
    await sendEmail({
      to: email,
      subject: "OTP for Lib Steering Account Verification",
      html: `<p>Your OTP for account verification is <b>${otp}</b>. It will expire in 10 minutes.</p>`,
    });
    return res.status(201).json({
      status: "success",
      message: Success.AUTH.USER_CREATED,
      verified: false,
    });
    // const token = jwt.sign(
    //   { userId: newUser._id, userEmail: newUser.email },
    //   process.env.SECRET_KEY,
    //   { expiresIn: "10d" }
    // );
    //   console.log("1 token", token);
    //   res.status(201).send({
    //     status: "success",
    //     message: `${role} User Created !`,
    //     data: newUser,
    //     token: token,
    //  });
  });

  static verifyEmail = catchAsyncError(async (req, res) => {
    const { email, otp } = req.body;

    const user = await UserModel.findOne({ email });
    if (!user) throw new UserInputError(Errors.AUTH.NOT_FOUND);
    if (user.otp != otp) throw new UserInputError(Errors.AUTH.INVALID_OTP);
    if (user.otpExpiresAt < Date.now())
      throw new UserInputError(Errors.AUTH.EXPIRED_OTP);

    user.otp = null;
    user.otpExpiresAt = null;
    user.isVerified = true;
    await user.save();

    const token = jwt.sign(
      { userId: user._id, userEmail: user.email },
      process.env.SECRET_KEY,
      { expiresIn: "30d" }
    );

    res.status(200).json({
      status: "success",
      message: Success.AUTH.EMAIL_VERIFIED,
      data: user,
      token: token,
    });

    console.error("OTP verification error:", err);
    res.status(500).json({
      status: "failed",
      message: "Something went wrong. Try again.",
      error: err,
    });
  });

  static resendOtp = catchAsyncError(async (req, res) => {
    const { email } = req.body;
    const {for_reset_password}=req.query;
    if (!email) throw new UserInputError(Errors.AUTH.FIELDS_REQUIRED);
    const user = await UserModel.findOne({ email });
    if (!user) throw new UserInputError(Success.AUTH.NOT_FOUND);
    if(!for_reset_password){
      if (user.isVerified) throw new Error(Success.AUTH.ALREADY_VERIFIED);
    }

    const otp = generateOtp(4); // Generate a new OTP
    user.otp = otp;
    user.otpExpiresAt = Date.now() + 10 * 60 * 1000; // OTP valid for 10 minutes
    await user.save();
    await sendEmail({
      to: email,
      subject: "Resent OTP for Lib Steering Account Verification",
      html: `<p>Your OTP for account verification is <b>${otp}</b>. It will expire in 10 minutes.</p>`,
    });

    res.status(200).json({
      status: "success",
      message: Success.AUTH.OTP_RESENT,
    });
  });

  static login = catchAsyncError(async (req, res) => {
    const { email, password } = req.body;
    console.log(email, password);
    if (!(email && password))
      throw new UserInputError(Errors.AUTH.FIELDS_REQUIRED);

    const user = await UserModel.findOne({ email: email });
    if (!user) throw new UserInputError(Errors.AUTH.NOT_FOUND);
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new UserInputError(Errors.AUTH.INVALID_CREDENTIALS);
    if (!user.isVerified) {
      return res.send({
        status: "failed",
        message: Errors.AUTH.INVALID_CREDENTIALS,
        isVerified: false,
      });
    }
    const token = jwt.sign(
      { userId: user._id, userEmail: user.email },
      process.env.SECRET_KEY,
      { expiresIn: "30d" }
    );

    res.status(200).cookie("token", token).send({
      status: "success",
      message: Success.AUTH.LOGIN_SUCCESS,
      token: token,
      data: user,
      isVerified: false,
    });
  });

  static sendResetPasswordEmail = catchAsyncError(async (req, res) => {
    const { email } = req.body;
    if (!email) throw new UserInputError(Errors.AUTH.FIELDS_REQUIRED);

    const user = await UserModel.findOne({ email: email });
    if (!user) throw new ServerError(Errors.AUTH.NOT_FOUND);

    const otp = generateOtp(4);
    user.otp = otp;
    user.otpExpiresAt = Date.now() + 10 * 60 * 1000; // OTP valid for 10 minutes
    await user.save();
    await sendEmail({
      to: user.email,
      subject: "Password Reset OTP",
      html: `<p>Your OTP for password reset is <b>${otp}</b>. It will expire in 10 minutes.</p>`,
    });
    return res.status(200).send({
      status: "success",
      message: Success.AUTH.OTP_SENT,
    });
  });

static resetPasswordWithOtp = catchAsyncError(async (req, res) => {
  const { email, otp, newPassword, newPasswordConfirmation } = req.body;
  console.log("resetPasswordWithOtp : otp ", otp)
  if(!email || !otp || !newPassword || !newPasswordConfirmation ) throw new UserInputError(Errors.AUTH.FIELDS_REQUIRED);
  if (newPassword !== newPasswordConfirmation) throw new UserInputError(Errors.AUTH.PASSWORD_MISMATCHED);
  const user = await UserModel.findOne({ email });
  console.log("resetPasswordWithOtp : user in email ", user)
  if(!user) throw new ServerError(Errors.AUTH.NOT_FOUND);
  if(!user.otp)throw new UserInputError(Errors.AUTH.OTP_NOT_FOUND);
  if(user.otp != otp ) throw new UserInputError(Errors.AUTH.INVALID_OTP);
  if (user.otpExpiresAt < Date.now()) throw new UserInputError(Errors.AUTH.EXPIRED_OTP)
    
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    user.password = hashedPassword;
    user.otp = null;
      user.otpExpiresAt = null;
      await user.save();

      return res
        .status(200)
        .json({ status: "success", message: Success.AUTH.RESET_SUCCESSFUL  });
        
})

static changePassword = catchAsyncError(async (req, res) => {
  const { currentPassword, newPassword, newPasswordConfirmation } = req.body;
  if (!currentPassword || !newPassword || !newPasswordConfirmation)
    throw new UserInputError(Errors.AUTH.FIELDS_REQUIRED);
  if (newPassword !== newPasswordConfirmation)
    throw new UserInputError(Errors.AUTH.PASSWORD_MISMATCHED);

  const isMatch = await bcrypt.compare(currentPassword, req.user.password);
  if (!isMatch) throw new UserInputError(Errors.AUTH.WRONG_PASSWORD);
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(newPassword, salt);
  await UserModel.findByIdAndUpdate(req.user._id, {
    password: hashedPassword,
  });
  return res.status(200).send({
    status: "success",
    message: Success.AUTH.PASSWORD_CHANGED,
  });
});


//------------------------recheck--------------
  static resetPasswordWithLink = async (req, res) => {
    console.log("50 password reset with link called ", req.body);
    const { userId, token } = req.params;
    if (!token || !userId)
      return res
        .status(401)
        .send({ status: "failed", message: "invalid token!" });
    const { password, password_confirmation } = req.body;
    console.log("password ", password);
    console.log("password_confirmation ", password_confirmation);
    if (!password || !password_confirmation)
      return res.status(400).send({
        status: "failed",
        message: "All fields are required!",
      });
    if (!password == password_confirmation)
      return res.status(400).send({
        status: "failed",
        message: "Both password should  match!",
      });
    try {
      const user = await UserModel.findById(userId);
      if (!user)
        return res
          .status(400)
          .send({ status: "failed", message: "invalid Credentials!" });
      const secretKey = user._id + process.env.SECRET_KEY;
      const tokenData = jwt.verify(token, secretKey);
      if (!tokenData)
        return res
          .status(401)
          .send({ status: "failed", message: "Invalid Token !!!!" });
      if (tokenData.userId != user._id)
        return res.status(401).send({
          status: "failed",
          message: "user and token does not match",
        });
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      await UserModel.findByIdAndUpdate(userId, { password: hashedPassword });
      return res.status(200).send({
        status: "success",
        message: "Passowrd reset successful!",
      });
    } catch (err) {
      console.log("12 password reset error : ", err);
      if (err.name == "TokenExpiredError")
        return res.status(401).send({
          status: "failed",
          message: "Token has been Expired!",
          err: err,
        });
      return res.status(401).send({
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

 
}
export default AuthController;
