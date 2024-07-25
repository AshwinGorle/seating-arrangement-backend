import mongoose from 'mongoose'

const addressSchema = new mongoose.Schema({
     houseNumber : {type : String},
     landMark : {type : String},
     coloni : {type :String},
     city : {type : String, default : "indore"},
     state : {type : String, default : "Madhya Pradesh"},
     pinCode : {type : Number}
})

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
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
  
  gender : {
    type :  String,
    enum : ["M", "F", "O"]
  },
  
  avatar: {
    type : String ,
    default : "https://th.bing.com/th/id/OIP.XA5z4qJxvb0XtfkwB0DLxAAAAA?rs=1&pid=ImgDetMain"
  },
  
  city: { type: String},
  phone : {type : String},
  address : {type : String},
  status : {
    type : String,
    enum : ["active", "inactive"],
    default : "active",
    required : true
  },
 
  organization : {
    type : mongoose.Schema.Types.ObjectId,
    ref : 'Organization' 
  }

});

const UserModel = mongoose.model('User', userSchema);

export default UserModel;
