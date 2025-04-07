import express from "express";
import userAuth from "../middleware/userAuth.js";
import {
  getUserData,
  updatePersonalDetails,
  updateInterests,
  updateSportProfile,
  uploadProfileImage, // ✅ Import this function too
} from "../controllers/userController.js"; // make sure updateSportProfile is in this controller

const userRouter = express.Router();

// ✅ Route to get user data
userRouter.get('/data', userAuth, getUserData);

// ✅ Route to update personal details 
userRouter.put('/update-personal-details/:userId', userAuth, updatePersonalDetails);

// ✅ Route to update user interests 
userRouter.put('/update-interests/:userId', userAuth, updateInterests);

// ✅ Route to update sport profile (description, alt image, social links)
userRouter.put('/update-sport-profile/:userId', userAuth, updateSportProfile);

userRouter.post('/upload-profile-image',userAuth, uploadProfileImage); 

export default userRouter;
