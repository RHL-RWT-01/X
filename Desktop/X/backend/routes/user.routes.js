import express from "express";
import { protectedRoute } from "../middlewares/protectedRoute.js";
import { followUnfollow, getUserProfile } from "../controllers/user.controller.js";

const router = express.Router();

router.get('/profile/:username',protectedRoute,getUserProfile);

// router.get('/suggested',protectedRoute,getUserProfile);

router.post('/follow/:id',protectedRoute,followUnfollow);

// router.post('/update',protectedRoute,updateUserProfile);

export default router;