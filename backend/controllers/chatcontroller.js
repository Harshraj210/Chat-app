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

      const chatData = {
        chatName: "sender",
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

// Logic to fetch all chats for a user will go here

const fetchChats = async (req, res) => {
  try {
    //  Find all chats for the user and wait for the result
    const results = await Chat.find({
      users: { $elemMatch: { $eq: req.user._id } },
    })
      .populate("users", "-password")
      .populate("groupAdmin", "-password")
      .populate("latestMessage")
      .sort({ updatedAt: -1 });

    //  Do the nested population for the sender's details and wait
    const populatedChats = await User.populate(results, {
      path: "latestMessage.sender",
      select: "name email",
    });

    //  Send the single, final response back to the frontend
    res.status(200).json(populatedChats);
  } catch (error) {
    // If any step fails, send a single error response
    res.status(400).json({ message: error.message });
  }
};

const createGroupChat = async (req, res) => {
  if (!req.body.users || !req.body.name) {
    return res.status(400).send({ message: "Please fill all the fields" });
  }

  let users = JSON.parse(req.body.users);

  //
  // The rule is changed from users.length < 2 to users.length < 1.
  // This allows you to create a group with just one other person.
  if (users.length < 1) {
    return res
      .status(400)
      .send("At least one other user is required to form a group chat");
  }

  // Add the current user (who is creating the group) to the list of users
  users.push(req.user);

  try {
    const groupChat = await Chat.create({
      chatName: req.body.name,
      users: users,
      isGroupChat: true,
      groupAdmin: req.user,
    });

    // Fetch the newly created group chat to populate the user details
    const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    res.status(200).json(fullGroupChat);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// group admin to rename a chat
const renameGroup = async (req, res) => {
  const { chatId, chatName } = req.body;

  const updatedChat = await Chat.findByIdAndUpdate(
    chatId,
    {
      chatName: chatName,
    },
    {
      // option returns the updated document
      new: true,
    }
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");
  if (!updatedChat) {
    res.status(404).json({ message: "Chat Not Found" });
  } else {
    res.json(updatedChat);
  }
};
const addToGroup = async (req, res) => {
  const { chatId, userId } = req.body;

  

  const added = await Chat.findByIdAndUpdate(
    chatId,
    // '$push' adds an item to an array
    { $push: { users: userId } }, 
    { new: true }
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  if (!added) {
    return res.status(404).json({ message: "Chat Not Found" });
  } else {
    res.json(added);
  }
};
const removeFromGroup = async (req, res) => {
  const { chatId, userId } = req.body;
 const removed = await Chat.findByIdAndUpdate(
    chatId,
    // '$pull' removes an item from an array
    { $pull: { users: userId } }, 
    { new: true }
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  if (!removed) {
    return res.status(404).json({ message: "Chat Not Found" });
  } else {
    res.json(removed);
  }
}





export { accessChat, fetchChats, createGroupChat, renameGroup,addToGroup,
  removeFromGroup, };
