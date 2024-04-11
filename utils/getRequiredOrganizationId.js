// this function gives the organization id of the user and if the user is admin then he does not have the 
//organization id hence in this case the organization id is fetched from the query params and then provides as requiredOrganizationId

const getRequiredOrganizationId =  (req, message) => {
  let requiredOrganizationId = req?.user?.organization;

  if (req.user.role == "admin") {
    const { organizationId } = req.query;
    if (!organizationId)
      throw new Error(`${message}`);
    requiredOrganizationId = organizationId;
  }
  return requiredOrganizationId;
};

export default getRequiredOrganizationId;
