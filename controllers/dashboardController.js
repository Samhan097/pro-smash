import  Schedule from "../models/scheduleModel.js";
import User from "../models/userModel.js";
import Challenge from "../models/challengeModel.js";
import mongoose from 'mongoose';

// Create a New Scheduled Game
export const createSchedule = async (req, res) => {
    const { challengerId, challengedId, scheduledDate, location } = req.body;
  
    try {
      const newSchedule = new Schedule({
        opponent: [challengerId, challengedId],
        scheduledDate,
        location,
      });
  
      await newSchedule.save();
  
      res.status(201).json({ success: true, message: "Game scheduled successfully!" });
    } catch (error) {
      console.error("Game Schedule Error:", error);
      res.status(500).json({ success: false, message: "Server Error" });
    }
  }; 

// controllers/scheduleController.js
export const getSchedule = async (req, res) => {
  try {
    const schedules = await Schedule.find()
      .populate({
        path: "opponent",
        select: "username fullname sportProfile alternateImage",
      })
      .sort({ scheduledDate: 1 });

    res.status(200).json({ success: true, data: schedules });
  } catch (error) {
    console.error("Schedule Fetch Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
  
// Get Accepted Challenges (for Dashboard)
export const getChallengers = async (req, res) => {
  const { userId } = req.params; // Logged-in user ID

  try {
    const objectId = new mongoose.Types.ObjectId(userId); // cast userId to ObjectId

    const challenges = await Challenge.find({
      $or: [
        { challenger: objectId },
        { challenged: objectId }
      ],
      status: "accepted"
    })
      .populate('challenger', 'fullname alternateImage')
      .populate('challenged', 'fullname alternateImage')
      .sort({ updatedAt: -1 })
      .lean();

    const challengers = challenges.map(challenge => ({
      _id: challenge._id,
      challenger: {
        fullname: challenge.challenger?.fullname || "Unknown",
        image: challenge.challenger?.alternateImage || "https://via.placeholder.com/100",
      },
      challenged: {
        fullname: challenge.challenged?.fullname || "Unknown",
        image: challenge.challenged?.alternateImage || "https://via.placeholder.com/100",
      },
      updatedAt: challenge.updatedAt,
    }));

    res.status(200).json({ success: true, challengers });
  } catch (error) {
    console.error("Error fetching challengers:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
  
// Get Leaderboard
export const getLeaderboard = async (req, res) => {
  try {
    const topUsers = await User.find()
      .sort({ matchesWon: -1 })
      .limit(10)
      .select("fullname alternateImage matchesWon")
      .lean();

    const leaderboard = topUsers.map((user, index) => ({
      rank: index + 1,
      fullname: user.fullname,
      image: user.alternateImage || "https://via.placeholder.com/100",
      matchesWon: user.matchesWon,
    }));

    res.status(200).json({ leaderboard });
  } catch (error) {
    console.error("Leaderboard Fetch Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};
  
// Get Intersted Sports
  export const getInterestedSports = async (req, res) => {
    try {
      const { id: userId } = req.user; // Get the user ID from the authenticated user
      
      const user = await User.findById(userId).select('interests');
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      res.status(200).json({
        interestedSports: user.interests,
      });
    } catch (error) {
      console.error('Error fetching interested sports:', error);
      res.status(500).json({ message: 'Server Error' });
    }
  };
  
// Get User Groups
  export const getUserGroups = async (req, res) => {
    try {
      const { id: userId } = req.user; // Get the user ID from the authenticated user
      
      const groups = await Group.find({ members: userId }).populate('members', 'fullname alternateImage');
      
      res.status(200).json({
        groups,
      });
    } catch (error) {
      console.error('Error fetching groups:', error);
      res.status(500).json({ message: 'Server Error' });
    }
  };
  
//   Get User Community
export const getUserCommunities = async (req, res) => {
    try {
      const { id: userId } = req.user; // Get the user ID from the authenticated user
      
      const communities = await Community.find({ members: userId }).populate('members', 'fullname alternateImage');
      
      res.status(200).json({
        communities,
      });
    } catch (error) {
      console.error('Error fetching communities:', error);
      res.status(500).json({ message: 'Server Error' });
    }
  };

//   Get User Clubs
export const getUserClubs = async (req, res) => {
    try {
      const { id: userId } = req.user; // Get the user ID from the authenticated user
      
      const clubs = await Club.find({ members: userId }).populate('members', 'fullname alternateImage');
      
      res.status(200).json({
        clubs,
      });
    } catch (error) {
      console.error('Error fetching clubs:', error);
      res.status(500).json({ message: 'Server Error' });
    }
  };
  