import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      require: true,
    },
    chat: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chat",
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      // ID comes from user collection
      ref: "User",
    },
    readBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    mediaUrl: { type: String }, // To store the URL of the photo or video
    mediaType: { type: String }, // To store the type (e.g., 'image' or 'video')
  },
  {
    timestamps: true,
  }
);
const Message = new mongoose.model("Message", messageSchema);
export default Message;
