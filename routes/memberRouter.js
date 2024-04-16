import express from 'express';
import MemberController from "../controllers/memberController.js"
import restrictTo from '../middlewares/restrictTo.js';
const memberRouter = express.Router();


//protected route
memberRouter.get('/', restrictTo(["all"]), MemberController.getAllMemberByOrganizationId) // necessary query organiztionId;
memberRouter.get('/search', restrictTo(["all"]), MemberController.memberSearch) // necessary query organiztionId;

memberRouter.get('/details/:memberId', restrictTo(["all"]), MemberController.getMemberById)
memberRouter.post('/', restrictTo(["all"]), MemberController.createMember) //organizationId as query  required if auth is admin
memberRouter.delete('/:memberId', restrictTo(["all"]), MemberController.deleteMember)
memberRouter.put('/:memberId', restrictTo(["all"]), MemberController.updateMemberById)



export default memberRouter;