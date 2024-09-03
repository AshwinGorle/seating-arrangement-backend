import { Router } from "express";
import { upload } from "../middlewares/multerUpload.js";
import restrictTo from '../middlewares/restrictTo.js'
import OwnerController from "../controllers/ownerController.js";
const ownerRouter = Router();
ownerRouter.post('/', restrictTo(['admin']), upload.single('avatar') , OwnerController.createOwner);
ownerRouter.put('/:ownerId', restrictTo(['admin','owner']) ,upload.single('avatar') , OwnerController.updateOwnerById);

export default ownerRouter;