import Chat from "../models/chatmodel.js";
import User from "../models/userModel.js";

const chatAccess = async (req,res)=>{

  const {userId} = requestAnimationFrame.body
  if(!userId){
    console.log("User Id not Found")
    return res.status(400)
  }
}

export default {chatAccess}