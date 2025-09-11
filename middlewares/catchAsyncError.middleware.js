import mongoose from "mongoose";

export const catchAsyncError = (theFun, withTransaction = false) => async (req, res, next) => {
    let session  = null;
    if(withTransaction){
        session = await mongoose.startSession();
        session.startTransaction();
    }
    try{
      await theFun(req, res, next, session)
      console.log("inside try ---------------------------------------- ")
      if(session) await session.commitTransaction()
    }catch(err){
      console.log("inside catch : ----------------------------------------")
      if(session) await session.abortTransaction()
        next(err)
    }finally{
      console.log("inside finally : ----------------------------------------")
      if(session) await session.endSession();
    }

    // theFun(req, res, next).catch(next);
}

