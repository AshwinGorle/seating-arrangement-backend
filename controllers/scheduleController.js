import MemberModel from "../models/MemberModel.js";
import OrganizationModel from "../models/OrganizationModel.js";
import mongoose from "mongoose";

class ScheduleController{

static dueMonthlyFeeForOrganization = async (organizationId , retryCount = 4) => {
  const session = await mongoose.startSession();
  await session.startTransaction();
  try {
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    const allMembers = await MemberModel.find({
      organization: organizationId,
      $nor: [{ membershipStatus: "inactive" }],
    }).populate("account");

    for (let m = 0; m < allMembers.length; m++) {
      //updating the balance making the adding the monthly seatCharge in acount balance on ending month;
      const member = allMembers[m];
      const joiningDate = member.createdAt;
      
      //de-comment in production
      // if (currentDate.getTime() === joiningDate.getTime()) continue;

      //updating fee on specific condition
      if (
        true || currentDate.getDate() == joiningDate.getDate() &&
        (!(currentDate.getMonth() == joiningDate.getMonth()) ||
          !(currentDate.getFullYear() == joiningDate.getFullYear()))
      ) {
        console.log("payment updeted-----")
        member.account.balance += member.monthlySeatFee;
        member.membershipStatus = "expired";
        await Promise.all([
          member.save({ session }),
          member.account.save({ session }),
        ]);
      }
    }
    
    await session.commitTransaction();
    await session.endSession();
  } catch (err) {
    if (retryCount > 0 && err.code === 251) { // Retry if transient transaction error
      console.log(`Retrying transaction. Attempts left: ---------------- ${retryCount}`);
      await session.abortTransaction();
      await session.endSession();
      await this.dueMonthlyFeeForOrganization(organizationId, retryCount - 1);
    } else {
      await session.abortTransaction();
      await session.endSession();
      throw err;
    }
  }
};

static dueMonthlyFeeForAllOrganizations = async (req, res) => {
  console.log("schedule duduction  of Monthly Fee started...");
  let orgIdx = 0;
  let returnOrganization = [];
  try {
    const organizations = await OrganizationModel.find({});
    returnOrganization = organizations;
    while (orgIdx < organizations.length) {
      const organization = organizations[orgIdx];
      await this.dueMonthlyFeeForOrganization(organization._id);
      orgIdx++;
    }

    res.send({
      status : "success",
      message : `All organization's members account checked for date  ${ new Date()}`,
      data : organizations
    })
  } catch (err) {
    const successfullyEditedOrg = returnOrganization?.splice(0, orgIdx);
    const unSuccessfullEditedOrg = returnOrganization;
    console.log(" due fee charging shchedule err ", err);
    console.log("Successfully edited organizations : ", successfullyEditedOrg);
    console.log(
      "Un-successfully edited organizations : ",
      unSuccessfullEditedOrg
    );
    
    return res.send({
      status : "failed",
      message : `${err.message}`,
      successfullyEditedOrg : successfullyEditedOrg,
      unSuccessfullEditedOrg : unSuccessfullEditedOrg
    })
  }
}

}

export default ScheduleController;