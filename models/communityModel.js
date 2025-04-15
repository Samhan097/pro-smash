import mongoose from "mongoose";

const communitySchema = new mongoose.Schema(
  {
    communityName: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
      type: String,
      default: "",
    },
    communityImage: {
      type: String,
      default: "",
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    messages: [
      {
        sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        content: String,
        timestamp: { type: Date, default: Date.now },
      },
    ],
    
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
  }
);

const Community = mongoose.model("Community", communitySchema);

export default Community;
