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
  }
};

export default { chatAccess };
