import express from "express";
import { protectRoute } from "../middleware/protectroute.js";
import { followunfollowuser, getsuggestedusers, getuserprofile, updateuser } from "../controllers/user.controller.js";
const router = express.Router();
router.get("/profile/:username",protectRoute,getuserprofile)
router.get("/suggested",protectRoute,getsuggestedusers)
router.post("/follow/:id",protectRoute,followunfollowuser)
router.post("/update",protectRoute,updateuser)
export default router;