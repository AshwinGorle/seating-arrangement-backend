import { UserInputError } from "./ErrorClasses.js";


export const validateSchedule = (req) => {
  const { schedule } = req.body
  if (!(schedule == "morning" || schedule == "noon" || schedule == "evening" || schedule == "fullDay")) {
    throw new UserInputError("invalid schedule!");
  }
}

export const validateDuration = (req) => {
    const {renewalPeriodUnit, renewalPeriodAmount} = req.body;
    console.log("renawalPeriod----", renewalPeriodUnit , renewalPeriodAmount)
    if(!((renewalPeriodUnit == "months" || renewalPeriodUnit == "days") && renewalPeriodAmount > 0 )){
        throw new UserInputError("invalid Duration!");
    }
}


export const validateIsSameOrganization = (organizationA, organizationB) => {
  if (organizationA.toString() != organizationB.toString()) {
    return false;
  } else {
    return true;
  }
}