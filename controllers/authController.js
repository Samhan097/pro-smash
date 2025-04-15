import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import userModel from "../models/userModel.js";
import transporter from "../config/nodemailer.js"; 

export const register = async (req, res) => {
  const { username, fullname, email, dateOfBirth, mobileNumber, password } =
    req.body;

  // Validate required fields
  if (
    !username ||
    !fullname ||
    !email ||
    !dateOfBirth ||
    !mobileNumber ||
    !password
  ) {
    return res
      .status(400)
      .json({ success: false, message: "All fields are required" });
  }

  try {
    // Check if user already exists
    const existingUser = await userModel.findOne({ email });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: `Email ${email} is already registered`,
      });
    }
    console.log('🚀 bcrypt:', bcrypt);
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create new user (password hashing is handled in the userModel pre-save middleware)
    const newUser = new userModel({
      username,
      fullname,
      email,
      dateOfBirth,
      mobileNumber,
      password:hashedPassword, // Pass raw password; it will be hashed in the pre-save middleware
    }); 

    await newUser.save();

    // Generate JWT token
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not defined in environment variables");
    }
    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    }); 

    // Set cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Send welcome email
    if (!process.env.SENDER_EMAIL) {
      console.warn("SENDER_EMAIL is not defined in environment variables");
    } else {
      const mailOptions = {
        from: process.env.SENDER_EMAIL,
        to: email,
        subject: "Welcome to LeadsGen",
        text: `Welcome to LeadsGen! Your account was created successfully.\n\nYour registered email: ${email}`,
      };

      try {
        await transporter.sendMail(mailOptions);
        console.log(`✅ Welcome email sent to: ${email}`);
      } catch (mailError) {
        console.error(`❌ Failed to send welcome email: ${mailError.message}`);
        // Don't fail registration just because email failed
      }
    }

    return res
      .status(201)
      .json({ success: true, message: "User registered successfully" });
  } catch (error) {
    console.error("Registration error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return res.status(200).json({ success: true, message: "Logged In Successfully", user });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};


export const logout = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    });
    return res.status(200).json({ success: true, message: "Logged Out" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const sendVerifyOtp = async (req, res) => {
  try {
    const { userId } = req.body;

    const user = await userModel.findById(userId);

    if (user.isAccountVerified) {
      return res
        .status(400)
        .json({ success: false, message: "Account Alreadey Verified" });
    }

    // ✅ Generate a 6-digit OTP using Math.floor()
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.verifyOtp = otp;
    user.verifyOtpExpireAt = Date.now() + 24 * 60 * 60 * 1000;
    await user.save();

    // ✅ Email content
    const mailOption = {
      from: process.env.SENDER_EMAIL,
      to: user.email, // Using user as the email address
      subject: "Account Verification OTP",
      text: `Your OTP for verification is: ${otp}. Verify Your Account Using this OTP.`,
    };

    // ✅ Send OTP email
    await transporter.sendMail(mailOption);
    console.log("✅ OTP sent successfully to:", user.email);

    return res
      .status(200)
      .json({ success: true, message: "OTP sent successfully" });
  } catch (error) {
    console.error("❌ OTP sending failed:", error.message);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

export const verifyEmail = async (req, res) => {
  const { userId, otp } = req.body; // Expecting the userId and OTP to be provided

  if (!userId || !otp) {
    return res
      .status(400)
      .json({ success: false, message: "User ID and OTP are required" });
  }

  try {
    // Check if the OTP exists in memory for the provided userId
    const user = await userModel.findById(userId);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "OTP not found for this userId" });
    }

    if (user.verifyOtp === "" || user.verifyOtp !== otp) {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    // Check if OTP is expired
    if (Date.now() > user.verifyOtpExpireAt) {
      return res
        .status(400)
        .json({ success: false, message: "OTP has expired" });
    }

    user.isAccountVerified = true;
    user.verifyOtp = "";
    user.verifyOtpExpireAt = 0;

    await user.save();
    return res
      .status(200)
      .json({ success: true, message: "Email successfully verified!" });
  } catch (error) {
    console.error("❌ Error verifying OTP:", error.message);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

// Check user authentication
export const isAuthenticated = async (req, res) => {
  try {
    return res
      .status(200)
      .json({ success: true, message: "User is Authencicated!" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// send Password Reset OTP
export const sendResetOtp = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res
      .status(400)
      .json({ success: false, message: "Email is Required" });
  }
  try {
    const user = await userModel.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User Not Found!!" });
    }

    // ✅ Generate a 6-digit OTP using Math.floor()
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetOtp = otp;
    user.resetOtpExpireAt = Date.now() + 15 * 60 * 1000;
    await user.save();

    // ✅ Email content
    const mailOption = {
      from: process.env.SENDER_EMAIL,
      to: user.email, // Using user as the email address
      subject: "Password Reset OTP",
      text: `Your OTP for resetting your password is: ${otp}. Use this OTP to reset your password.`,
    };
    await transporter.sendMail(mailOption);
    return res
      .status(200)
      .json({ success: true, message: "OTP sent to your email" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Reset User Password
export const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  // Validate request body
  if (!email || !otp || !newPassword) {
    return res
      .status(400)
      .json({ success: false, message: "All fields are required" });
  }

  try {
    const user = await userModel.findOne({ email });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Check if OTP matches and is not expired
    if (
      user.resetOtp === "" ||
      user.resetOtp !== otp ||
      Date.now() > user.resetOtpExpireAt
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid or expired OTP" });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user password and clear OTP fields
    user.password = hashedPassword;
    user.resetOtp = "";
    user.resetOtpExpireAt = 0;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password has been reset successfully",
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
