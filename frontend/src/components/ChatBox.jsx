import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useChatState } from "../context/ChatProvider";
import Picker from "emoji-picker-react";
import io from "socket.io-client";
import toast from "react-hot-toast";

import { motion, AnimatePresence } from "framer-motion";

const ENDPOINT = "http://localhost:5000";
// it is outside the component which survives even after server is discoonected   and reused  instead of creating the new connection every time
var socket;

// .Define animation variants for the list and its items
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const messageVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const ChatBox = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);
  const [socket, setSocket] = useState(null);
  const [showPicker, setShowPicker] = useState(false);
  const [mediaLoading, setMediaLoading] = useState(false);
  const { user, selectedChat, setSelectedChat } = useChatState();
  const messagesEndRef = useRef(null);

  // Function to scroll to the bottom of the messages 
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, typingUsers]); // Scroll when new messages or typing indicators appear

  useEffect(() => {
    if (!user) return;
    const newSocket = io(ENDPOINT);
    // storing socket in react state
    setSocket(newSocket);
    newSocket.emit("setup", user);
    newSocket.on("connected", () => console.log("Socket.IO Connected!"));
    return () => newSocket.disconnect();
  }, [user]);

  const fetchMessages = async () => {
    if (!selectedChat || !user) return;
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
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
    if (socket && selectedChat) {
      socket.emit("join chat", selectedChat._id);
    }
  }, [selectedChat, socket]);

  useEffect(() => {
    if (!socket) return;

    socket.on("typing", (typingUser) => {
      setTypingUsers((prev) =>
        !prev.includes(typingUser.name) ? [...prev, typingUser.name] : prev
      );
    });
    socket.on("stop typing", (typingUser) => {
      setTypingUsers((prev) => prev.filter((u) => u !== typingUser.name));
    });

    const messageListener = (newMessageReceived) => {
      if (!selectedChat || selectedChat._id !== newMessageReceived.chat._id)
        return;
      setMessages((prevMessages) => [...prevMessages, newMessageReceived]);
    };

    socket.on("message received", messageListener);

    return () => {
      socket.off("message received", messageListener);
      socket.off("typing");
      socket.off("stop typing");
    };
  }, [selectedChat, messages, socket]);

  //  Function to send a regular text message

  const sendMessage = async (event) => {
    event.preventDefault();
    if (selectedChat && newMessage.trim()) {
      try {
        const config = {
          headers: {
            "Content-type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
        };
        const messageToSend = newMessage;
        // clearing the input immidiately
        setNewMessage("");

        const { data } = await axios.post(
          "/api/message",
          { content: messageToSend, chatId: selectedChat._id },
          config
        );
        socket.emit("new message", data);
        setMessages([...messages, data]);
      } catch (error) {
        console.error("Error sending message", error);
      }
    }
  };
  // function to handle photo , video upload

  const handleMediaUpload = async (file) => {
    if (!file) return;
    setMediaLoading(true);
    const toastId = toast.loading("uploading media");

    // /this helps to figure out what kind of file it is
    const mediaType = file.type.startsWith("image")
      ? "image"
      : file.type.startswith("video")
      ? "video"
      : null;
    if (!mediaType) {
      toast.error("Please select valid image or video");
      setMediaLoading(false);
      return;
    }
    // formData --> used to send images videos to server via HTTP
    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", "chat-app");
    data.append("cloud_name", "dac3utuqb");

    // uploading it to cloudinary
    try {
      const result = await axios.post(
        `https://api.cloudinary.com/v1_1/dac3utuqb/${mediaType}/upload`,
        data
      );
      //
      const config = {
        headers: {
          // telling the content type is in json
          "content-type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data: messageData } = await axios.post(
        "api/message/media",
        {
          chatId: selectedChat._id,
          // The Cloudinary URL of the uploaded file
          mediaUrl: result.data.secure_url,
          mediaType: mediaType,
        },
        config
      );
      // connecting frontend using sockets
      // socket.emit --> used to send event to server
      socket.emit("new message", messageData);
      // cretates array for new array for new and old msgs
      // ... --> spread operator (copying everything from messages and adding one more item  without changing original arrray )
      setMessages([...messages, messageData]);
      toast.success("Media sent!", { id: toastId });
    } catch (error) {
      toast.error("Media upload failed.", { id: toastId });
    } finally {
      setMediaLoading(false);
    }
  };

  const getSender = (loggedUser, users) => {
    if (!loggedUser || !users) return "Unknown";
    return users[0]?._id === loggedUser.user._id
      ? users[1].name
      : users[0].name;
  };

  const onEmojiClick = (emojiObject) => {
    setNewMessage((prevInput) => prevInput + emojiObject.emoji);
    setShowPicker(false);
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleTyping = () => {
    setIsTyping(true);
    socket?.emit("typing", { chatId: selectedChat._id, name: user.user.name });

    clearTimeout(window.typingTimeout);
    window.typingTimeout = setTimeout(() => {
      setIsTyping(false);
      socket?.emit("stop typing", {
        chatId: selectedChat._id,
        name: user.user.name,
      });
    }, 1000);
  };

  return (
    <div
      className={`flex flex-col w-full h-full rounded-2xl transition-all duration-300 overflow-hidden ${
        selectedChat
          ? "bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a]"
          : "bg-gray-800 items-center justify-center"
      }`}
    >
      {selectedChat ? (
        <>
          <div className="flex items-center justify-between text-xl sm:text-2xl font-semibold p-3 border-b border-white/10 backdrop-blur-md bg-white/5">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="sm:hidden p-2 text-gray-400 hover:text-white transition-colors"
              onClick={() => setSelectedChat(null)}
            >
              ←
            </motion.button>
            <span className="flex-1 text-center sm:text-left text-teal-400 tracking-wide">
              {!selectedChat.isGroupChat
                ? getSender(user, selectedChat.users)
                : selectedChat.chatName.toUpperCase()}
            </span>
          </div>

          <div className="flex-grow flex flex-col-reverse bg-black/20 m-3 p-3 overflow-y-auto shadow-inner">
            <motion.div
              className="flex flex-col space-y-3"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {messages.map((m) => (
                <motion.div
                  key={m._id}
                  variants={messageVariants}
                  className={`flex items-end space-x-2 ${
                    m.sender?._id === user.user._id
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >
                  <div
                    className={`p-1.5 rounded-2xl max-w-xs sm:max-w-md break-words shadow-md ${
                      m.sender?._id === user.user._id
                        ? "bg-gradient-to-r from-indigo-500 to-blue-500 text-white rounded-br-none"
                        : "bg-gray-700/70 text-gray-100 rounded-bl-none"
                    }`}
                  >
                    {m.mediaType === "image" && (
                      <img
                        src={m.mediaUrl}
                        alt="Sent"
                        className="rounded-xl max-h-60 cursor-pointer"
                        onClick={() => window.open(m.mediaUrl, "_blank")}
                      />
                    )}
                    {m.mediaType === "video" && (
                      <video
                        src={m.mediaUrl}
                        controls
                        className="rounded-xl max-h-60"
                      />
                    )}

                    {m.content && !m.mediaUrl && (
                      <p className="px-3 py-1">{m.content}</p>
                    )}

                    <p
                      className={`text-xs mt-1 px-2 pb-1 ${
                        m.sender?._id === user.user._id
                          ? "text-blue-200"
                          : "text-gray-400"
                      } text-right`}
                    >
                      {formatTimestamp(m.createdAt)}
                    </p>
                  </div>
                </motion.div>
              ))}
              <div ref={messagesEndRef} />
            </motion.div>
          </div>

          <form
            onSubmit={sendMessage}
            className="p-3 border-t border-white/10 bg-white/5 flex items-center space-x-3"
          >
            <label
              htmlFor="media-upload"
              className={`cursor-pointer p-2 text-gray-300 rounded-full transition-colors ${
                mediaLoading
                  ? "opacity-50"
                  : "hover:text-teal-400 hover:bg-slate-700"
              }`}
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
                  d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                />
              </svg>
              <input
                id="media-upload"
                type="file"
                accept="image/*,video/*"
                className="hidden"
                onChange={(e) => handleMediaUpload(e.target.files[0])}
                disabled={mediaLoading}
              />
            </label>

            <div className="relative flex-grow">
              <input
                type="text"
                placeholder={
                  mediaLoading ? "Uploading media..." : "Type a message..."
                }
                value={newMessage}
                onChange={handleTyping}
                className="w-full p-2 bg-gray-800/80 border border-gray-700 rounded-xl text-gray-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
                disabled={mediaLoading}
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  type="button"
                  onClick={() => setShowPicker((val) => !val)}
                  className="p-1 text-gray-400 hover:text-teal-400"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
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
                </motion.button>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              type="submit"
              className="p-2 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-xl transition-transform shadow-md disabled:opacity-50"
              disabled={mediaLoading || !newMessage.trim()}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-white transform rotate-90"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
              </svg>
            </motion.button>

            <AnimatePresence>
              {showPicker && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8, y: 20 }}
                  transition={{ duration: 0.2 }}
                  className="absolute bottom-20 right-4 z-50"
                >
                  <Picker onEmojiClick={onEmojiClick} theme="dark" />
                </motion.div>
              )}
            </AnimatePresence>
          </form>
        </>
      ) : (
        <div className="text-center text-gray-400 p-8">
          <h3 className="text-2xl font-medium text-teal-400 mb-2">
            Select a user to start chatting 💬
          </h3>
          <p className="text-gray-500">Your conversations will appear here.</p>
        </div>
      )}
    </div>
  );
};

export default ChatBox;
