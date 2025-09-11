import mongoose from "mongoose";

const SPTSchema = new mongoose.Schema({
      charges : {
        type : Number,
        require : true
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
})

const SPTModel = new mongoose.model("SPT", SPTSchema);
export default SPTModel;