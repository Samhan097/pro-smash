import express from "express";
import { getSchedule, getChallengers, getLeaderboard, createSchedule } from "../controllers/dashboardController.js";
import userAuth from "../middleware/userAuth.js"; // Ensure you have this middleware

const dashboardRouter = express.Router();

dashboardRouter.post("/create-schedule", userAuth, createSchedule);
dashboardRouter.get("/schedule", userAuth, getSchedule);
dashboardRouter.get("/challengers/:userId", userAuth, getChallengers);
dashboardRouter.get("/leaderboard", userAuth, getLeaderboard); 

export default dashboardRouter;
