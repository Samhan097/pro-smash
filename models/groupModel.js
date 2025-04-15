import mongoose from 'mongoose';

const groupSchema = new mongoose.Schema({
 group: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group", // Reference to Group if it's a group-related challenge
      default: null, // Means it's an individual challenge unless filled
    },
    groupName: {
      type: String,
      default: "", 
    },
    members: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }],
    messages: [{
      sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      content: String,
      timestamp: { type: Date, default: Date.now },
    }],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    }, 
}, {
  timestamps: true,
});

const Group = mongoose.model('Group', groupSchema);

export default Group;
