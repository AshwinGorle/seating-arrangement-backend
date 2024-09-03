import mongoose from "mongoose";

export const catchAsyncError = (theFun, withTransaction = false) => async (req, res, next) => {
    let session  = null;
    if(withTransaction){
        session = await mongoose.startSession();
        session.startTransaction();
    }
    try{
      await theFun(req, res, next, session)
      if(session) await session.commitTransaction()
    }catch(err){
      if(session) await session.abortTransaction()
      next(err)
    }finally{
      if(session) session.endSession();
    }

    // theFun(req, res, next).catch(next);
}

