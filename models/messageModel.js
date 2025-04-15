import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ['sent', 'delivered', 'read'],
    default: 'sent',
  },
  isDeleted: {
    type: Boolean,
    default: false, // soft delete feature
  },
  attachment: {
    type: String, // URL if you want to allow file uploads in future
    default: "",
  },
});

const Message = mongoose.model('Message', messageSchema);

export default Message;
