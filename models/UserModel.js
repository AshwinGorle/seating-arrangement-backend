import mongoose from 'mongoose'

const AddressSchema = new mongoose.Schema({
  city : {
   type : String,
  },
  state : {
   type : String,
  },
  country : {
   type : String
  }
})

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    // unique: true,
    trim: true
  },
  name: {
    type: String,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['admin', 'owner', 'staff'],
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  address : {
    type : AddressSchema
   },
  gender : {
    type :  String,
    enum : ["M", "F", "O"]
  },
  
  avatar: {
    type : String ,
    default : "https://th.bing.com/th/id/OIP.XA5z4qJxvb0XtfkwB0DLxAAAAA?rs=1&pid=ImgDetMain"
  },
  
 
  phone : {type : String},
  status : {
    type : String,
    enum : ["active", "inactive"],
    default : "active",
    required : true
  },
 
  organization : {
    type : mongoose.Schema.Types.ObjectId,
    ref : 'Organization' 
  },
  otp: {
    type: Number,
    default: null,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  otpExpiresAt: {
    type: Date,
    default: null,
  },
  subscription : {
    type : Object
  },
  systemAccess : {
    type   : Boolean,
    default : false
  }

});

const UserModel = mongoose.model('User', userSchema);

export default UserModel;
