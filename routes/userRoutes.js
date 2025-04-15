import express from "express";
import userAuth from "../middleware/userAuth.js";
import {
  getUserData,
  updatePersonalDetails,
  updateInterests,
  updateSportProfile,
  // uploadProfileImage,
  searchInterests,
  submitForReview, // ✅ Import this function too
} from "../controllers/userController.js"; // make sure updateSportProfile is in this controller

const userRouter = express.Router();

// ✅ Route to get user data
userRouter.get('/data',userAuth, getUserData);

// ✅ Route to update personal details 
userRouter.put('/update-personal-details/:userId', userAuth, updatePersonalDetails);

// Route for searching interests
userRouter.get('/search-interests',userAuth, searchInterests);

// ✅ Route to update user interests 
userRouter.put('/update-interests/:userId', userAuth, updateInterests);

// ✅ Route to update sport profile (description, alt image, social links)
userRouter.put('/update-sport-profile/:userId', userAuth, updateSportProfile);

// userRouter.put('/upload-profile-image',userAuth, uploadProfileImage);  

// This is the route where you will submit the profile image for review
userRouter.put('/submit-for-review/:userId',userAuth, submitForReview);  


export default userRouter;
