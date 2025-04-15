import User from "../models/userModel.js";
import Group from '../models/groupModel.js'; 
import Challenge from '../models/challengeModel.js'; 
import Community from "../models/communityModel.js";

// Get Players
export const getExplorePlayers = async (req, res) => {
  const { userId } = req.params; // logged-in user's ID
  const { query } = req.query; // optional search query (name, email, mobile)

  try {
    let players = [];

    if (query) {
      // 1. If search query exists: Search users
      const searchRegex = new RegExp(query, "i");

      players = await User.find({
        $or: [
          { fullname: { $regex: searchRegex } },
          { email: { $regex: searchRegex } },
          { mobileNumber: { $regex: searchRegex } },
        ],
        _id: { $ne: userId }, // exclude yourself
      })
        .select("fullname email mobileNumber city profileImage updatedAt")
        .lean();
    } else {
      // 2. If NO search query: Show users who played with or challenged user
      const challenges = await Challenge.find({
        $or: [
          { challenger: userId },
          { challenged: userId },
        ],
        status: "accepted",
      })
        .populate("challenger", "fullname email mobileNumber city profileImage updatedAt")
        .populate("challenged", "fullname email mobileNumber city profileImage updatedAt")
        .lean();

      const playerMap = new Map();

      challenges.forEach((challenge) => {
        if (challenge.challenger._id.toString() !== userId) {
          playerMap.set(challenge.challenger._id.toString(), challenge.challenger);
        }
        if (challenge.challenged._id.toString() !== userId) {
          playerMap.set(challenge.challenged._id.toString(), challenge.challenged);
        }
      });

      players = Array.from(playerMap.values());
    }

    // Calculate active status
    const now = new Date();
    const playersWithStatus = players.map((player) => {
      const diffMs = now - new Date(player.updatedAt);
      const diffMinutes = Math.floor(diffMs / (1000 * 60));

      let activeStatus = '';
      if (diffMinutes <= 5) {
        activeStatus = 'Active now';
      } else {
        const hours = Math.floor(diffMinutes / 60);
        const minutes = diffMinutes % 60;
        activeStatus = `Active ${hours}hr ${minutes}min ago`;
      }

      return { ...player, activeStatus };
    });

    res.json({ success: true, players: playersWithStatus });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Send Challenge 
export const sendChallenge = async (req, res) => {
  const { challengerId, challengedId, sportName } = req.body;

  try {
    const existingChallenge = await Challenge.findOne({
      challenger: challengerId,
      challenged: challengedId,
      status: 'pending',
    });

    if (existingChallenge) {
      return res.status(400).json({ success: false, message: 'Challenge already sent!' });
    }

    const newChallenge = new Challenge({
      challenger: challengerId,
      challenged: challengedId,
      sportName, // include sportName
      status: 'pending',
    });

    await newChallenge.save();

    res.status(201).json({ success: true, message: 'Challenge sent successfully!' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Challenges
// export const getChallenges = async (req, res) => {
//     const { userId } = req.params; // Current logged-in user ID
  
//     try {
//       const challenges = await Challenge.find({
//         $or: [
//           { challenger: userId }, 
//           { challenged: userId }
//         ]
//       })
//       .populate('challenger', 'fullname profileImage')
//       .populate('challenged', 'fullname profileImage')
//       .lean();
  
//       res.json({ success: true, challenges });
//     } catch (error) {
//       res.status(500).json({ success: false, message: error.message });
//     }
//   };

// Accept Challenge
// export const acceptChallenge = async (req, res) => {
//   try {
//     const { id } = req.params; // Challenge ID from URL

//     const challenge = await Challenge.findById(id);

//     if (!challenge) {
//       return res.status(404).json({ message: "Challenge not found" });
//     }

//     // Update status
//     challenge.status = "accepted";
//     await challenge.save();

//     res.status(200).json({ message: "Challenge accepted successfully", challenge });
//   } catch (error) {
//     console.error("Error accepting challenge:", error);
//     res.status(500).json({ message: "Server Error" });
//   }
// };

// Reject Challenge
// export const rejectChallenge = async (req, res) => {
//   try {
//     const { id } = req.params; // Challenge ID from URL

//     const challenge = await Challenge.findById(id);

//     if (!challenge) {
//       return res.status(404).json({ message: "Challenge not found" });
//     }

//     // Update status
//     challenge.status = "rejected";
//     await challenge.save();

//     res.status(200).json({ message: "Challenge rejected successfully", challenge });
//   } catch (error) {
//     console.error("Error rejecting challenge:", error);
//     res.status(500).json({ message: "Server Error" });
//   }
// };

// Get Sports
export const getExploreSports = async (req, res) => {
  const { userId } = req.params; // Logged in user
  const { query } = req.query;   // Search term for sport name

  try {
    let sports = [];

    if (query) {
      // 1. If search: find sports matching the query
      const searchRegex = new RegExp(query, "i");

      const challenges = await Challenge.find({
        $or: [{ challenger: userId }, { challenged: userId }],
        status: "accepted",
        sportName: { $regex: searchRegex }
      }).lean();

      const sportSet = new Set();
      challenges.forEach((challenge) => {
        if (challenge.sportName) {
          sportSet.add(challenge.sportName);
        }
      });

      sports = Array.from(sportSet);
    } else {
      // 2. If no search: show all sports already played
      const challenges = await Challenge.find({
        $or: [{ challenger: userId }, { challenged: userId }],
        status: "accepted",
      }).lean();

      const sportSet = new Set();
      challenges.forEach((challenge) => {
        if (challenge.sportName) {
          sportSet.add(challenge.sportName);
        }
      });

      sports = Array.from(sportSet);
    }

    res.json({ success: true, sports });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Groups
export const getExploreGroups = async (req, res) => {
  const { userId } = req.params;
  const { query } = req.query;

  try {
    let groups = [];

    if (query) {
      // Search by group name + filter by member
      groups = await Group.find({
        members: userId,
        groupName: { $regex: query, $options: "i" },
      }).lean();
    } else {
      // Fetch all groups where user is a member
      groups = await Group.find({
        members: userId,
      }).lean();
    }

    res.json({ success: true, groups });
  } catch (error) {
    console.error("Error fetching groups:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

//  Explore Communities
export const getExploreCommunities = async (req, res) => {
  const { userId } = req.params;
  const { query } = req.query;

  try {
    let communities = [];

    // Step 1: Find all groups the user is a member of
    const userGroups = await Group.find({ members: userId }).lean();

    // Step 2: Extract unique community IDs from those groups if groups are tied to communities
    const joinedCommunityIds = userGroups.map(group => group.group).filter(Boolean);

    // Step 3: Search or return joined communities
    if (query) {
      communities = await Community.find({
        $or: [
          { communityName: { $regex: query, $options: "i" } }, // <-- fixed this line
          { description: { $regex: query, $options: "i" } },
        ],
      }).lean();
    } else {
      communities = await Community.find({
        _id: { $in: joinedCommunityIds },
      }).lean();
    }

    res.json({ success: true, communities });
  } catch (error) {
    console.error("Error fetching communities:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};



// Get Clubs (communities) with a search option
export const getClubs = async (req, res) => {
  const { searchQuery } = req.query; // search query for filtering clubs
  const { userId } = req.params; // Current logged-in user ID
  
  try {
    let clubs;
    
    // If a search query is provided, search based on communityName
    if (searchQuery) {
      clubs = await Community.find({
        communityName: { $regex: searchQuery, $options: "i" }, // case-insensitive search
      })
        .populate('members', 'fullname profileImage city') // Populating member details
        .lean();
    } else {
      // If no search query, return all clubs/communities
      clubs = await Community.find()
        .populate('members', 'fullname profileImage city') // Populating member details
        .lean();
    }

    res.json({ success: true, clubs });
  } catch (error) {
    console.error("Clubs Fetch Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
