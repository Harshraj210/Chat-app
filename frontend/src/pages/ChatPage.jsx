import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useChatState } from "../context/ChatProvider.jsx";
import Drawer from "../components/Drawer.jsx";
import MyChats from "../components/MyChats.jsx";
import ChatBox from "../components/ChatBox.jsx";

const ChatPage = () => {
  const { user } = useChatState();
  const navigate = useNavigate();
  const [fetchAgain, setFetchAgain] =  useState(false)

  // This guard protects the page from non-logged-in users.
  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    if (!userInfo) {
      navigate("/");
    }
  }, [navigate]);

  
  // If the user state hasn't been loaded  yet,
  // display a loading message and stop rendering.
 if (!user) {
    return (
      <div className="w-full h-screen bg-gray-900 flex justify-center items-center text-white text-2xl">
        Loading...
      </div>
    );
  }

  // This part will only run AFTER the 'user' object is confirmed to exist.
  return (
    <div className="w-full h-screen bg-gray-900 text-white">
      <Drawer />
      <div className="flex justify-between w-full h-[91.5vh] p-3 space-x-3">
        <div className="w-1/3">
          <MyChats />
        </div>
        <div className="w-2/3">
          <ChatBox />
        </div>
      </div>
    </div>
  );
};

export default ChatPage;