import Chat from "../models/chatmodel.js";
import User from "../models/userModel.js";

const accessChat = async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    console.log("UserId param not sent with request");
    return res.sendStatus(400);
  }

  try {
    // Use findOne which is more efficient for finding a single document
    let isChat = await Chat.findOne({
      isGroupChat: false,
      $and: [
        { users: { $elemMatch: { $eq: req.user._id } } },
        { users: { $elemMatch: { $eq: userId } } },
      ],
    })
      // .populate --> mongoose func. that replaces the ID fields with actual data in that document
      .populate("users", "-password")
      .populate("latestMessage");

    // Populate the sender of the latest message
    isChat = await User.populate(isChat, {
      path: "latestMessage.sender",
      select: "name email",
    });

    if (isChat) {
      // If the chat is found, send it back
      res.send(isChat);
    } else {
      // If chat is not found, create a new one.
      // The creation logic is now correctly nested inside the 'else' block.
      const chatData = {
        chatName: "sender", // Corrected to camelCase "chatName"
        isGroupChat: false,
        users: [req.user._id, userId],
      };

      const createdChat = await Chat.create(chatData);
      const fullChat = await Chat.findOne({ _id: createdChat._id }).populate(
        "users",
        "-password"
      );
      res.status(200).json(fullChat);
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const fetchChats = async (req, res) => {
  // Logic to fetch all chats for a user will go here
  res.send("Fetch Chats route");
};

const createGroupChat = async (req, res) => {
  // Logic to create a group chat will go here
  res.send("Create Group Chat route");
};

export { accessChat, fetchChats, createGroupChat };
