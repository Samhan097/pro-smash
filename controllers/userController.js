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
    const { userId } = req.params;  // Access userId from the URL params
    const { interests } = req.body; // Access interests array from the body

    // Validate that the interests are passed as an array
    if (!Array.isArray(interests)) {
        return res.json({ success: false, message: "Interests must be an array" });
    }

    try {
        const user = await userModel.findById(userId);
        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }

        // Update the user's interests in the database
        user.interests = interests;
        await user.save();

        return res.json({ success: true, message: "Interests updated successfully", data: user });
    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
};
