import React, { useState, useEffect } from "react";
import axios from "axios";
import { useChatState } from "../context/ChatProvider";

import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";

// Animation variants for the modal
const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};
const modalVariants = {
  hidden: { opacity: 0, scale: 0.9, y: -50 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: "spring", stiffness: 200, damping: 25 },
  },
  exit: { opacity: 0, scale: 0.95, y: 50 },
};


const ProfileModal = ({ isOpen, onClose }) => {
  const { user, setUser } = useChatState();
  // state for toggle view and edit images

   
  const [isEditing, setIsEditing] = useState(false);
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
          // data-->conatains all the image files, presets
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
  // function that handles submitting updated name and bio
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
      // after saving, user sees the view-mode display.
      setIsEditing(false);
    } catch (error) {
      toast.error("Failed to update profile.");
    }
    // Cleanup block that always runs
     finally {
      setLoading(false);
    }
  };

  
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4"
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          onClick={onClose}
        >
          <motion.div
            className="bg-slate-800 rounded-2xl w-full max-w-sm shadow-xl p-6 text-white border border-slate-700 relative"
            variants={modalVariants}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col items-center">
              <div className="relative mb-4">
                <motion.img
                  layoutId="profilePic"
                  src={profilePic || `https://i.pravatar.cc/150?u=${user?.user?._id}`}
                  alt="Profile"
                  className="w-28 h-28 rounded-full object-cover border-4 border-teal-500"
                />
                {isEditing && (
                  <div className="absolute inset-0 rounded-full bg-black/60 flex items-center justify-center">
                    {picLoading ? (
                      <div className="w-8 h-8 border-4 border-t-teal-500 border-gray-200 rounded-full animate-spin"></div>
                    ) : (
                      <label htmlFor="pic-upload" className="cursor-pointer text-white hover:text-teal-400">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        <input id="pic-upload" type="file" accept="image/*" className="hidden" onChange={(e) => handlePicUpload(e.target.files[0])} />
                      </label>
                    )}
                  </div>
                )}
              </div>
              <AnimatePresence mode="wait">
                {isEditing ? (
                   <motion.form key="edit" onSubmit={handleSaveChanges} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="w-full flex flex-col items-center gap-4">
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full p-2 bg-slate-700 rounded-lg text-center text-xl font-bold focus:outline-none focus:ring-2 focus:ring-teal-500" />
                    <textarea value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Tell us about yourself..." className="w-full p-2 bg-slate-700 rounded-lg text-center text-sm text-slate-300 h-24 resize-none focus:outline-none focus:ring-2 focus:ring-teal-500" />
                    <div className="flex gap-3 mt-2">
                      <motion.button type="button" onClick={() => setIsEditing(false)} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="px-4 py-2 bg-slate-600 rounded-lg hover:bg-slate-500 text-sm font-semibold">Cancel</motion.button>
                      <motion.button type="submit" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="px-4 py-2 bg-teal-600 rounded-lg hover:bg-teal-500 text-sm font-semibold" disabled={loading}>{loading ? "Saving..." : "Save Changes"}</motion.button>
                    </div>
                  </motion.form>
                ) : (
                  <motion.div key="view" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="text-center w-full">
                    <h2 className="text-2xl font-bold">{name}</h2>
                    <p className="text-slate-400 text-sm">{user?.user?.email}</p>
                    <p className="text-slate-300 mt-3 text-sm max-w-xs mx-auto">{bio}</p>
                    <motion.button onClick={() => setIsEditing(true)} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="mt-6 px-5 py-2 bg-teal-600 rounded-lg hover:bg-teal-500 text-sm font-semibold">Edit Profile</motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <motion.button onClick={onClose} whileHover={{ scale: 1.2, rotate: 90 }} whileTap={{ scale: 0.9 }} className="absolute top-4 right-4 text-slate-400 hover:text-white">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ProfileModal;

