import React, { useState } from "react";
import axios from "axios";
import { useChatState } from "../context/ChatProvider";

import { motion, AnimatePresence } from "framer-motion";

//  Define animation variants for the modal and its backdrop
const backdropVariants = {
  visible: { opacity: 1 },
  hidden: { opacity: 0 },
};

const modalVariants = {
  hidden: {
    y: "-100vh",
    opacity: 0,
  },
  visible: {
    y: "0",
    opacity: 1,
    transition: { type: "spring", stiffness: 120, damping: 20 },
  },
};

const UpdateGroupChatModal = ({
  isOpen,
  onClose,
  fetchAgain,
  setFetchAgain,
}) => {
  const [groupChatName, setGroupChatName] = useState("");
  const [loading, setLoading] = useState(false);
  const { user, selectedChat, setSelectedChat } = useChatState();

  const handleRename = async () => {
    if (!groupChatName) return;
    try {
      setLoading(true);
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
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
      setLoading(false);
      onClose();
    } catch (error) {
      setLoading(false);
      console.error("Failed to rename chat", error);
    }
  };

  //  Wrap the modal JSX in AnimatePresence to enable exit animations
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-2 sm:p-6"
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
        >
          {/* 4. Apply variants to the modal panel */}
          <motion.div
            className="bg-gray-800 p-4 sm:p-6 rounded-lg w-full max-w-md shadow-lg"
            variants={modalVariants}
            // initial, animate, and exit are inherited from the parent motion component
          >
            {/* Modal Header */}
            <h2 className="text-2xl font-bold text-center mb-4 break-words">
              {selectedChat.chatName.toUpperCase()}
            </h2>

            {/* Rename Section */}
            <div className="flex flex-col space-y-4">
              <div className="flex flex-col sm:flex-row gap-2 items-center">
                <input
                  type="text"
                  placeholder="New Chat Name"
                  value={groupChatName}
                  onChange={(e) => setGroupChatName(e.target.value)}
                  className="w-full p-2 bg-gray-700 rounded-lg focus:outline-none"
                />
                {/* 5. Convert button to motion.button for interaction animations */}
                <motion.button
                  onClick={handleRename}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 py-2 bg-teal-600 rounded-lg hover:bg-teal-500 transition-colors w-full sm:w-auto"
                  disabled={loading}
                >
                  {loading ? "Updating..." : "Update"}
                </motion.button>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex justify-end mt-6 space-x-2 flex-wrap sm:flex-nowrap">
              <motion.button
                onClick={onClose}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-4 py-2 bg-red-600 rounded-lg hover:bg-red-500 w-full sm:w-auto"
              >
                Close
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default UpdateGroupChatModal;
