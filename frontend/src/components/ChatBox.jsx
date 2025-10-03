import React, { useEffect, useState } from "react";
import axios from "axios";
import { useChatState } from "../context/ChatProvider";
import Picker from "emoji-picker-react";
import io from "socket.io-client";
// URL of your backend server where the socket is running
const ENDPOINT = "http://localhost:3000";


const ChatBox = () => {
  const [messages, setMessages] = useState([]);
  // controlled input text the user is typing
  const [newMessage, setNewMessage] = useState("");
  const [socket, setSocket] = useState(null);
  const { user, selectedChat } = useChatState();
  const [showPicker, setShowPicker] = useState(false);

  useEffect(() => {
    if (!user) return;
    // establishing connection to backend server
    const newSocket = io(ENDPOINT);
    setSocket(newSocket);
    newSocket.emit("setup", user);
    newSocket.on("connected", () => console.log("Socket.IO Connected!"));
    // when logout is done this comp. unloads
    return () => newSocket.disconnect();
  }, [user]);

  const fetchMessages = async () => {
    if (!selectedChat || !user) return;
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.get(
        `/api/message/${selectedChat._id}`,
        config
      );
      setMessages(data);
    } catch (error) {
      console.error("Error fetching messages", error);
    }
  };

  useEffect(() => {
    fetchMessages();
    //  when the user selects a chat they join the chat with the chat ID
    if (socket && selectedChat) {
      socket.emit("join chat", selectedChat._id);
    }
  }, [selectedChat, socket]);

  // This useEffect is dedicated to listening for incoming messages.....
  useEffect(() => {
    if (!socket) return;
    // If the message is not for the currently open chat
    const messageListener = (newMessageReceived) => {
      if (!selectedChat || selectedChat._id !== newMessageReceived._id) {
        // do nothing
      } else {
        // If it's for the current chat, add it to the messages list
        setMessages((prevMessages) => [...prevMessages, newMessageReceived]);
      }
    };
    // Set up the listener for the "message recieved" event from the server
    socket.on("message received", messageListener);
    return () => {
      socket.off("message received", messageListener);
    };
  }, [selectedChat, messages, socket]);

  // This function now handles the form submission
  // Replace the existing sendMessage function in your ChatBox.jsx

const sendMessage = async (event) => {
  event.preventDefault(); // Stop the page from reloading

  //  Only run if a chat is selected and there's a message
  if (selectedChat && newMessage.trim()) {
    try {
      const config = {
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      };

      // Store the message content in a temporary variable
      const messageToSend = newMessage;
      
      // Clear the input field immediately
      setNewMessage("");
      console.log("Data being sent to backend:", { content: messageToSend, chatId: selectedChat._id });

      const { data } = await axios.post(
        "/api/message",
        {
          content: messageToSend, // Use the temporary variable
          chatId: selectedChat._id, // Ensure we're sending the ID
        },
        config
      );

      // Update the UI instantly with the new message from the server
      setMessages([...messages, data]);
    } catch (error) {
      console.error("Error sending message", error);
    }
  }
};
  // show other person's name in 1to1 chat
  const getSender = (loggedUser, users) => {
    if (!loggedUser || !users) return "Unknown";
    return users[0]?._id === loggedUser.user._id
      ? users[1].name
      : users[0].name;
  };
  // handler when emoji is clicked
  const onEmojiClick = (emojiObject) => {
    setNewMessage((prevInput) => prevInput + emojiObject.emoji);
    // close picker after selecting the emoji
    setShowPicker(false);
  };
  // helper function to get timestamp
  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div
      className={`flex flex-col w-full h-full p-3 rounded-lg ${
        selectedChat ? "bg-gray-800" : "bg-gray-800 items-center justify-center"
      }`}
    >
      {selectedChat ? (
        <>
          <div className="text-xl font-bold p-2 border-b-2 border-gray-700 w-full text-center">
            {!selectedChat.isGroupChat
              ? getSender(user, selectedChat.users)
              : selectedChat.chatName.toUpperCase()}
          </div>
          <div className="flex-grow flex flex-col-reverse bg-gray-700 rounded-lg my-2 p-3 overflow-y-auto">
            <div className="flex flex-col space-y-3">
              {messages.map((m) => (
                <div
                  key={m._id}
                  className={`flex items-end space-x-2 ${
                    m.sender?._id === user.user._id
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >
                  {/* Message Bubble */}
                  <div
                    className={`px-3 py-2 rounded-2xl max-w-xs lg:max-w-md break-words ${
                      m.sender?._id === user.user._id
                        ? "bg-blue-600 rounded-br-none"
                        : "bg-gray-600 rounded-bl-none"
                    }`}
                  >
                    <p>{m.content}</p>
                    {/* 5. Display the formatted timestamp inside the bubble */}
                    <p
                      className={`text-xs mt-1 ${
                        m.sender._id === user.user._id
                          ? "text-blue-200"
                          : "text-gray-400"
                      } text-right`}
                    >
                      {formatTimestamp(m.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Message Input Form */}
          <form
            onSubmit={sendMessage}
            className="p-2 border-t-2 border-gray-700 flex items-center space-x-2 relative"
          >
            {/* 6. Emoji Picker Button */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowPicker((val) => !val)}
                className="p-2 text-gray-400 hover:text-white"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </button>
              {/* 7. Conditionally render the Emoji Picker */}
              {showPicker && (
                <div className="absolute bottom-14 left-0">
                  <Picker onEmojiClick={onEmojiClick} theme="dark" />
                </div>
              )}
            </div>

            <input
              type="text"
              placeholder="Enter a message.."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="w-full p-2 bg-gray-600 rounded-lg focus:outline-none"
            />
            <button
              type="submit"
              className="p-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 transform rotate-90"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
              </svg>
            </button>
          </form>
        </>
      ) : (
        <div className="text-center text-gray-400">
          <h3 className="text-2xl">Select a user to start chatting</h3>
        </div>
      )}
    </div>
  );
};

export default ChatBox;
