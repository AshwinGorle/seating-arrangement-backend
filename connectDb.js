import mongoose from "mongoose";

const connectDb  = async(DATABASE_URL)=>{
   const dbOptions = {
    dbName : "LiberaryManagenment"
   }
   try{
     await mongoose.connect(DATABASE_URL, dbOptions)
     console.log("database connected...");
   }catch(err){
     console.log("db connection error : ",err);
   }
}

export default connectDb;