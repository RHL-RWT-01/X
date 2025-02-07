import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();
export const generateTokenAndCookie = (userId, res) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "10d",
  });
  
  res.cookie("jwt", token, {
    expires: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), 
    httpOnly: true, 
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production" ? true : false,
  });
};
