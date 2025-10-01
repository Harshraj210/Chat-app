import React, { useEffect, useState } from "react";
import axios from "axios";
import { useChatState } from "../context/ChatProvider";
// this component is for de=iplaying the recent chats

const MyChats = () => {
  // Get global state and setters from the ChatProvider
  const { user, setSelectedChat, selectedChat, chats, setChats } =
    useChatState();

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
  }, [user]);
  // Helper function to get the name of the other user in a one-on-one chat
  const getSender = (loggedUser, users) => {
    // id of 1st person is same as logged in user then return second person name or
    // return users[0] --> first person name
    return users[0]?._id === loggedUser?._id ? users[1].name : users[0].name;
  };

  return (
    // Main container for the MyChats component
    <div className="flex flex-col items-center p-3 bg-gray-800 w-full h-full rounded-lg">
      {/* Header section with title and "New Group Chat" button */}
      <div className="pb-3 px-3 text-2xl font-bold w-full flex justify-between items-center">
        My Chats
        <button className="flex items-center space-x-1 bg-gray-700 hover:bg-gray-600 p-2 rounded-lg text-base font-medium">
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
                  selectedChat?._id === chat._id
                    ? "bg-blue-600"
                    : "bg-gray-600 hover:bg-blue-500"
                }`}
              >
                <p className="font-bold text-lg">
                  {/* Display the group name or the other user's name */}
                  {!chat.isGroupChat
                    ? getSender(user, chat.users)
                    : chat.chatName}
                </p>
                {/* Display the latest message if it exists */}
                {chat.latestMessage && (
                  <p className="text-sm text-gray-300 truncate">
                    <b>{chat.latestMessage.sender.name} : </b>
                    {chat.latestMessage.content}
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
  );
};

export default MyChats;
