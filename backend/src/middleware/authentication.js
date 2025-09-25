import jwt from "jsonwebtoken"
import User from "../models/usermodel.js"

const prottect = async(req,res,next)=>{
  try {
     const authHeader = req.headers.authorization;

     if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token, Not authorized!!" });
     }
     const token = authHeader.split(" ")[1]
     const decoded =  jwt.verify(token,process.env.JWT_KEY)
     req
  } catch (error) {
    
  }
}