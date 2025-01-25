import User from "../models/user.model.js";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";

dotenv.config();
export const protectedRoute = async (res, req, next) => {
  try {
    const token = req.cookies.jwt;
    if (!token) {
      return res.status(401).json({
        message: "Unauthorized access",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded.success) {
      return res.status(401).json({
        message: "Unauthorized access",
      });
    }

    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return res.status(401).json({
        message: "User not found",
      });
    }

    req.user = user;
    next();
  } catch (e) {
    console.log("Error in protectedRoute middleware", e.message);
    res.status(500).json({
      error: "Internal server error",
    });
  }
};
