import express from "express";
import dotenv from "dotenv";

dotenv.config();
import authRoutes from "./routes/auth.routes.js";
import connectDB from "./db/connectDB.js";

const app = express();
const port = process.env.PORT || 8000;

app.use(express.json());
app.use(express.urlencoded({ extended: false })); //to parse form data
app.use("/api/auth", authRoutes);
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  connectDB();
});
