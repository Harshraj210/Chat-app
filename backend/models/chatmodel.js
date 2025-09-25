import mongoose from "mongoose";
const chatSchema = new mongoose.Schema({
  chatname:{
    type:String,

  },
  // lists everyone in chat
  users:[{
    type:mongoose.Schema.Types.ObjectId,
    ref:"User"
  }],
  latestmessage:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"Message"
  },
  groupAdmin:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"User "
  }
},{
  timestamps:true
})
const Chat = mongoose.model("Chat",chatSchema)
export default Chat