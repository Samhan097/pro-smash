import User from "../models/userModel.js";

// Swipe Right ➔ Like
export const swipeRight = async (req, res) => {
  const { userId } = req.body; // The user who is swiping
  const { likedUserId } = req.params; // The user being swiped on

  try {
    const user = await User.findById(userId);
    const likedUser = await User.findById(likedUserId);

    if (!user || !likedUser) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    if (!user || !likedUser) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
  
      if (!user.likes.includes(likedUserId)) {
        user.likes.push(likedUserId);
  
        // Remove from dislikes if it exists
        user.dislikes = user.dislikes.filter(
          (id) => id.toString() !== likedUserId
        );
  
        // Now check if likedUser already liked current user
        if (likedUser.likes.includes(userId)) {
          // It's a match!
          user.matches.push(likedUserId);
          likedUser.matches.push(userId);
  
          await likedUser.save(); // save likedUser after adding match
        }
  
        await user.save();
    }

    res.json({ success: true, message: "User liked (swiped right)" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Swipe Left ➔ Dislike
export const swipeLeft = async (req, res) => {
  const { userId } = req.body; // The user who is swiping
  const { dislikedUserId } = req.params; // The user being swiped on

  try {
    const user = await User.findById(userId);
    const dislikedUser = await User.findById(dislikedUserId);

    if (!user || !dislikedUser) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    if (!user.dislikes.includes(dislikedUserId)) {
      user.dislikes.push(dislikedUserId);

      // Remove from likes if it exists
      user.likes = user.likes.filter((id) => id.toString() !== dislikedUserId);

      await user.save();
    }

    res.json({ success: true, message: "User disliked (swiped left)" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Matches
export const getMatches = async (req, res) => {
  const { userId } = req.params; // current logged-in user ID

  try {
    const user = await User.findById(userId).populate(
      "likes",
      "name email profileImage"
    );

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.json({ success: true, matches: user.likes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// Get Users
export const getUserProfile = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.id);

    const users = await User.find({
      $and: [
        { _id: { $ne: currentUser.id } },
        { _id: { $nin: currentUser.likes } },
        { _id: { $nin: currentUser.dislikes } },
        { _id: { $nin: currentUser.matches } },
        {
          gender:
            currentUser.genderPreference === "both"
              ? { $in: ["male", "female"] }
              : currentUser.genderPreference,
        },
        { genderPreference: { $in: [currentUser.gender, "both"] } },
      ],
    });

    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
