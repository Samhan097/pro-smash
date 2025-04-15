import express from "express";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import authRouter from "./routes/authRoutes.js";
import userRouter from "./routes/userRoutes.js";
import smashRouter from "./routes/smashRoutes.js";
import inboxRouter from "./routes/inboxRoutes.js";
import dashboardRouter from "./routes/dashboardRoutes.js";
import exploreRouter from "./routes/exploreRoutes.js"; 

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
app.use('/api/smash',smashRouter)
app.use('/api/dashboard',dashboardRouter)
app.use('/api/inbox',inboxRouter)
app.use('/api/explore',exploreRouter)

app.listen(port,'0.0.0.0', () => { 
  console.log(`Server Started on PORT http://localhost:${port}`);
});
