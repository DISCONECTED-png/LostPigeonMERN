import express from "express";
import { protectRoute } from "../middleware/protectroute.js";
import { deletenotification, deleteonenotification, getnotification } from "../controllers/notification.controllers.js";
const router = express.Router();
router.get("/",protectRoute,getnotification)
router.delete("/",protectRoute,deletenotification)
router.delete("/:id",protectRoute,deleteonenotification)
export default router;