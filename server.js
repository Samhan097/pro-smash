import express from "express";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import authRouter from "./routes/authRoutes.js";
import userRouter from "./routes/userRoutes.js";

dotenv.config();
const app = express();
const port = process.env.PORT || 8080;
connectDB();

app.use(express.json()); 
app.use(cookieParser()); 
app.use(cors({ credentials: true })); 

// API EndPoints
app.get("/", (req, res) => {
  res.send("Server is Live");
});
app.get("/test", (req, res) => {
  res.send("Testing server");
});
app.use('/api/auth',authRouter)
app.use('/api/user',userRouter)
// app.use('/api/matches',matchRouter)
// app.use('/api/messages',messageRouter)

app.listen(port,'0.0.0.0', () => {
  console.log(`Server Started on PORT http://localhost:${port}`);
});
