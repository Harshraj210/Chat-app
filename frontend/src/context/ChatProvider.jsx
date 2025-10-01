import React, { createContext, useContext, useState, useEffect } from "react";

// import { useNavigate } from "react-router-dom"; 

const ChatContext = createContext();

const ChatProvider = ({ children }) => {
  const [user, setUser] = useState();

  // This effect now only runs ONCE to load the user from storage.
  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    setUser(userInfo);
  }, []); 

  return (
    <ChatContext.Provider value={{ user, setUser }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChatState = () => {
  return useContext(ChatContext);
};

export default ChatProvider;