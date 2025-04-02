import express from "express";
// import cookieParser from "cookie-parser";
import dotenv from "dotenv";
// import cors from "cors";
// import connectDB from "./config/db.js";
// import authRouter from "./routes/authRoutes.js";

dotenv.config();
const app = express();
const port = process.env.PORT || 4000;
// connectDB();

// app.use(express.json()); 
// app.use(cookieParser()); 
// app.use(cors({ credentials: true }));

// API EndPoints
app.get("/", (req, res) => {
  res.status(200).json({msg:"API Working"});
});
// app.use('/api/auth',authRouter)

app.listen(port, () => {
  // connectDB()
  console.log(`Server Started on PORT http://localhost:${port}`);
});
// OwHH5YTCzLCa8cQj
