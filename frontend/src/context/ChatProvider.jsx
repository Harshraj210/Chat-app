import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const ChatContext = createContext();

const ChatProvider = ({ children }) => {
  // State for the logged-in user
  const [user, setUser] = useState();
  
  // State for the chat that is currently open in the ChatBox
  const [selectedChat, setSelectedChat] = useState();
  
  // State for the user's entire list of chats (initialized as an empty array)
  const [chats, setChats] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    setUser(userInfo);

    if (!userInfo) {
      navigate("/");
    }
  }, [navigate]);

  return (
    // Provide all state variables and their setters to the rest of the app
    <ChatContext.Provider
      value={{
        user,
        setUser,
        selectedChat,
        setSelectedChat,
        chats,
        setChats,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

// Custom hook to easily access the context from any component
export const useChatState = () => {
  return useContext(ChatContext);
};

export default ChatProvider;