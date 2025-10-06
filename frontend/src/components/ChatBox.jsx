import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useChatState } from "../context/ChatProvider";
import Picker from "emoji-picker-react";
import io from "socket.io-client";

import { motion, AnimatePresence } from "framer-motion";

const ENDPOINT = "http://localhost:3000";

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
    setSocket(newSocket);
    newSocket.emit("setup", user);
    newSocket.on("connected", () => console.log("Socket.IO Connected!"));
    return () => newSocket.disconnect();
  }, [user]);

  const fetchMessages = async () => {
    if (!selectedChat || !user) return;
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get(`/api/message/${selectedChat._id}`, config);
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
      setTypingUsers((prev) => (!prev.includes(typingUser.name) ? [...prev, typingUser.name] : prev));
    });
    socket.on("stop typing", (typingUser) => {
      setTypingUsers((prev) => prev.filter((u) => u !== typingUser.name));
    });

    const messageListener = (newMessageReceived) => {
      if (!selectedChat || selectedChat._id !== newMessageReceived.chat._id) return;
      setMessages((prevMessages) => [...prevMessages, newMessageReceived]);
    };

    socket.on("message received", messageListener);

    return () => {
      socket.off("message received", messageListener);
      socket.off("typing");
      socket.off("stop typing");
    };
  }, [selectedChat, messages, socket]);

  const sendMessage = async (event) => {
    event.preventDefault();
    if (selectedChat && newMessage.trim()) {
      try {
        const config = { headers: { "Content-type": "application/json", Authorization: `Bearer ${user.token}` } };
        const messageToSend = newMessage;
        setNewMessage("");

        const { data } = await axios.post("/api/message", { content: messageToSend, chatId: selectedChat._id }, config);
        socket.emit("new message", data);
        setMessages([...messages, data]);
      } catch (error) {
        console.error("Error sending message", error);
      }
    }
  };

  const getSender = (loggedUser, users) => {
    if (!loggedUser || !users) return "Unknown";
    return users[0]?._id === loggedUser.user._id ? users[1].name : users[0].name;
  };

  const onEmojiClick = (emojiObject) => {
    setNewMessage((prevInput) => prevInput + emojiObject.emoji);
    setShowPicker(false);
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const handleTyping = () => {
    setIsTyping(true);
    socket?.emit("typing", { chatId: selectedChat._id, name: user.user.name });

    clearTimeout(window.typingTimeout);
    window.typingTimeout = setTimeout(() => {
      setIsTyping(false);
      socket?.emit("stop typing", { chatId: selectedChat._id, name: user.user.name });
    }, 1000);
  };

  return (
    <div
      className={`flex flex-col w-full h-full rounded-2xl transition-all duration-300 overflow-hidden ${
        selectedChat ? "bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a]" : "bg-gray-800 items-center justify-center"
      }`}
    >
      {selectedChat ? (
        <>
          {/* Header */}
          <div className="flex items-center justify-between text-xl sm:text-2xl font-semibold p-3 border-b border-white/10 backdrop-blur-md bg-white/5">
             {/*  Add motion to back button */}
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

          {/* Messages container */}
          <div className="flex-grow flex flex-col-reverse bg-black/20 rounded-lg m-3 p-3 overflow-y-auto shadow-inner scrollbar-thin scrollbar-thumb-teal-500/40">
            {/* . Wrap the message list in motion.div */}
            <motion.div
              className="flex flex-col space-y-3"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {messages.map((m) => (
                // Animate each message
                <motion.div
                  key={m._id}
                  variants={messageVariants}
                  className={`flex items-end space-x-2 ${
                    m.sender?._id === user.user._id ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`px-4 py-2 rounded-2xl max-w-xs sm:max-w-md break-words shadow-md ${
                      m.sender?._id === user.user._id
                        ? "bg-gradient-to-r from-indigo-500 to-blue-500 text-white rounded-br-none"
                        : "bg-gray-700/70 text-gray-100 rounded-bl-none"
                    }`}
                  >
                    <p>{m.content}</p>
                    <p
                      className={`text-xs mt-1 ${
                        m.sender._id === user.user._id ? "text-blue-200" : "text-gray-400"
                      } text-right`}
                    >
                      {formatTimestamp(m.createdAt)}
                    </p>
                  </div>
                </motion.div>
              ))}

              {/* Typing indicator */}
              <AnimatePresence>
                {typingUsers.length > 0 && selectedChat?.isGroupChat && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="text-teal-300 text-sm italic"
                  >
                    {typingUsers.join(", ")} {typingUsers.length === 1 ? "is" : "are"} typing...
                  </motion.div>
                )}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </motion.div>
          </div>

          {/* Message input */}
          <form
            onSubmit={sendMessage}
            className="p-3 border-t border-white/10 bg-white/5 flex items-center space-x-3"
          >
            <div className="relative">
              {/*  Add motion to emoji button */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                type="button"
                onClick={() => setShowPicker((val) => !val)}
                className="p-2 text-gray-300 hover:text-teal-400 transition-all"
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
              </motion.button>
              {/* Wrap Emoji Picker in AnimatePresence for smooth open/close */}
              <AnimatePresence>
                {showPicker && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8, y: 20 }}
                    transition={{ duration: 0.2 }}
                    className="absolute bottom-14 left-0 z-50"
                  >
                    <Picker onEmojiClick={onEmojiClick} theme="dark" />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <input
              type="text"
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => {
                setNewMessage(e.target.value);
                handleTyping();
              }}
              className="w-full p-2 bg-gray-800/80 border border-gray-700 rounded-xl text-gray-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
             {/*  Add motion to send button */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              type="submit"
              className="p-2 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-xl transition-transform shadow-md"
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
          </form>
        </>
      ) : (
        <div className="text-center text-gray-400 p-8">
          <h3 className="text-2xl font-medium text-teal-400 mb-2">Select a user to start chatting 💬</h3>
          <p className="text-gray-500">Your conversations will appear here.</p>
        </div>
      )}
    </div>
  );
};

export default ChatBox;
