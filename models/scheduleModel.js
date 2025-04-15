import mongoose from "mongoose";

const scheduleSchema = new mongoose.Schema({
  opponent: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    }
  ],
  scheduledDate: {
    type: Date,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["scheduled", "completed", "cancelled"],
    default: "scheduled",
  },
}, {
  timestamps: true,
});

const Schedule = mongoose.model("Schedule", scheduleSchema);

export default Schedule;
