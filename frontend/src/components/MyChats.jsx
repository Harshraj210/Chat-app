import React, { useEffect, useState } from "react";
import axios from "axios";
import { useChatState } from "../context/ChatProvider";
import UpdateGroupChatModal from "./UpdateGroupChatModal.jsx";
import GroupChatModal from "./GroupChatModal";

const MyChats = () => {
  const { user, setSelectedChat, selectedChat, chats, setChats } = useChatState();
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [fetchAgain, setFetchAgain] = useState(false);

  const fetchChats = async () => {
    if (!user) return;
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get("/api/chat", config);
      setChats(data);
    } catch (error) {
      console.error("Failed to load the chats", error);
    }
  };

  useEffect(() => {
    fetchChats();
  }, [user, fetchAgain]);

  const getSender = (loggedUser, users) => {
    if (!loggedUser || !users || users.length < 2) return "Unknown User";
    return users[0]?._id === loggedUser.user._id ? users[1].name : users[0].name;
  };

  return (
    <>
      {/* Chats List */}
      <div
        className={`flex flex-col items-center p-3 bg-gray-800 w-full h-full rounded-lg 
        transition-all duration-300
        ${selectedChat ? "hidden sm:flex" : "flex"}`}
      >
        {/* Header with title & New Group Chat button */}
        <div className="pb-3 px-3 text-xl sm:text-2xl font-bold w-full flex justify-between items-center flex-wrap sm:flex-nowrap gap-2">
          <span className="w-full sm:w-auto text-center sm:text-left">My Chats</span>
          <button
            onClick={() => setIsGroupModalOpen(true)}
            className="flex items-center justify-center space-x-1 bg-gray-700 hover:bg-gray-600 p-2 rounded-lg text-sm sm:text-base font-medium w-full sm:w-auto"
          >
            <span>New Group Chat</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>

        {/* Scrollable chat list */}
        <div className="flex flex-col p-3 bg-gray-700 w-full h-full rounded-lg overflow-y-auto max-h-[70vh] sm:max-h-full">
          {chats ? (
            <div className="space-y-2">
              {chats.map((chat) => (
                <div
                  onClick={() => setSelectedChat(chat)}
                  key={chat._id}
                  className={`cursor-pointer px-3 py-2 rounded-lg transition-all duration-200 ${
                    selectedChat?._id === chat._id
                      ? "bg-blue-600"
                      : "bg-gray-600 hover:bg-blue-500"
                  }`}
                >
                  <div className="font-semibold text-white text-sm sm:text-base">
                    {!chat.isGroupChat ? getSender(user, chat.users) : chat.chatName}
                  </div>
                  {chat.latestMessage && (
                    <p className="text-xs sm:text-sm text-gray-300 truncate">
                      <b>{chat.latestMessage?.sender?.name || "Unknown"}: </b>
                      {chat.latestMessage?.content || ""}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-400">Loading chats...</p>
          )}
        </div>
      </div>

      {/* Group Chat Modal */}
      <GroupChatModal
        isOpen={isGroupModalOpen}
        onClose={() => setIsGroupModalOpen(false)}
        fetchAgain={fetchAgain}
        setFetchAgain={setFetchAgain}
      />
    </>
  );
};

export default MyChats;
