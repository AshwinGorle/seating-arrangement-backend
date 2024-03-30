import mongoose from "mongoose";

const organizationSchema = new mongoose.Schema({
    name : {type : String},
    address : {type : String},
    description : {type : String},
    logo : {type : String},
    banner : {type : String},
    owner : [{type : mongoose.Schema.Types.ObjectId, ref: 'User'}],
    staff : [{type : mongoose.Schema.Types.ObjectId, ref: 'User'}],
})

const OrganizationModel = mongoose.model('Organization',organizationSchema);
export default OrganizationModel;