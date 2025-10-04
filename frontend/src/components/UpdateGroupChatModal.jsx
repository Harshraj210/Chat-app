import React, { useState } from "react";
import axios from "axios";
import { useChatState } from "../context/ChatProvider";
// props like which should be visible or hidden
const UpdateGroupChatModal = ({
  isOpen,
  onClose,
  fetchAgain,
  setFetchAgain,
}) => {
  const [groupChatName, setGroupChatName] = useState("");
  // Shows “Updating…” while API is running
  const [loading, setLoading] = useState(false);
  const { user, selectedChat, setSelectedChat } = useChatState();

  const handleRename = async () => {
    if (!groupChatName) return;
    try {
      setLoading(true)

      const config = {
        headers:{
          // adds your JWT token in headers so backend knows which user is renaming
          Authorization: `Bearer ${user.token}`
        }
      }
      const {data}
    } catch (error) {
      
    }
  };
};
