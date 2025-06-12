import express from "express";
import { protectRoute } from "../middleware/protectroute.js";
import { commentpost, createpost, deletepost, getallpost, getfollowingposts, getlikedposts, getuserposts, likepost } from "../controllers/post.controller.js";
const router = express.Router();
router.get("/all",protectRoute,getallpost)
router.get("/likes/:id",protectRoute,getlikedposts)
router.get("/following",protectRoute,getfollowingposts)
router.get("/user/:username",protectRoute,getuserposts)
router.post("/create",protectRoute,createpost)
router.post("/like/:id",protectRoute,likepost)
router.post("/comment/:id",protectRoute,commentpost)
router.delete("/:id",protectRoute,deletepost)
export default router;