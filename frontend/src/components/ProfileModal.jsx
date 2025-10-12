import React, { useState, useEffect } from "react";
import axios from "axios";
import { useChatState } from "../context/ChatProvider";
import { Motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";


const ProfileModal = ({ isOpen, onClose }) => {
  const {user,setUser}=useChatState()
  // state for toggle view and edit images

  const[isEditing,setisEditing]=useState(false)
  const [name,setName]=useState(user?.user?.name || "")
  const [bio,setBio]=useState(user?.user?.bio || "user is mysterious")
  const[profilePic,setProfilePic]=useState(user?.user?.pic)

}