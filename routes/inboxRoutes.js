import express from "express";
import {
  createClub,
  createCommunity,
  createGroup,
  getClubMessages,
  getCommunityMessages,
  getGroupMessages,
//   getNewMessages,
  getPrivateConversation,
  sendClubMessage,
  sendCommunityMessage,
  sendGroupMessage,
  sendPrivateMessage,
} from "../controllers/inboxController.js";
import userAuth from "../middleware/userAuth.js"; // if you want protected routes

const inboxRouter = express.Router();

// Send a new message
inboxRouter.post("/send-private-message", userAuth, sendPrivateMessage);

// Get conversation between two users
inboxRouter.get(
  "/conversation/:userId1/:userId2",
  userAuth,
  getPrivateConversation
);

// Create a new group
inboxRouter.post("/create-group", userAuth, createGroup);

// Send a new message to the Group
inboxRouter.post("/send-group-message", userAuth, sendGroupMessage);

// Get Group messages
inboxRouter.get("/group/:groupId", userAuth, getGroupMessages);

// create a new community
inboxRouter.post("/create-community", userAuth, createCommunity);

// Send a new message to community
inboxRouter.post("/send-community-message", userAuth, sendCommunityMessage);

// Get conversation in Community
inboxRouter.get("/community/:communityId", userAuth, getCommunityMessages);

// create a new club
inboxRouter.post("/create-club", userAuth, createClub);

// Send a new message to club
inboxRouter.post("/send-club-message", userAuth, sendClubMessage);

// Get conversation in Clubs
inboxRouter.get("/club/:clubId", userAuth, getClubMessages);

// Get New conversation
// inboxRouter.get('/:userId', userAuth, getNewMessages);

export default inboxRouter;
