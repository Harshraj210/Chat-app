import React, { useState, useEffect } from "react";
import axios from "axios";
import { useChatState } from "../context/ChatProvider";
import { Motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";


const ProfileModal = ({ isOpen, onClose }) => {
  const {user,setUser}=useChatState()
  // state for toggle view and edit images

  const[IsEditing,setIsEditing]=useState(false)
  const [name,setName]=useState(user?.user?.name || "")
  const [bio,setBio]=useState(user?.user?.bio || "user is mysterious")
  const[profilePic,setProfilePic]=useState(user?.user?.pic)
  useEffect(()=>{
    if(user?.user){
      setName(user.user.name)
      setBio(user.user.bio || "user is mysterious")
      setProfilePic(user.user.pic);
    }
    if(!isOpen) setIsEditing(false)
      // this runs only when user opens it and details are changed
  },[isOpen,user])

}