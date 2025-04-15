import express from "express";
import {
  swipeRight,
  swipeLeft,
  getUserProfile,
  getChallenges, 
  acceptChallenge,
  rejectChallenge,
} from "../controllers/smashController.js";
import userAuth from "../middleware/userAuth.js";

const smashRouter = express.Router();

smashRouter.get("/user-profiles", userAuth, getUserProfile);
smashRouter.post("/swipe-right/:challengeUserId", userAuth, swipeRight);
smashRouter.post("/swipe-left/:skippedUserId", userAuth, swipeLeft);
smashRouter.post("/:id/accept", userAuth, acceptChallenge);
smashRouter.post("/:id/reject", userAuth, rejectChallenge);
smashRouter.get('/challenges/:userId',userAuth, getChallenges);

export default smashRouter;
 