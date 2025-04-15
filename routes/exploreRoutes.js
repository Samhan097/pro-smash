import express from 'express';
import {  getClubs, getExploreCommunities, getExploreGroups, getExplorePlayers, getExploreSports, sendChallenge } from '../controllers/exploreController.js';
import userAuth from '../middleware/userAuth.js';

const exploreRouter = express.Router(); 

// Search players
exploreRouter.get('/players/:userId',userAuth, getExplorePlayers);

// Send challenge
exploreRouter.post('/challenge',userAuth, sendChallenge);

// Get Sports
exploreRouter.get('/sports/:userId',userAuth, getExploreSports);

// Get Groups
exploreRouter.get('/groups/:userId',userAuth, getExploreGroups);

// Get Community
exploreRouter.get('/communities/:userId',userAuth, getExploreCommunities);

// Get Clubs (communities) with a search option
exploreRouter.get('/clubs/:userId',userAuth, getClubs);

export default exploreRouter;
