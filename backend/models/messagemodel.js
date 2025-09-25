import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
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
  readBy:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"User"
  }
},{
  timestamps:true
});
const Message = new mongoose.model("Message",messageSchema)
export default Message
