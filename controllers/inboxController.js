import Community from "../models/communityModel.js";
import Message from '../models/messageModel.js';
import Group from '../models/groupModel.js'; 
import Club from "../models/clubModel.js"; 

// Send Private Message
export const sendPrivateMessage = async (req, res) => {
    const { senderId, receiverId, content } = req.body;
  
    if (!senderId || !receiverId || !content) {
      return res.status(400).json({ success: false, message: "Sender, receiver, and content are required." });
    }
  
    try {
      const message = new Message({ sender: senderId, receiver: receiverId, content });
      await message.save();
  
      return res.json({ success: true, message: "Private message sent", data: message });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  };
  
  // Get Private Conversation
  export const getPrivateConversation = async (req, res) => {
    const { userId1, userId2 } = req.params;
  
    try {
      const conversation = await Message.find({
        $or: [
          { sender: userId1, receiver: userId2 },
          { sender: userId2, receiver: userId1 }
        ]
      }).sort({ timestamp: 1 });
  
      return res.json({ success: true, data: conversation });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  };
  
  // Create a new group
  export const createGroup = async (req, res) => {
    const { groupName, members, createdBy } = req.body;
  
    if (!groupName || !members || !Array.isArray(members) || members.length === 0 || !createdBy) {
      return res.status(400).json({ success: false, message: "Group name, members, and createdBy are required." });
    }
  
    try {
      const newGroup = new Group({
        groupName,
        members,
        createdBy,
        messages: [] // optional, can be skipped since default is []
      });
  
      await newGroup.save();
  
      return res.status(201).json({
        success: true,
        message: "Group created successfully",
        data: newGroup,
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  };
  
  // Send Group Message
  export const sendGroupMessage = async (req, res) => {
    const { groupId, senderId, content } = req.body;
  
    if (!groupId || !senderId || !content) {
      return res.status(400).json({ success: false, message: "Group, sender, and content are required." });
    }
  
    try {
      const group = await Group.findById(groupId);
  
      if (!group) {
        return res.status(404).json({ success: false, message: "Group not found" });
      }
  
      group.messages.push({ sender: senderId, content });
      await group.save();
  
      return res.json({ success: true, message: "Group message sent", data: group });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  };
  
  // Get Group Messages
  export const getGroupMessages = async (req, res) => {
    const { groupId } = req.params;
  
    try {
      const group = await Group.findById(groupId)
        .populate("messages.sender", "name profileImg") // populate sender basic info
        .populate("members", "name");
  
      if (!group) {
        return res.status(404).json({ success: false, message: "Group not found" });
      }
  
      return res.json({ success: true, data: group.messages });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  };

// Create Community
  export const createCommunity = async (req, res) => {
    const { communityName, description, communityImage, members, createdBy } = req.body;
  
    if (!communityName || !createdBy) {
      return res.status(400).json({
        success: false,
        message: "Community name and createdBy are required.",
      });
    }
  
    try {
      // Check if communityName already exists
      const existingCommunity = await Community.findOne({ communityName });
      if (existingCommunity) {
        return res.status(409).json({
          success: false,
          message: "Community name already exists. Please choose another name.",
        });
      }
  
      const newCommunity = new Community({
        communityName,
        description: description || "",
        communityImage: communityImage || "",
        members: members && members.length > 0 ? members : [createdBy],
        createdBy,
        messages: [],
      });
  
      await newCommunity.save();
  
      return res.status(201).json({
        success: true,
        message: "Community created successfully",
        data: newCommunity,
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  };
  
// Send Community Message
export const sendCommunityMessage = async (req, res) => {
  const { communityId, senderId, content } = req.body;

  if (!communityId || !senderId || !content) {
    return res.status(400).json({ success: false, message: "Community, sender, and content are required." });
  }

  try {
    const community = await Community.findById(communityId);

    if (!community) {
      return res.status(404).json({ success: false, message: "Community not found" });
    }

    community.messages.push({ sender: senderId, content });
    await community.save();

    return res.json({ success: true, message: "Community message sent", data: community });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Get Community Messages
export const getCommunityMessages = async (req, res) => {
  const { communityId } = req.params;

  try {
    const community = await Community.findById(communityId)
      .populate("messages.sender", "name profileImg");

    if (!community) {
      return res.status(404).json({ success: false, message: "Community not found" });
    }

    return res.json({ success: true, data: community.messages });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Create Club
export const createClub = async (req, res) => {
  const { clubName, members, createdBy } = req.body;

  if (!clubName) {
    return res.status(400).json({ success: false, message: "Club name required." });
  }

  try {
    const existingClub = await Club.findOne({ clubName });
    if (existingClub) {
      return res.status(400).json({ success: false, message: "Club with this name already exists." });
    }

    const newClub = new Club({
      clubName,
      members: members && members.length > 0 ? members : [createdBy],
      createdBy,
    });

    await newClub.save();

    return res.status(201).json({
      success: true,
      message: "Club created successfully",
      data: newClub,
    });

  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Send Club Message
export const sendClubMessage = async (req, res) => {
  const { clubId, senderId, content } = req.body;

  if (!clubId || !senderId || !content) {
    return res.status(400).json({ success: false, message: "Club, sender, and content are required." });
  }

  try {
    const club = await Club.findById(clubId);

    if (!club) {
      return res.status(404).json({ success: false, message: "Club not found" });
    }

    club.messages.push({ sender: senderId, content });
    await club.save();

    return res.json({ success: true, message: "Club message sent", data: club });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Get Club Messages
export const getClubMessages = async (req, res) => {
  const { clubId } = req.params;

  try {
    const club = await Club.findById(clubId)
      .populate("messages.sender", "name profileImg");

    if (!club) {
      return res.status(404).json({ success: false, message: "Club not found" });
    }

    return res.json({ success: true, data: club.messages });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getNewMessages = async (req, res) => {
  const { userId } = req.params;

  try {
    // 1. Private messages (received by user)
    const privateMessages = await Message.find({ receiver: userId })
      .sort({ timestamp: -1 })
      .limit(10)
      .lean();

    // 2. Group messages (where user is a member)
    const groups = await Group.find({ members: userId }).lean();
    let groupMessages = [];
    for (const group of groups) {
      if (group.messages && group.messages.length > 0) {
        group.messages.forEach(msg => {
          groupMessages.push({
            ...msg,
            groupId: group._id,
            groupName: group.name,
          });
        });
      }
    }

    // 3. Community messages (similar logic)
    const communities = await Community.find({ members: userId }).lean();
    let communityMessages = [];
    for (const community of communities) {
      if (community.messages && community.messages.length > 0) {
        communityMessages.push(...community.messages.map(msg => ({
          ...msg,
          communityId: community._id,
          communityName: community.name,
        })));
      }
    }

    // 4. Club messages (similar logic)
    const clubs = await Club.find({ members: userId }).lean();
    let clubMessages = [];
    for (const club of clubs) {
      if (club.messages && club.messages.length > 0) {
        clubMessages.push(...club.messages.map(msg => ({
          ...msg,
          clubId: club._id,
          clubName: club.name,
        })));
      }
    }

    // 5. Combine all messages
    const allMessages = [
      ...privateMessages.map(m => ({ ...m, type: "private" })),
      ...groupMessages.map(m => ({ ...m, type: "group" })),
      ...communityMessages.map(m => ({ ...m, type: "community" })),
      ...clubMessages.map(m => ({ ...m, type: "club" })),
    ];

    // 6. Sort all messages latest first
    allMessages.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    return res.json({ success: true, data: allMessages });
  } catch (error) {
    console.error("Get New Messages Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
