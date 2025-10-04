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
      setLoading(true);

      const config = {
        headers: {
          // adds your JWT token in headers so backend knows which user is renaming
          Authorization: `Bearer ${user.token}`,
        },
      };
      // calls backend API to rename chat
      const { data } = await axios.put(
        "/api/chat/rename",
        {
          chatId: selectedChat._id,
          chatName: groupChatName,
        },
        config
      );
      setSelectedChat(data);
      setFetchAgain(!fetchAgain);
      // tell other components like chat list to refresh
      setLoading(false);
      // Close the modal
      onClose();
    } catch (error) {
      setLoading(false);
      console.error("Failed to rename chat", error);
    }
  };
  // the modal is not supposed to show, render nothing
  if (!isOpen) return null;
  return (
    <>
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
            <div className="bg-gray-800 p-6 rounded-lg w-full max-w-md">
                <h2 className="text-2xl font-bold text-center mb-4">{selectedChat.chatName.toUpperCase()}</h2>
                <div className="flex flex-col space-y-4">
                    {/* Display members here later */}
                    <div className="flex space-x-2 items-center">
                         <input
                            type="text"
                            placeholder="New Chat Name"
                            value={groupChatName}
                            onChange={(e) => setGroupChatName(e.target.value)}
                            className="w-full p-2 bg-gray-700 rounded-lg"
                        />
                        <button onClick={handleRename} className="px-4 py-2 bg-teal-600 rounded-lg">
                            {loading ? "Updating..." : "Update"}
                        </button>
                    </div>
                    {/* Add/Remove users functionality will go here */}
                </div>
                <div className="flex justify-end mt-6">
                    <button onClick={onClose} className="px-4 py-2 bg-red-600 rounded-lg">Close</button>
                </div>
            </div>
        </div>
        </>
    );
};

export default UpdateGroupChatModal;

