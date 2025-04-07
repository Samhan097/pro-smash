import express from "express"
import userAuth from "../middleware/userAuth.js"

const router = express.Router()

router.post("/swipe-right/:likedUserId",userAuth,swipeRight)