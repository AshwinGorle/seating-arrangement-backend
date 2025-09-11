import { catchAsyncError } from "../middlewares/catchAsyncError.middleware.js";
import SPTModel from "../models/SPTModel.js";
import { ServerError } from "../utils/ErrorClasses.js";
import mongoose from "mongoose";
import Success from "../utils/successMessages.js";
import { error } from "../middlewares/error.middleware.js";
import Errors from "../utils/errorMessages.js";

class SPTController {
  // Create a new subscription plan
  static getAllSPTs = catchAsyncError(async (req, res) => {
    const subscriptionPlans = await SPTModel.find();
    res.status(200).json({
      status: "success",
      message: Success.PLAN.ALL_FETCHED,
      data: subscriptionPlans,
    });
  });

  // Get subscription plan by ID
  static getSPTById = catchAsyncError(async (req, res) => {
    const { planId } = req.params;
    const subscriptionPlan = await SPTModel.findById(planId);
    if (!subscriptionPlan) throw new ServerError(Errors.PLAN.NOT_FOUND);
    res.status(200).json({
      status: "success",
      message: Success.PLAN.FETCHED,
      data: subscriptionPlan,
    });
  });

  static createSPT = catchAsyncError(
    async (req, res, next, session) => {
      const { charges, renewalPeriodUnit, renewalPeriodAmount } = req.body;
      const newSPT = new SPTModel({
        charges,
        renewalPeriodUnit,
        renewalPeriodAmount,
      });

      await newSPT.save({ session });

      return res.status(201).json({
        status: "success",
        message: Success.PLAN.CREATED,
        data: newSPT,
      });
    },
    true
  );

  // Update an existing subscription plan
  static updateSPTById = catchAsyncError(async (req, res) => {
    const { planId } = req.params;
    const { charges, renewalPeriodUnit, renewalPeriodAmount } = req.body;

    const updatedSPT =
      await SPTModel.findByIdAndUpdate(
        planId,
        { charges, renewalPeriodUnit, renewalPeriodAmount },
        { new: true }
      );

    if (!updatedSPT) throw new ServerError(Error.PLAN.NOT_FOUND);

    res.status(200).json({
      status: "success",
      message: Success.PLAN.UPDATED,
      data: updatedSPT,
    });
  });

  // Delete an existing subscription plan
  static deleteSPTById = catchAsyncError(async (req, res) => {
    const { planId } = req.params;

    const deletedSPT =
      await SPTModel.findByIdAndDelete(planId);

    if (!deletedSPT) {
      throw new ServerError("Subscription plan not found");
    }

    res.status(200).json({
      status: "success",
      message: "Subscription plan deleted successfully",
      data: deletedSPT,
    });
  });
}
export default SPTController;
