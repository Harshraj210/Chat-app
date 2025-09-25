import Chat from "../models/chatmodel.js";
import User from "../models/userModel.js";

const chatAccess = async (req, res) => {
  const { userId } = requestAnimationFrame.body;
  if (!userId) {
    console.log("User Id not Found");
    return res.status(400);
  }
  let isChat = await Chat.find({
    isGroupChat: false,
    // mongoDB query operators
    $and: [
      // Logged-in user
      { users: { $elemMatch: { $eq: req.user._id } } },
      // Target user
      { users: { $elemMatch: { $eq: userId } } },
    ],
  })
    // .populate --> mongoose func. that replaces the ID fields with actual data in that document
    .populate("users", "-passwords")
    // if there is latest message it replaces the id with data
    .populate("latestMessage");
  if (isChat.length > 0) {
    res.send(isChat[0]);
  } else {
    const chatdata = {
      chatname: "sender",
      isGroupChat: false,
      users: [req.user._id, userId],
    };
  }
  try {
    const chatcreate = await Chat.create(chatdata);
    // his line immediately finds the chat we just created
    const fullchat = await Chat.findOne({ _id: createdChat._id }).populate(
      "users",
      "-password"
    );
    res.status(200).json(fullchat);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export default { chatAccess };
