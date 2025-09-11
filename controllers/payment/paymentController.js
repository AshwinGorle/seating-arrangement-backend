import { catchAsyncError } from "../../middlewares/catchAsyncError.middleware.js";
import SPTModel from "../../models/SPTModel.js";
import UserModel from "../../models/UserModel.js";
import { ServerError, UserInputError } from "../../utils/ErrorClasses.js";
import Errors from "../../utils/errorMessages.js";
import Razorpay from "razorpay";
import RazorpayProvider from "./getRazorpayUtils.js";
import Success from "../../utils/successMessages.js";
import crypto from "crypto"; 
import {getValidityFromDuration} from "../../utils/utilsFunctions.js"


class RazorpayPaymentController {
  static generateOrder = async (planId, buyerId) => {
    const plan = await SPTModel.findById(planId);
    const buyer = UserModel.findById(buyerId);
    if (!plan) throw new ServerError(Errors.PLAN.NOT_FOUND);
    if (!buyer) throw new ServerError(Errors.OWNER.NOT_FOUND);

    const options = {
      amount: plan.charges * 100, // amount in paise
      currency: "INR",
      receipt: `receipt_order_${buyerId}`,
      notes: { buyerId: buyerId, planId: planId }, // add ownerId to track later
    };

    const razorpayProvider = new RazorpayProvider();
    const order = await razorpayProvider.razorpay.orders.create(options);
    return order;
  };

  static createOrder = catchAsyncError(async (req, res) => {
    const planId = req.body.planId;
    const buyerId = req.user._id;
    console.log("order is creating....", planId, buyerId);

    if (!planId || !buyerId)
      throw new UserInputError(Errors.PAYMENT.INSUFFICIENT_INFO);
    const order = await this.generateOrder(planId, buyerId);
    console.log("order created : ", order)
    res.send({
      status: "success",
      message: Success.PAYMENT.ORDER_SUCCESSFUL(buyerId, order.id, planId),
      data: order,
    });
  });

  static verifyPayment = catchAsyncError(async (req, res, next) => {
    console.log("verify payment-------")
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;
    const body = razorpayOrderId + "|" + razorpayPaymentId;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_SECRET)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature === razorpaySignature) {
      const razorpayProvider = new RazorpayProvider();
      const order = await razorpayProvider.razorpay.orders.fetch(
        razorpayOrderId
      );
      const buyerId = order.notes.buyerId; // Get owner ID from the order notes
      const planId = order.notes.planId;
      const subscriptionPlan = await SPTModel.findById(planId);
      await UserM
      odel.findByIdAndUpdate(buyerId, {
        systemAccess: true,
        subscription: {
          planId: planId,
          status: "Active",
          //   validTill: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 1 month from now
          validTill: getValidityFromDuration(
            subscriptionPlan.renewalPeriodUnit,
            subscriptionPlan.renewalPeriodAmount,
            Date.now()
          ),
        },
      });

      return res
        .status(200)
        .json({ success: true, message: "Payment verified, access granted." });
    } else {
      return res
        .status(400)
        .json({ success: false, message: "Invalid payment signature." });
    }
  });
}

export default RazorpayPaymentController;
