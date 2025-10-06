import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useChatState } from "../context/ChatProvider.jsx";
import Drawer from "../components/Drawer.jsx";
import MyChats from "../components/MyChats.jsx";
import ChatBox from "../components/ChatBox.jsx";

const ChatPage = () => {
  const { user, selectedChat } = useChatState();
  const navigate = useNavigate();
  const [fetchAgain, setFetchAgain] = useState(false);

  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    if (!userInfo) {
      navigate("/");
    }
  }, [navigate]);

  if (!user) {
    return (
      <div className="w-full h-screen bg-gray-900 flex justify-center items-center text-white text-2xl">
        Loading...
      </div>
    );
  }

  return (
    <div className="w-full h-screen bg-gray-900 text-white flex flex-col">
      <Drawer />
      <div className="flex flex-1 justify-between w-full p-2 md:p-3 md:space-x-3 overflow-hidden">
        {/*  MyChats Section */}
        <div
          className={`${
            selectedChat ? "hidden md:flex" : "flex"
          } w-full md:w-1/3 transition-all duration-300`}
        >
          <MyChats fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} />
        </div>

        {/*  ChatBox Section */}
        <div
          className={`${
            selectedChat ? "flex" : "hidden md:flex"
          } w-full md:w-2/3 transition-all duration-300`}
        >
          <ChatBox fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} />
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
