
import mongoose from "mongoose";
export const serviceSchema = new mongoose.Schema({
  occupant : {
     type : mongoose.Schema.Types.ObjectId,
     ref : 'Member'
  },
  serviceType: {
    type: String,
    enum: ["SeatService", "LockerService" ],
  },
  
  //   status : {
  //     type : Boolean,
  //     default : false
  //   },
  lastBillingDate: {
    type: Date,
    required: true,
    default: Date.now,
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
  charges: {
    type: Number,
    default: 0,
    required: true,
  },
  organization : {
    type : String,
    required : true
  }
}, {discriminatorKey : 'serviceType'});

const seatServiceSchema = new mongoose.Schema({
  seat: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Seat",
    default : null
  },
});
const lockerServiceSchema = new mongoose.Schema({
  locker: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Locker",
    default : null 
  },
});

const ServiceModel = mongoose.model("Service", serviceSchema);
ServiceModel.discriminator('SeatService', seatServiceSchema);
ServiceModel.discriminator('LockerService', lockerServiceSchema);
export default ServiceModel;
