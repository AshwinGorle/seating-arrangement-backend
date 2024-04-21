import mongoose from "mongoose";

const addressSchema = new mongoose.Schema({
  houseNumber: { type: String },
  landMark: { type: String },
  colony: { type: String },
  city: { type: String, default: "Indore" },
  state: { type: String, default: "Madhya Pradesh" },
  pinCode: { type: Number },
});

const memberSchema = new mongoose.Schema({
  //make it required in production.
  monthlySeatFee: {
    type: Number,
    default: 0
  },
  name: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  gender : {
    type :  String,
    enum : ["M", "F", "O"]
  },
  membershipStatus: {
    type: String,
    enum: ["active", "inactive", "expired"],
    default: "active",
  },
  address: {
    type: String,
  },
  seat: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Seat",
  },
  lockers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Locker",
    },
  ],
  payments: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payment",
    },
  ],
  account : {
    type : mongoose.Schema.Types.ObjectId,
    ref : "Account"
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  preperation: { type: String },
  
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Organization",
  },
  avatar : {
    type : String
  }
});

memberSchema.index({ name: 1, organization: 1 }, { unique: true });
memberSchema.index({ email: 1, organization: 1 }, { unique: true });

const MemberModel = mongoose.model("Member", memberSchema);

export default MemberModel;
