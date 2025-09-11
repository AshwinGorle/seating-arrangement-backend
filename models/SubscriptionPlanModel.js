
import mongoose from "mongoose";


export const SubscriptionPlanSchema = new mongoose.Schema({
  purchasedBy : {
     type : mongoose.Schema.Types.ObjectId,
     ref : 'User',
     required : true
  },
  status : {
    type : String,
    enum : ["active", "inActive"],
    default : 'active'
  },
  
  validity: {
    type: Date,
    required: true,
    default: Date.now,
  },

  purchaseDate: {
    type: Date,
    default: Date.now,
  },

  renewalPeriodUnit: {
    type: String ,
    enum : ['days', 'months'],
    default: 'months',
  },
  renewalPeriodAmount : {
    type : Number,
    default : 1
  },

  renewalPayments : [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Payment",
  }],

  charges: {
    type: Number,
    default: 0,
    required: true,
  },

  organization : {
    type : String,
    required : true
  }
},);


const SubscriptionPlanModel = mongoose.model("SubscriptionPlan", SubscriptionPlanSchema);
export default SubscriptionPlanModel;
