import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import User from "../models/usermodel.js";

// registering user
const registerUser = async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: "Fill all details" });
  }
  // user existence
  const userexist = await User.findOne({ email });
  if (userexist) {
    return res.status(400).json({ message: "User already exists" });
  }
  // hasing password
  const hashedPassword = await bycrypt.hash(password, 10);
  // new user to database
  const newUser = await new User.create({
    name,
    email,
    password: hashedPassword,
   
  });
  
};

const loginUser= async (req,res)=>{
  const {email,password}=req.body
  // finding the User
  const user = await User.findOne({username}) 
  if(!user){
    return res.status(400).json({message:"USer not found, Try again!!"})
  }
  // validation of passwords
  const validPassword = await bcrypt.compare(password,user.password)
  if(!validPassword)
    return res.staus(400).json({message:"Invalid Password, Try Again!!"})
}
