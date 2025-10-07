import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import User from "../models/userModel.js";

dotenv.config(); // load .env file

// generating JWT token
// id-->payload
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

    // check if user exists
    const userexist = await User.findOne({ email });
    if (userexist) {
      return res.status(400).json({ message: "User already exists" });
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // create new user
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
    });

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
    console.error("REGISTRATION ERROR:", error);
    res.status(500).json({ message: "Error registering user", error });
  }
};

// login user
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "User not found, Try again!!" });
    }

    // compare password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ message: "Invalid Password, Try Again!!" });
    }

    // success -> return user + token
    return res.status(200).json({
      message: "Login successful",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
      },
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: "Error logging in", error });
  }
};

const getUserProfile = async (req, res) => {
  try {
    // req.user is populated by the 'protect' middleware
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


// updating Usewr profile

// const updateUserProfile = async (req, res) => {
//   try {
//     const { name, bio } = req.body;

//     // Find the user by their ID (from the JWT token) and update them
//     const updatedUser = await User.findByIdAndUpdate(
//       req.user._id, // The user's ID is attached by the 'protect' middleware
//       { name, bio },
//       { new: true } // This option returns the updated document
//     ).select("-password"); // Exclude the password from the returned object

//     if (!updatedUser) {
//       return res.status(404).json({ message: "User not found" });
//     }
    
//     // Send back the updated user info and a new token
//     res.status(200).json({
//         message: "Profile updated successfully",
//         user: {
//             _id: updatedUser._id,
//             name: updatedUser.name,
//             email: updatedUser.email,
//             pic: updatedUser.pic,
//             bio: updatedUser.bio
//         },
//         token: generateToken(updatedUser._id),
//     });

//   } catch (error) {
//     res.status(500).json({ message: "Error updating profile", error });
//   }
// };
// // NEW FUNCTION TO UPDATE ONLY THE PROFILE PICTURE
// const updateProfilePic = async (req, res) => {
//     try {
//         const { pic } = req.body; // The new pic URL from Cloudinary

//         const updatedUser = await User.findByIdAndUpdate(
//             req.user._id,
//             { pic: pic },
//             { new: true }
//         ).select("-password");

//         if (!updatedUser) {
//             return res.status(404).json({ message: "User not found" });
//         }

//         res.status(200).json({
//             message: "Profile picture updated successfully",
//             user: {
//                 _id: updatedUser._id,
//                 name: updatedUser.name,
//                 email: updatedUser.email,
//                 pic: updatedUser.pic,
//                 bio: updatedUser.bio
//             },
//             token: generateToken(updatedUser._id),
//         });

//     } catch (error) {
//         res.status(500).json({ message: "Error updating profile picture", error });
//     }
// };
const allUsers = async (req, res) => {
  const query = req.query.search
    ? {
        $or: [
          { name: { $regex: req.query.search, $options: "i" } },
          { email: { $regex: req.query.search, $options: "i" } },
        ],
      }
    : {};
  
  // Find all users matching the query, but exclude the current user
  const users = await User.find(query).find({ _id: { $ne: req.user._id } });
  res.send(users);
};

export { registerUser, loginUser, allUsers, getUserProfile };
