import MemberModel from "../models/MemberModel.js";
import OrganizationModel from "../models/OrganizationModel.js";
import mongoose from "mongoose";

export const dueMonthlyFeeForOrganization = async (organizationId) => {
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
    await session.abortTransaction();
    await session.endSession();
    throw err;
  }
};

export const dueMonthlyFeeForAllOrganizations = async () => {
  console.log("schedule duduction  of Monthly Fee started...");
  let orgIdx = 0;
  let returnOrganization = [];
  try {
    const organizations = await OrganizationModel.find({});
    returnOrganization = organizations;
    while (orgIdx < organizations.length) {
      const organization = organizations[orgIdx];
      await dueMonthlyFeeForOrganization(organization._id);
      orgIdx++;
    }

    console.log(
      "all organizations member fee has been charged and there account updated successfully ! "
    );
  } catch (err) {
    const successfullyEditedOrg = returnOrganization?.splice(0, orgIdx);
    const unSuccessfullEditedOrg = returnOrganization;
    console.log(" due fee charging shchedule err ", err);
    console.log("Successfully edited organizations : ", successfullyEditedOrg);
    console.log(
      "Un-successfully edited organizations : ",
      unSuccessfullEditedOrg
    );
  }
};
