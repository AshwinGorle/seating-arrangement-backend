import express from 'express'
import SPTController from '../controllers/SPTController.js';
import restrictTo from '../middlewares/restrictTo.js';
const SPTRouter = express.Router();
SPTRouter.get('/',restrictTo(["admin", "owner"]),SPTController.getAllSPTs);
SPTRouter.get('/:planId',restrictTo(["admin", "owner"]),SPTController.getSPTById);
SPTRouter.post('/',restrictTo(["admin"]),SPTController.createSPT);
SPTRouter.put('/:planId',restrictTo(["admin"]),SPTController.updateSPTById);
SPTRouter.delete('/:planId',restrictTo(["admin"]),SPTController.deleteSPTById);
export default SPTRouter;