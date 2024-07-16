import MemberModel from "../models/MemberModel.js";
import PaymentModel from "../models/PaymentModel.js";
import mongoose, { mongo } from "mongoose";
import authorizeActionInOrganization from "../utils/authorizeActionInOrganization.js";
import getRequiredOrganizationId from "../utils/getRequiredOrganizationId.js";
import OrganizationModel from "../models/OrganizationModel.js";
import ServiceModel from "../models/ServiceModel.js";
import { getValidityFromDuration, isPrevPendingPaymentForSameService } from "../utils/utilsFunctions.js";
import { getPayment } from "../helper/payment.js";
import { getMember } from "../helper/member.js";
import { getService } from "../helper/service.js";
import { ServerError } from "../utils/ErrorClasses.js";
class PaymentController {

  static createPaymentUtil = ( {amount, chargedOn, serviceType, service , status='pending' ,method='cash', desciption, organization , renewalPeriodAmount,
    renewalPeriodUnit} ) => {
    try{
      if(!amount || !chargedOn || !serviceType || !service || !organization || !renewalPeriodAmount || !renewalPeriodUnit) throw new Error('All * fields are required');
      const newPendingPayment =  new PaymentModel({
        amount,
        chargedOn,
        serviceType,
        service,
        status,
        method,
        organization,
        desciption,
        timeline : [],
        renewalPeriodAmount,
        renewalPeriodUnit
      })  
      return newPendingPayment;
    }catch(err){
       throw new Error(err.message);
    }
  }
  // we will recive a payment id which which is supposed to a pending paymnet we have to mark it complete
  static markPaymentCompletedUtil = async  (paymentId)=>{
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        if(!paymentId) throw new Error("paymentId is required to 'complete' payment! ");
        const payment = await PaymentModel.findById(paymentId);
        if(!payment) throw new Error("Payment not found!");
        const service  = await  ServiceModel.findById(payment.service);
        if(!service) throw new Error("Service not found! for which this payment is begin made");
        if(payment.status == "completed") throw new Error ("Payment has already done!");
        
        //check whether there is pending payment for the same service before this payment  if yes then  that should be completed first
        if(isPrevPendingPaymentForSameService(payment, service._id) == true) {throw new Error("There are previous pending payments for this service resolve them first");}
        
        //increaseing the corresponding service validity adn

        // const renewalPayment =  {
        //    payment : payment._id,
        //    previousValidity : service.validity,
        //    updatedValidity : payment.validity
        // }

        // Defining new validity from the payment's validity;
        const oldDate = new Date( Date.now());
        const newValidity = getValidityFromDuration(payment.renewalPeriodUnit, payment.renewalPeriodAmount, service.validity)
        service.validity = newValidity; 
        payment.timeline.push({action : `${payment.status} --> completed`});
        payment.status = 'completed';
        payment.updatedAt = Date.now();
        
        //updating history of payment and renewalPayments service 
        // await ServiceModel.findByIdAndUpdate({ $push : { renewalPayments : renewalPayment }}).session(session);
        
        await service.save({session});
        await payment.save({session});

        await session.commitTransaction();
        await session.endSession();

        return { payment : payment , service : service};

      }catch (err){
         await session.abortTransaction();
         await session.endSession();
         throw new Error(err.message);
      }
  }

