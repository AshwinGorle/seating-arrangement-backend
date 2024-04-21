import mongoose from "mongoose";
import AccountModel from "../models/AccountModel.js";
import MemberModel from "../models/MemberModel.js";
import OrganizationModel from "../models/OrganizationModel.js";
import getRequiredOrganizationId from "../utils/getRequiredOrganizationId.js";

class AccountController {
  static getAllAccount = async (req, res) => {
      const{page = 1, limit = 10} = req.query;
      const skip = (page-1)*limit;
      try {
        const organizationId = getRequiredOrganizationId(
          req,
          "Admin requires Organization Id to fetch accounts"
        );
      const allAccounts = await AccountModel.find({ organization : organizationId});
      return res.status(200).send({
        status: "success",
        message: `Accounts fetched successfully`,
        data : allAccounts
      });
    } catch (err) {
      return res.status(500).send({
        status: "failed",
        message: `${err.message}`,
      });
    }
  };

  static createAccount = async (memberId, organizationId, monthlySeatFee = 0 ,session) => {
    if (!memberId)
      throw new Error("Member ID is required to create account of member");
    if (!organizationId)
      throw new Error(
        "Organization ID is required to create account of member"
      );

    try {
      const member = await MemberModel.findById(memberId).session(session);
      if (!member)
        throw new Error(`No member found with the id of ${memberId}`);
      const organization = await OrganizationModel.findById(
        organizationId
      ).session(session);
      if (!organization)
        throw new Error(
          `No organization found with the id of ${organizationId}`
        );

      const createdAccount = await AccountModel.create(
        [
          {
            balance: monthlySeatFee,
            organization: organizationId,
            accountHolder: memberId,
          },
        ],
        { session }
      );

      const updatedMember = await MemberModel.findByIdAndUpdate(
        memberId,
        {
          account: createdAccount[0]._id,
        },
        { new: true }
      ).session(session);

      return createdAccount[0];
    } catch (err) {
      console.error("Error creating account:", err);
      throw err; // Re-throw the error to be caught by the caller
    }
  };
}

export default AccountController;
