import mongoose from "mongoose";

const organizationSchema = new mongoose.Schema({
    name : {type : String},
    address : {type : String},
    description : {type : String},
    logo : {type : String},
    banner : {type : String},
    owner : [{type : mongoose.Schema.Types.ObjectId, ref: 'User'}],
    staff : [{type : mongoose.Schema.Types.ObjectId, ref: 'User'}],
    settings : {
         defaultPrice : {
            locker : {
                small : {type : Number, default : 100},
                medium : {type : Number, default : 150},
                large : {type : Number, default : 200},
            },
            seat : {
                morning : {type : Number,  default : 250},
                evening : {type : Number,  default : 250},
                noon : {type : Number,  default : 250},
                fullDay : {type : Number,  default : 750},
            }
        }
    }

})

const OrganizationModel = mongoose.model('Organization',organizationSchema);
export default OrganizationModel;