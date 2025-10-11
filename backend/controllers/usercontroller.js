import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import User from "../models/userModel.js";

dotenv.config();

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_KEY, {
    expiresIn: "30d",
  });
};

// register user
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Fill all details" });
    }
    const userexist = await User.findOne({ email });
    if (userexist) {
      return res.status(400).json({ message: "User already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({ name, email, password: hashedPassword });
    return res.status(201).json({
      message: "User registered successfully",
      user: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
      },
      token: generateToken(newUser._id),
    });
  } catch (error) {
    res.status(500).json({ message: "Error registering user", error });
  }
};

// login user
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "User not found, Try again!!" });
    }
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ message: "Invalid Password, Try Again!!" });
    }
    return res.status(200).json({ 
      message: "Login successful",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        pic: user.pic, // Also send pic and bio on login
        bio: user.bio,
      },
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: "Error logging in", error });
  }
};

const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (user) {
      res.status(200).json(user);
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error fetching user profile", error });
  }
};


const updateUserProfile = async (req, res) => {
  try {
    const { name, bio } = req.body;
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { name, bio },
      { new: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }
    
    res.status(200).json({
      message: "Profile updated successfully",
      user: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        pic: updatedUser.pic,
        bio: updatedUser.bio,
      },
      token: generateToken(updatedUser._id),
    });
  } catch (error) {
    res.status(500).json({ message: "Error updating profile", error });
  }
};


const updateProfilePic = async (req, res) => {
  try {
    const { pic } = req.body;
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { pic: pic },
      { new: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "Profile picture updated successfully",
      user: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        pic: updatedUser.pic,
        bio: updatedUser.bio,
      },
      token: generateToken(updatedUser._id),
    });
  } catch (error) {
    res.status(500).json({ message: "Error updating profile picture", error });
  }
};

const allUsers = async (req, res) => {
  const query = req.query.search
    ? {
        $or: [

          // $options: "i" → makes it case-insensitive
          { name: { $regex: req.query.search, $options: "i" } },
          { email: { $regex: req.query.search, $options: "i" } },
        ],
      }
      // If no search is given
    : {};
  // $ne --> not equal
  // it removes user whose _id equals the logged-in user’s ID
  const users = await User.find(query).find({ _id: { $ne: req.user._id } });
  res.send(users);
};


export {
  registerUser,
  loginUser,
  allUsers,
  getUserProfile,
  updateUserProfile,
  updateProfilePic,
};