///////////////////////////////////////////////////////////////////////////////////////////////////////
  
   
  static completePayment = async (req, res) => {
        const {paymentId} = req.body;
        console.log('completePayment called for Pid : ', paymentId );
        try{
            const resData = await this.markPaymentCompletedUtil(paymentId);
            return res.send({status : 'success', message : "Payment completed successfully!", data : resData });
        }catch(err){
          console.log("completePayment Error : ",err);
          return res.send({status : 'failed', message : err.message })
        }
  }  

  static chargePayment = async (req, res) =>{
        const {amount, serviceId, validity, method, desciption , isReceived} = req.body;
        const session = await mongoose.startSession();
        await session.startTransaction();
        try{
          const service = ServiceModel.findById(serviceId);
          if(!service) throw new Error('service not found for which payment is being created!');
          const validityDate = new Date(validity)
          
          // checking if the payment validity is less than the curr validity of service if yes then this payment can not be created
          if(validityDate <= service.validity) throw new Error('the payment you are creating has less validity than the service currently have!');
          
          
          const newPendingPayment =  await new PaymentModel.create([{
            amount,
            paidBy : service?.occupant,
            serviceType,
            service : serviceId,
            method,
            organization,
            desciption,
            validity : validityDate,
            status : 'pending',
            timeline : []
          }], {session});

          // inserting this payment into members payment array
          const member = MemberModel.findByIdAndUpdate(service.occupant, {
            $push : {payments : newPendingPayment._id}
          }).session({session});
         



        }catch(err){
           res.send({status : 'failed', message : err.message});
        }
  }
  
  static getAllPaymentsOfMember = async (req, res) => {
    console.log("all payment fetched called");
    try {
      const { memberId } = req.params;
      if (!memberId)
        throw new Error(
          "To fetch all payments of member. memberId is required!"
        );
      const member = await MemberModel.findById(memberId)
        .populate("payments")
        .populate({
          path: "account",
          populate: {
            path: "accountHolder",
          },
        });
      if (!member) throw new Error("Member not found!");
      authorizeActionInOrganization(
        req.user,
        member.organization,
        "You are not authorized to get payment of this member!"
      );
      res.status(200).send({
        status: "success",
        message: "Payments and Account of member successfully!",
        data: { payments: member.payments, account: member.account },
      });
    } catch (err) {
      console.error("Error fetching all payment:", err);
      res.status(500).send({
        status: "failed",
        message: err.message,
      });
    }
  };
  
  static getAllPaymentsByServiceId = async(req, res) => {
      const {serviceId} = req.params
      console.log("service id ------", serviceId)
      try{
        if(!serviceId) throw new ServerError("Service id needed");
        const service = await ServiceModel.findById(serviceId);
        if(!service) throw new ServerError("Service not found");
        let member = await getMember(service.occupant);
        member = await member.populate('payments');
        const servicePaymets = member.payments.filter((payment)=> payment.service.toString() == serviceId.toString());
        return res.status(200).json({status : 'success', message : "service Fetched successfully", data : servicePaymets});
      }catch(err){
        console.log("getAllPaymentsBySerceId : ", err);
        return res.status(500).json({status : 'failed', message : err.message});
      }
  }
  static example=async()=>{
    console.log('ehllow');
    console.log('ehllow');
    console.log('ehllow');
    console.log('ehllow');
    
  }
  static getAllPayment = async (req, res) => {
    try {
      const organizationId = getRequiredOrganizationId(
        req,
        "Admin require organizationId to fetch all payments"
      );
      const organization = await OrganizationModel.findById(organizationId);
      if (!organization)
        throw new Error("To get all payment organization Id is required");
      const payments = await PaymentModel.find({
        organization: organizationId,
      }).populate("paidBy");

      res.status(200).send({
        status: "success",
        message: "All payment fetched successfully!",
        data: payments,
      });
    } catch (err) {
      console.error("Error fetching all payment:", err);
      res.status(500).send({
        status: "failed",
        message: err.message,
      });
    }
  };

  static getPaymentById = async (req, res) => {
    try {
      const { paymentId } = req.params;

      // Check if paymentId is provided
      if (!paymentId) {
        throw new Error("Payment ID is required");
      }

      // Fetch the payment by its ID
      const payment = await PaymentModel.findById(paymentId);

      // Check if payment exists
      if (!payment) {
        throw new Error("Payment not found");
      }

      // Send the payment data in the response
      res.status(200).send({
        status: "success",
        data: payment,
      });
    } catch (err) {
      console.error("Error fetching payment:", err);
      res.status(500).send({
        status: "failed",
        message: err.message,
      });
    }
  };

  static makePayment = async (req, res) => {
    const { amount, type, method, paidBy } = req.body;

    const session = await mongoose.startSession();
    await session.startTransaction();

    try {
      if (!amount || !type || !method || !paidBy)
        throw new Error("All fields are required");

      // Fetch the member and its corresponding account
      const member = await MemberModel.findById(paidBy).populate("account");
      if (!member) throw new Error("No such member found!");

      authorizeActionInOrganization(
        req.user,
        member.organization,
        "You are not authorized to make payment in this organization"
      );

      const orgaizationId = getRequiredOrganizationId(
        req,
        "Admin requires  organization ID  to create a payment."
      );
      // Create the payment entry
      const payment = await PaymentModel.create(
        [{ amount, type, method, paidBy, organization: orgaizationId }],
        { session }
      );

      // Update the member's payments array with the payment ID
      member.payments.push(payment[0]._id);

      // Update the account balance
      member.account.balance -= amount;
      if (member.account.balance <= 0) member.membershipStatus = "active";

      // Save the member and its corresponding account
      await Promise.all([
        member.save({ session }),
        member.account.save({ session }),
      ]);

      // Commit the transaction and end the session
      await session.commitTransaction();
      await session.endSession();

      return res.status(201).send({
        status: "success",
        message: "Payment made successfully",
        data: [member, payment],
      });
    } catch (err) {
      // Rollback the transaction and end the session in case of an error
      await session.abortTransaction();
      await session.endSession();

      console.log("makePayment error:", err);
      return res
        .status(500)
        .send({ status: "failed", message: `${err.message}` });
    }
  };

  static updatePaymentById = async (req, res) => {
    const session = await mongoose.startSession();
    await session.startTransaction();
    try {
      const { paymentId } = req.params;
      const { amount, renewalPeriodAmount, renewalPeriodUnit } = req.body;

      const payment = await getPayment(paymentId);
      const service = await getService(payment.service);

      //check auth
      if(payment.status != 'pending') throw new ServerError("Only pending payment can be updated");
      authorizeActionInOrganization(req.user, payment.organization);
       
      // updating payment;
      const updatedPayment = await PaymentModel.findByIdAndUpdate(payment._id, {renewalPeriodAmount, renewalPeriodUnit, amount}, {new : true}).session(session);
      const updatedService = await ServiceModel.findByIdAndUpdate(service._id, {renewalPeriodAmount, renewalPeriodUnit, charges : amount}, {new : true}).session(session);
      updatedPayment.timeline.push({action : `Amount ${payment.amount} --> ${amount} renewalPeriodAmount ${payment.renewalPeriodAmount} --> ${renewalPeriodAmount} renewalPriodUnit ${payment.renewalPeriodUnit} --> ${renewalPeriodUnit}`})
      await updatedPayment.save({session});

      await session.commitTransaction();
      await session.endSession();

      // Send the updated payment data in the response
      res.status(200).send({
        status: "success",
        message: "Payment updated successfully",
        data: {payment : updatedPayment, service : updatedService},
      });
    } catch (err) {
      await session.abortTransaction();
      await session.endSession();
      console.error("Error updating payment:", err);
      res.status(500).send({
        status: "failed",
        message: err.message,
      });
    }
  };

  static deletePaymentById = async (req, res) => {
    const session = await mongoose.startSession();
    await session.startTransaction();
    try {
      const { paymentId } = req.params;

      // Check if paymentId is provided
      if (!paymentId) {
        throw new Error("Payment ID is required");
      }

      // Fetch the payment by its ID
      const payment = await PaymentModel.findById(paymentId);
      if (!payment) throw new Error("The payment does not exists!");

      const member = await MemberModel.findById(payment.paidBy).populate(
        "account"
      );
      if (!member)
        throw new Error(
          "Payment not deleted ! member who paid does not exists"
        );

      // Check if payment exists
      if (!payment) {
        throw new Error("Payment not found");
      }

      //check auth for admin , staff, owner permisstions
      authorizeActionInOrganization(req.user, payment.organization);

      //Before deleting the payment reflecting the changes of this deletion in curresponding member's account
      member.account.balance = member.account.balance + payment.amount;

      //removing the deleting payment from the curresponding member's paymets array
      await MemberModel.findByIdAndUpdate(
        member._id,
        { $pull: { payments: payment._id } },
        { new: true }
      ).session(session);

      // Saving the updated account balance
      await member.account.save({ session });

      //finally deleting the payment;
      await PaymentModel.findByIdAndDelete(payment._id).session(session);

      await session.commitTransaction();
      await session.endSession();

      // Send the updated payment data in the response
      res.status(200).send({
        status: "success",
        message:
          "Payment Deleted and corresponding Account Updated successfully",
        data: [payment, member.account],
      });
    } catch (err) {
      await session.abortTransaction();
      await session.endSession();
      console.error("Error deleting payment:", err);
      res.status(500).send({
        status: "failed",
        message: err.message,
      });
    }
  };
}

export default PaymentController;
