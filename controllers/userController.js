import userModel from '../models/userModel.js';

// Get User Data
export const getUserData = async (req, res) => {
  try {
    const { userId } = req.user; // Get userId from req.user

    if (!userId) {
      return res.status(400).json({ success: false, message: "UserId is missing in token" });
    }

    const user = await userModel.findById(userId);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    return res.json({
      success: true,
      userData: {
        username: user.username,
        isAccountVerified: user.isAccountVerified
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Update Personal Details
export const updatePersonalDetails = async (req, res) => {
  const { userId } = req.params; // Get user ID from URL parameters
  const { dateOfBirth, gender, address, city, postalCode, country } = req.body;

  // Check for mandatory fields
  if (!city || !address || !gender || !dateOfBirth || !postalCode || !country) {
    return res.json({
      success: false,
      message: "All fields are required",
    });
  }

  try {
    // Find user by ID
    const user = await userModel.findById(userId);
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    } 

    // Update user details
    if (dateOfBirth) user.dateOfBirth = dateOfBirth;
    if (gender) user.gender = gender;
    if (address) user.address = address;
    if (city) user.city = city;
    if (postalCode) user.postalCode = postalCode;
    if (country) user.country = country;

    // Save updated user data
    await user.save();

    return res.json({
      success: true,
      message: "Personal details updated successfully",
      user,
    });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

// Search Interests
export const searchInterests = async (req, res) => {
  const { query } = req.query;

  try {
    // Fetch all users
    const users = await userModel.find();

    // Flatten all interests from all users
    const allInterests = users.flatMap(user => user.interests || []);

    // Filter based on the search query
    const filtered = allInterests.filter(interest =>
      interest.text?.toLowerCase().includes(query.toLowerCase())
    );

    res.json({ success: true, data: filtered });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update User Intersets
export const updateInterests = async (req, res) => {
  const { userId } = req.params;  // Access userId from URL
  const { interests } = req.body; // Interests should now be an array of objects { text, image }

  // Validate: interests should be an array of objects
  if (!Array.isArray(interests) || !interests.every(item => typeof item.text === 'string' && typeof item.image === 'string')) {
    return res.status(400).json({ success: false, message: "Interests must be an array of objects with 'text' and 'image'" });
  }

  try {
    const user = await userModel.findById(userId);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Update interests (each interest having { text, image })
    user.interests = interests;
    await user.save();

    return res.json({ success: true, message: "Interests updated successfully", data: user.interests });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};


// Update Sport Profile
import cloudinary from '../config/cloudinary.js';

export const updateSportProfile = async (req, res) => {
  const { userId } = req.params;
  const { description, alternateImage, instagram, facebook, twitter, linkedin } = req.body;

  
  if (!description || !alternateImage) {
    return res.status(400).json({ success: false, message: "description, alternateImage fields are required" });
  }

  try {
    const user = await userModel.findById(userId);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // ✅ Upload alternateImage to Cloudinary
    const uploadedResponse = await cloudinary.uploader.upload(alternateImage, {
      folder: "sport_profile_alternate_images",
    });

    // ✅ Update sport profile details
    user.sportProfile.description = description;
    user.sportProfile.alternateImage = uploadedResponse.secure_url;
    user.sportProfile.socialMedia.instagram = instagram;
    user.sportProfile.socialMedia.facebook = facebook;
    user.sportProfile.socialMedia.twitter = twitter;
    user.sportProfile.socialMedia.linkedin = linkedin;

    await user.save();

    return res.json({ success: true, message: "Sport profile updated successfully", user });
  } catch (error) {
    console.error(error);  // 🛑 Print full error in your console
    return res.status(500).json({ success: false, message: error.message });
  }
  
};


// export const uploadProfileImage = async (req, res) => {
//   const { image, userId } = req.body;

//   if (!image || !userId) {
//     return res.status(400).json({ success: false, message: 'Image and User ID are required' });
//   }

//   try {
//     const user = await userModel.findById(userId);
//     if (!user) {
//       return res.status(404).json({ success: false, message: 'User not found' });
//     }

//     // Upload to Cloudinary
//     const uploadedResponse = await cloudinary.uploader.upload(image, {
//       folder: "profile_images",   // creates a folder inside cloudinary
//       public_id: `profile-${Date.now()}`,
//     });

//     // Update user's profileImage with Cloudinary URL
//     user.profileImage = uploadedResponse.secure_url;
//     await user.save();

//     return res.json({ success: true, message: 'Profile image uploaded to Cloudinary', imageUrl: user.profileImage });
//   } catch (error) {
//     return res.status(500).json({ success: false, message: error.message });
//   }
// };

// submit for review


export const submitForReview = async (req, res) => {
  const { userId } = req.params;
  const { dateOfBirth, gender, address, city, postalCode, country, profileImage,description, alternateImage, interests } = req.body;

  try {
    const user = await userModel.findById(userId);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Check if any field is missing
    if (!dateOfBirth || !gender || !address || !city || !postalCode || !country || !profileImage || !description || !alternateImage || !interests) {
      return res.status(400).json({ 
        success: false, 
        message: "All fields including profile image are required to submit for review." 
      });
    }

    // Update all fields
    user.dateOfBirth = dateOfBirth;
    user.gender = gender;
    user.address = address;
    user.city = city;
    user.postalCode = postalCode;
    user.country = country;
    user.profileImage = profileImage; 
    user.interests = interests; 
    user.description = description; 
    user.alternateImage = alternateImage; 

    // Mark profile as submitted for review
    user.isSubmittedForReview = true;

    await user.save();

    return res.json({ 
      success: true, 
      message: "Profile submitted for review successfully.",
      user 
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};



