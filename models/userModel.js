import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
    },
    fullname: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    dateOfBirth: {
      type: Date,
      required: true,
    },
    mobileNumber: {
      type: Number,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
      default: "Male",
    },
    address: {
      type: String,
      default: "",
    },
    city: {
      type: String,
      default: "",
    },
    postalCode: {
      type: Number,
      default: "",
    },
    country: {
      type: String,
      enum: ["Sri Lanka", "USA", "Canada", "UK", "India", "Germany", "France"],
      default: "Sri Lanka",
    },
    interests: {
      type: [String],
      default: [],
    },
    sportProfile: {
      description: { type: String, default: "" },
      alternateImage: { type: String, default: "" },
      socialMedia: {
        instagram: { type: String, default: "" },
        facebook: { type: String, default: "" },
        twitter: { type: String, default: "" },
        linkedin: { type: String, default: "" },
      },
    },
    verifyOtp: {
      type: String,
      default: "",
    },
    verifyOtpExpireAt: {
      type: Number,
      default: 0,
    },
    isAccountVerified: {
      type: Boolean,
      default: false,
    },
    resetOtp: {
      type: String,
      default: "",
    },
    resetOtpExpireAt: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true, // This will add createdAt and updatedAt timestamps
  }
);

const userModel = mongoose.models.user || mongoose.model("user", userSchema);

export default userModel;
