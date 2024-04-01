import  express  from "express";
import ScheduleController from "../controllers/scheduleController.js";

const scheduleRouter = express.Router();

scheduleRouter.get('/all_organizaition_due_check' , ScheduleController.dueMonthlyFeeForAllOrganizations )


export default scheduleRouter;