import OrganizationController from '../controllers/organizationController.js';
import express from 'express'
import restrictTo from '../middlewares/restrictTo.js';
const organizationRouter = express.Router();

organizationRouter.get("/", restrictTo(["admin"]) ,OrganizationController.getAllOrganizations);
organizationRouter.get("/:organizationId", restrictTo(["admin", "owner"]) ,OrganizationController.getOrganizationById);
organizationRouter.post("/", restrictTo(["admin"]) ,OrganizationController.createOrganization);
organizationRouter.put("/settings/default_price/:organizationId", restrictTo(["admin", "owner"]) ,OrganizationController.updateOrganizationSettings);
organizationRouter.put("/:organizationId", restrictTo(["admin", "owner"]) ,OrganizationController.updateOrganization);

organizationRouter.get("/get_user/:organizationId", restrictTo(["admin","owner"]) ,OrganizationController.getUserOfOrganization);
organizationRouter.post("/add_owner", restrictTo(["admin"]) ,OrganizationController.addOwnerToOrganization);
organizationRouter.post("/add_staff", restrictTo(["admin", "owner"]) ,OrganizationController.addStaffToOrganization);
organizationRouter.delete("/remove_owner", restrictTo(["admin"]) ,OrganizationController.deleteOwnerFromOrganization)
organizationRouter.delete("/remove_staff", restrictTo(["admin","owner"]) ,OrganizationController.deleteStaffFromOrganization);

organizationRouter.delete("/:organizationId", restrictTo(["admin"]) ,OrganizationController.deleteOrganization);
export default organizationRouter;