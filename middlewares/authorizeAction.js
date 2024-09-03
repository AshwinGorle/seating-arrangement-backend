import { getMember } from "../helper/member.js";
import { getSeat } from "../helper/seat.js";
import MemberModel from "../models/MemberModel.js";

const authorizeMemberAction = async (req) => {
  const { memberId } = req.params;
  console.log("authorize-action-memberId", memberId);
  console.log("authorize-action-req-user", req.user);
  const member = await getMember(memberId);
  console.log("authorize-action-member", member);
  if (member.organization.toString() != req.user.organization.toString()) {
    throw new Error("You are not authorize for this action!!!");
  }
};
const authorizeSeatAction = async (req) => {
  const { seatId } = req.params;
  console.log("authorize-action-seatId", seatId);
  console.log("authorize-action-req-user", req.user);
  const seat = await getSeat(seatId);
  console.log("authorize-action-seat", seat);
  if (member.organization.toString() != req.user.organization.toString()) {
    throw new Error("You are not authorize for this action!!!");
  }
};

const authorizeActions = (authActionFor) => async (req, res, next) => {
  try {
    if (req.user.role != "admin") {
      switch (authActionFor) {
        case "member":
          await authorizeMemberAction(req);

          case "seat":
            await authorizeSeatAction(req);
  
        default : throw new Error("inappropriate 'AuthorizationFor value' is provided!")
      }
    }
  } catch (err) {
    return res.status(403).json({ status : 'failed', message : err.message});
  }
  next();
};


export default authorizeActions;