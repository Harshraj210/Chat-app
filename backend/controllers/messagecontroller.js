import User from "../models/userModel.js";
import Chat from "../models/chatmodel.js";
import Message from "../models/messagemodel.js";
import { populate } from "dotenv";
// this file handles all the logic of send updating recieving individula messages
const allMessages = async (req, res) => {
  try {
    const messages = await Message.find({ chat: req.params.chatId })
      // getting name email instaed of sender ID
      .populate("sender", "name email")
      .populate("chat");
    res.json(messages);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
const sendMessage = async (req, res) => {
  const { content, chatId } = req.body;

  if (!content || !chatId) {
    console.log("Invalid data passed into request");
    return res.sendStatus(400);
  }

  const newMessage = {
    sender: req.user._id,
    content: content,
    chat: chatId,
  };

  try {
    //  Create the message
    let message = await Message.create(newMessage);

    //  Fetch the newly created message to populate it correctly
    message = await Message.findById(message._id)
      .populate("sender", "name") // Populate sender's name
      .populate("chat"); // Populate the chat details

    //  Further populate the users within the chat object
    message = await User.populate(message, {
      path: "chat.users",
      select: "name email",
    });

    //  Update the chat's 'latestMessage' field
    await Chat.findByIdAndUpdate(req.body.chatId, {
      latestMessage: message, 
    });

    //  Send the complete message back
    res.json(message);
  } catch (error) {
    // This will log the specific database error to  backend terminal
    console.error("ERROR SENDING MESSAGE:", error);
    res
      .status(400)
      .json({ message: "Failed to send message", details: error.message });
  }
};
const sendMediaMessage = async (req, res) => {
  const { chatId, mediaUrl, mediaType } = req.body;
  if (!chatId || !mediaType || !mediaType) {
    return res.status(400).json({ message: "invalid data passed in media!!" });
  }
  const newMessage = {
    sender: req.user._id,
    chat: chatId,
    mediaUrl: mediaUrl,
    mediaType: mediaType,
    // content must be media
    content: mediaType === "image" ? "send photo" : "send video",
  };
  try {
    // creating new messages
    const message = new Message.create(newMessage);
    message = await message.populate("sender", "name pic");
    message = await message.populate("chat");
    message = await User.populate(message, {
      path: "chat.user",
      select: "name,pic,email",
    });
    await Chat.findByIdAndUpdate({ latestMessage: message });
    res.json(message);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
export { allMessages, sendMessage, sendMediaMessage };
