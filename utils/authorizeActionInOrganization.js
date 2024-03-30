const authorizeActionInOrganization = (user, organizationId, action) => {
    if (
      !(
        user.role === "admin" ||
        ((user.role === "staff" || user.role === "owner") &&
          user.organization.toString() === organizationId.toString())
      )
    ) {
      throw new Error(`${action}`);
    }
  };
  
  export default authorizeActionInOrganization;