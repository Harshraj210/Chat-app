import React, { useEffect, useState } from "react";
import axios from "axios";
import { useChatState } from "../context/ChatProvider";
import UpdateGroupChatModal from "./UpdateGroupChatModal.jsx";
import GroupChatModal from "./GroupChatModal";
// this component is for de=iplaying the recent chats

const MyChats = () => {
  // Get global state and setters from the ChatProvider
  const { user, setSelectedChat, selectedChat, chats, setChats } =
    useChatState();
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [fetchAgain, setFetchAgain] = useState(false);

  const fetchChats = async () => {
    // We can't fetch chats if the user isn't logged in
    if (!user) return;

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      // Make the API call to our backend to get all chats for this user to /api/chat and show config key card
      const { data } = await axios.get("/api/chat", config);
      setChats(data);
    } catch (error) {
      console.error("Failed to load the chats", error);
    }
  };

  // This useEffect runs once when the component loads to fetch the chats
  useEffect(() => {
    fetchChats();
    // This tells React to re-run this effect (and re-fetch chats) whenever fetchAgain changes.
  }, [user, fetchAgain]);
  // Helper function to get the name of the other user in a one-on-one chat
  const getSender = (loggedUser, users) => {
    // safety checks for loggedUser and users
    if (!loggedUser || !users || users.length < 2) {
      return "Unknown User";
    }
    // id of 1st person is same as logged in user then return second person name or
    // return users[0] --> first person name
    return users[0]?._id === loggedUser.user._id
      ? users[1].name
      : users[0].name;
  };

  return (
    <>
      <div className="flex flex-col items-center p-3 bg-gray-800 w-full h-full rounded-lg">
        {/* Header section with title and "New Group Chat" button */}
        <div className="pb-3 px-3 text-2xl font-bold w-full flex justify-between items-center">
          My Chats
          <button
            onClick={() => setIsGroupModalOpen(true)}
            className="flex items-center space-x-1 bg-gray-700 hover:bg-gray-600 p-2 rounded-lg text-base font-medium"
          >
            <span>New Group Chat</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>

        {/* Container for the scrollable list of chats */}
        <div className="flex flex-col p-3 bg-gray-700 w-full h-full rounded-lg overflow-y-auto">
          {chats ? (
            // if chat exist show chat
            <div className="space-y-2">
              {/* Map over the chats array to display each one */}
              {chats.map((chat) => (
                <div
                  onClick={() => setSelectedChat(chat)}
                  // new message arrives moves at top
                  key={chat._id}
                  // Dynamically change background color if the chat is selected
                  className={`cursor-pointer px-3 py-2 rounded-lg ${
                    selectedChat?._id === chat
                      ? "bg-blue-600"
                      : "bg-gray-600 hover:bg-blue-500"
                  }`}
                >
                  <div className="font-semibold text-white">
                    {!chat.isGroupChat
                      ? getSender(user, chat.users)
                      : chat.chatName}
                  </div>
                  {chat.latestMessage && (
                    <p className="text-sm text-gray-300 truncate">
                      <b>{chat.latestMessage?.sender?.name || "Unknown"}: </b>
                      {chat.latestMessage?.content || ""}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            // Show a loading state while chats are being fetched
            <p className="text-center text-gray-400">Loading chats...</p>
          )}
        </div>
      </div>
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
