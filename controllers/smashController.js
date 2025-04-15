import Challenge from '../models/challengeModel.js'; 
import User from '../models/userModel.js';
import mongoose from 'mongoose';

// Get Users
export const getUserProfile = async (req, res) => {
  try {
    const currentUserId = new mongoose.Types.ObjectId(req.user.id); // Correct format for MongoDB

    const randomUsers = await User.aggregate([
      {
        $match: { _id: { $ne: currentUserId } } // Exclude current user
      },
      {
        $sample: { size: 5 } // Randomly select 5 users
      },
      {
        $project: { // Choose what fields you want to send to frontend
          username: 1,
          fullname: 1,
          sportProfile: 1,
          interests: 1,
          country: 1,
          gender: 1,
          // Never send password, email, mobileNumber unless needed
        }
      }
    ]);

    res.json({ success: true, users: randomUsers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
 
// Swipe Right ➔ Challenged
export const swipeRight = async (req, res) => {
  const { userId, sportName } = req.body; // <-- Now expect sportName too
  const { challengeUserId } = req.params; // The user being swiped on

  try {
    const user = await User.findById(userId);
    const challengeUser = await User.findById(challengeUserId);

    if (!user || !challengeUser) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Create a new challenge with sportName
    const newChallenge = new Challenge({
      challenger: userId,
      challenged: challengeUserId,
      sportName: sportName, // <-- Add the sport name
    });

    await newChallenge.save();
    
    res.json({ success: true, message: "Challenge created!" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get All(Accepted,Rejected,Pending) Challenges
export const getChallenges = async (req, res) => {
    const { userId } = req.params; // Current logged-in user ID
  
    try {
      const challenges = await Challenge.find({
        $or: [
          { challenger: userId }, 
          { challenged: userId }
        ]
      })
      .populate('challenger', 'fullname profileImage')
      .populate('challenged', 'fullname profileImage')
      .lean();
  
      res.json({ success: true, challenges });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  };

// Accept Challenge
export const acceptChallenge = async (req, res) => {
  try {
    const { id } = req.params; // Challenge ID from URL

    const challenge = await Challenge.findById(id);

    if (!challenge) {
      return res.status(404).json({ message: "Challenge not found" });
    }

    // Update status
    challenge.status = "accepted";
    await challenge.save();

    res.status(200).json({ message: "Challenge accepted successfully", challenge });
  } catch (error) {
    console.error("Error accepting challenge:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Reject Challenge
export const rejectChallenge = async (req, res) => {
  try {
    const { id } = req.params; // Challenge ID from URL

    const challenge = await Challenge.findById(id);

    if (!challenge) {
      return res.status(404).json({ message: "Challenge not found" });
    }

    // Update status
    challenge.status = "rejected";
    await challenge.save();

    res.status(200).json({ message: "Challenge rejected successfully", challenge });
  } catch (error) {
    console.error("Error rejecting challenge:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Swipe Left ➔ Pass (no database action)
export const swipeLeft = async (req, res) => {
  const { skippedUserId } = req.params; // The user who was skipped
  const { userId } = req.body; // The current logged-in user (optional)

  try {
    console.log(`User ${userId} skipped user ${skippedUserId}`);

    // You can later save this info if you want (optional)

    res.json({ success: true, message: "User skipped (swiped left)" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
 

