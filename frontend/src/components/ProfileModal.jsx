import React, { useState, useEffect } from "react";
import axios from "axios";
import { useChatState } from "../context/ChatProvider";
import { Motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";

const ProfileModal = ({ isOpen, onClose }) => {
  const { user, setUser } = useChatState();
  // state for toggle view and edit images

  const [IsEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.user?.name || "");
  const [bio, setBio] = useState(user?.user?.bio || "user is mysterious");
  const [profilePic, setProfilePic] = useState(user?.user?.pic);

  // states for loading indicators

  const [loading, setLoading] = useState(false);
  const [picLoading, setPicLoading] = useState(false);

  // this effect resets the models state whenever states changes
  useEffect(() => {
    if (user?.user) {
      // setting up datas
      setName(user.user.name);
      setBio(user.user.bio || "user is mysterious");
      setProfilePic(user.user.pic);
    }
    if (!isOpen) setIsEditing(false);
    // this runs only when user opens it and details are changed
  }, [isOpen, user]);

  const handlePicUpload = async (pics) => {
    if (!pics) {
      return toast.error("Please upload photo!!");
    }
    setPicLoading(true);
    if (pics.type === "image/jpeg" || pics.type === "image/png") {
      const data = new FormData();
      data.append("file", pics);
      data.append("upload_preset", "chat-app");
      data.append("cloud_name", "dac3utuqb");
      try {
       const result = await axios.post(
          "https://api.cloudinary.com/v1_1/dac3utuqb/image/upload",
          // data-->conatains all the image files ,presets
          data
        );
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        const { data: updatedUserData } = await axios.put(
            '/api/user/update-pic', 
            // With axios, the response is inside the .data property
            // result.data.url -->is the public URL of the uploaded image.
            { pic: result.data.url.toString() }, 
            config
        );
        // Update your application's state
           localStorage.setItem("userInfo", JSON.stringify(updatedUserData));
          //  live update UI without reload.
        setUser(updatedUserData);
        setProfilePic(updatedUserData.user.pic);
        toast.success("Profile picture updated!");

      } catch (error) {
        toast.error("Image upload failed. Please try again.");
      }
      // finally runs after either try completes successfully or after catch runs due to an error
      // Use it to perform cleanup that must happen regardless of success/failure
      finally {
        setPicLoading(false);
      }
    }
    else {
      toast.error("Please select a JPG or PNG image.");
      setPicLoading(false);
    }
  };
  const handleSaveChanges = async (e) => {
    e.preventDefault();
    if (name.trim() === "") {
      return toast.error("Name cannot be empty.");
    }
    setLoading(true);
    try {
      const config = { headers: { "Content-Type": "application/json", Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.put('/api/user/profile', { name, bio }, config);
      localStorage.setItem("userInfo", JSON.stringify(data));
      setUser(data);
      toast.success("Profile updated successfully!");
      setIsEditing(false);
    } catch (error) {
      toast.error("Failed to update profile.");
    } finally {
      setLoading(false);
    }
  }
};
