import mongoose from "mongoose";

const challengeSchema = new mongoose.Schema(
  {
    challenger: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Reference to the user who is challenging
      required: true,
    },
    challenged: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Reference to the user being challenged
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"], // Challenge status can be pending, accepted, or rejected
      default: "pending",
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    sportName: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true, // This will add createdAt and updatedAt fields
  }
);

const Challenge = mongoose.model("Challenge", challengeSchema);

export default Challenge;
