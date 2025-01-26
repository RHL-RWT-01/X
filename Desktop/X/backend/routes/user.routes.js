import express from "express";
import { protectedRoute } from "../middlewares/protectedRoute.js";
import { followUnfollow, getSuggestions, getUserProfile, updateUserProfile } from "../controllers/user.controller.js";

const router = express.Router();

router.get('/profile/:username',protectedRoute,getUserProfile);

router.get('/suggested',protectedRoute,getSuggestions);

router.post('/follow/:id',protectedRoute,followUnfollow);

router.post('/update',protectedRoute,updateProfile);

export default router;