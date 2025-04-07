import userModel from '../models/userModel.js';

// Get User Data
export const getUserData = async (req, res) => {

  try {
    const {  userId } = req.body;
    const user = await userModel.findById(userId)

    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }
    return res.json({ success: true, 
      userData:{
        username:user.username,
        isAccountVerified:user.isAccountVerified
      }
     });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

// Update Personal Details
export const updatePersonalDetails = async (req, res) => {
  const { userId } = req.params; // Get user ID from URL parameters
  const { dateOfBirth, gender, address, city, postalCode, country } = req.body;

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


export const searchInterests = async (req, res) => {
  const { query } = req.query;  // Search text comes as a query param

  try {
    const filtered = allInterests.filter(interest =>
      interest.text.toLowerCase().includes(query.toLowerCase())
    );

    res.json({ success: true, data: filtered });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// Update Sport Profile
export const updateSportProfile = async (req, res) => {
  const { userId } = req.params; // Get userId from URL
  const { description, alternateImage, instagram, facebook, twitter, linkedin } = req.body;

  try {
      const user = await userModel.findById(userId);

      if (!user) {
          return res.status(404).json({ success: false, message: "User not found" });
      }

      // Update sport profile details
      user.sportProfile.description = description || user.sportProfile.description;
      user.sportProfile.alternateImage = alternateImage || user.sportProfile.alternateImage;
      user.sportProfile.socialMedia.instagram = instagram || user.sportProfile.socialMedia.instagram;
      user.sportProfile.socialMedia.facebook = facebook || user.sportProfile.socialMedia.facebook;
      user.sportProfile.socialMedia.twitter = twitter || user.sportProfile.socialMedia.twitter;
      user.sportProfile.socialMedia.linkedin = linkedin || user.sportProfile.socialMedia.linkedin;

      await user.save();

      return res.json({ success: true, message: "Sport profile updated successfully", user });
  } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
  }
};

// For uploading base64 image
import fs from 'fs';
import path from 'path';

export const uploadProfileImage = async (req, res) => {
  const { image, userId } = req.body;

  if (!image || !userId) {
    return res.status(400).json({ success: false, message: 'Image and User ID are required' });
  }

  try {
    // Decode base64
    const base64Data = image.replace(/^data:image\/png;base64,/, "");
    const fileName = `profile-${Date.now()}.png`;
    const filePath = path.join('uploads', fileName);

    // Save to uploads folder (or use DigitalOcean SDK here)
    fs.writeFileSync(filePath, base64Data, 'base64');

    // Update user with the image path (optional)
    const user = await userModel.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    user.profileImage = `/uploads/${fileName}`; // or DigitalOcean image URL
    await user.save();

    return res.json({ success: true, message: 'Profile image uploaded', imageUrl: user.profileImage });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};


