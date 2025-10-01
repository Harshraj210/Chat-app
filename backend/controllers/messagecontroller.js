import User from "../models/userModel.js"
import Chat from "../models/chatmodel.js"
import Message from "../models/messagemodel.js"
// this file handles all the logic of send updating recieving individula messages
const allMessages = async(req,res)=>{
  try {
    const messages = await Message.find({chat:req.params.chatId})
    // getting name email instaed of sender ID
    .populate("sender","name email")
    .populate("chat")
    res.json(messages)
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}
const sendMessage = async (req,res)=>{
  const {chatId,content}= req.body
  if(!chatId || !content){
    console.log("Invalid Message Passed")
    return res.sendStatus(400)
  }
  // creating message object

  const newMessage={
    sender:req.user._id,
    content:content,
    chat:chatId
  }
  try {
    // saving new message to message collection 
    let message  = await Message.create(newMessage)
    // dispalying whose message it is 
    message = await message.populate("sender","name")
    message = await message.populate("chat")
    message = await message.populate(message,{
      // path tells mongoose to goto chat field and fect users 
      path:"chat.users",
      select:"name email"
    })
    // updating the latest message 
    await Chat.findByIdAndUpdate(req.body.chatId,{latestmessage:message})
    res.json(message)

  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}
export {allMessages, sendMessage}
