import express from "express";
import userAuth from "../middleware/userAuth.js";
import { getUserData, updatePersonalDetails, updateInterests } from "../controllers/userController.js";  // Ensure updateInterests is imported

const userRouter = express.Router();

// Route to get user data
userRouter.get('/data', userAuth, getUserData);

// Route to update personal details 
userRouter.put('/update-personal-details/:userId', userAuth, updatePersonalDetails);

// Route to update user interests 
userRouter.put('/update-interests/:userId', userAuth, updateInterests);  
export default userRouter;
