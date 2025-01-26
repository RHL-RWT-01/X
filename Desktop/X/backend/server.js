import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";

dotenv.config();
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import connectDB from "./db/connectDB.js";

const app = express();
const port = process.env.PORT || 8000;

app.use(cors()); 
app.use(express.json());
app.use(express.urlencoded({ extended: false })); //to parse form data
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  connectDB();
});
