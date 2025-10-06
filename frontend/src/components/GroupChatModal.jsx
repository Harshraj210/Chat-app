import React, { useState } from "react";
import { toast } from "react-hot-toast";
import axios from "axios";
import { useChatState } from "../context/ChatProvider";
 
import { motion, AnimatePresence } from "framer-motion";

//  Define animation variants
const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const modalVariants = {
  hidden: { opacity: 0, scale: 0.9, y: 50 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 30 } },
  exit: { opacity: 0, scale: 0.9, y: 50 },
};

const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0 },
};

const GroupChatModal = ({ isOpen, onClose, setFetchAgain }) => {
  const [groupChatName, setGroupChatName] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [renameLoading, setRenameLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);

  const { user, chats, setChats, selectedChat, setSelectedChat } =
    useChatState();

  const handleRemove = async (userToRemove) => {
    if (!selectedChat?.groupAdmin?.user) return;
    if (
      selectedChat?.groupAdmin?.user?._id !== user?.user?._id &&
      userToRemove?._id !== user?.user?._id
    ) {
      toast.error("Only admins can remove someone!");
      return;
    }

    try {
      setLoading(true);
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.put(
        "/api/chat/groupremove",
        {
          chatId: selectedChat?._id,
          userId: userToRemove?._id,
        },
        config
      );

      userToRemove?._id === user?.user?._id
        ? setSelectedChat()
        : setSelectedChat(data);
      toast.success("User removed successfully!");

      setFetchAgain((prev) => !prev);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      toast.error("Failed to remove user");
    }
  };

  const handleAddUser = async (userToAdd) => {
    if (!userToAdd?._id) return;
    if (!selectedChat?.users) return;
    if (selectedChat?.users.find((u) => u?._id === userToAdd?._id)) {
        toast.error("User is already in the group!");
        return;
    }
    if (selectedChat?.groupAdmin?.user?._id !== user?.user?._id) {
      toast.error("Only admins can add someone!");
      return;
    }

    try {
      setLoading(true);
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.put(
        "/api/chat/groupadd",
        {
          chatId: selectedChat?._id,
          userId: userToAdd?._id,
        },
        config
      );
      setSelectedChat(data);
      toast.success("User added to group!");

      setFetchAgain((prev) => !prev);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      toast.error("Failed to add user");
    }
  };

  const handleRename = async () => {
    if (!selectedChat?._id || !groupChatName) return;
    try {
      setRenameLoading(true);
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.put(
        "/api/chat/rename",
        {
          chatId: selectedChat?._id,
          chatName: groupChatName,
        },
        config
      );

      setSelectedChat(data);
      toast.success("Group renamed successfully!");

      setChats((prevChats) =>
        prevChats.map((c) => (c._id === data._id ? data : c))
      );
      setFetchAgain((prev) => !prev);
      setRenameLoading(false);
    } catch (error) {
      setRenameLoading(false);
      toast.error("Failed to rename Group");
    }
    setGroupChatName("");
  };

  const handleSearch = async (query) => {
    setSearch(query);
    if (!query) {
      setSearchResult([]);
      return;
    }
    try {
      setLoading(true);
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get(`/api/users?search=${query}`, config);
      setLoading(false);
      setSearchResult(data);
    } catch (error) {
      setLoading(false);
      console.error("Search failed", error);
    }
  };

  const handleSubmit = async () => {
    if (!groupChatName || selectedUsers.length === 0) {
        toast.error("Please fill all the fields");
        return;
    }

    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.post(
        "/api/chat/group",
        {
          name: groupChatName,
          users: JSON.stringify(selectedUsers.map((u) => u?._id)),
        },
        config
      );
      setChats([data, ...chats]);
      onClose();
      toast.success("New group chat created!");
    } catch (error) {
      toast.error("Group creation failed");
    }
  };

  const handleGroup = (userToAdd) => {
    if (selectedUsers.some((u) => u?._id === userToAdd?._id)) {
        toast.error("User already selected");
        return;
    }
    setSelectedUsers([...selectedUsers, userToAdd]);
  };

  const handleDelete = (delUser) => {
    setSelectedUsers(selectedUsers.filter((sel) => sel?._id !== delUser?._id));
  };
  
  //  Wrap the return in AnimatePresence
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
            className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4 sm:p-6"
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
        >
          <motion.div 
            className="bg-gray-800 p-4 sm:p-6 rounded-lg w-full max-w-md sm:max-w-lg text-white shadow-lg overflow-y-auto max-h-[90vh]"
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-center mb-4">
              Group Chat Settings
            </h2>

            {selectedChat && (
              <div className="mb-4">
                <h3 className="text-lg sm:text-xl font-semibold mb-2">
                  Group: {selectedChat?.chatName}
                </h3>
                {/* Rename Group */}
                <div className="flex flex-col sm:flex-row gap-2 mb-3">
                  <input
                    type="text"
                    placeholder="Rename group"
                    value={groupChatName}
                    onChange={(e) => setGroupChatName(e.target.value)}
                    className="w-full p-2 bg-gray-700 rounded-lg focus:outline-none"
                  />
                  <motion.button
                    onClick={handleRename}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-3 py-2 bg-green-600 rounded-lg hover:bg-green-500 w-full sm:w-auto"
                    disabled={renameLoading}
                  >
                    Rename
                  </motion.button>
                </div>
              </div>
            )}
            
            {/* Create Group / Add Users section */}
            <div className="flex flex-col space-y-3 mb-4">
                <input
                    type="text"
                    placeholder="Group Name"
                    onChange={(e) => setGroupChatName(e.target.value)}
                    className="w-full p-2 bg-gray-700 rounded-lg focus:outline-none"
                />
                <input
                    type="text"
                    placeholder="Add Users..."
                    onChange={(e) => handleSearch(e.target.value)}
                    className="w-full p-2 bg-gray-700 rounded-lg focus:outline-none"
                />
            </div>
            
             {/* Selected users pills */}
            <div className="flex flex-wrap gap-2 mb-4 min-h-[40px]">
                <AnimatePresence>
                {selectedUsers.map((u) => (
                    <motion.div
                        key={u?._id}
                        layout
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.5 }}
                        className="flex items-center bg-blue-600 px-2 py-1 rounded-lg text-sm"
                    >
                    {u?.name}
                    <motion.button
                        onClick={() => handleDelete(u)}
                        whileHover={{ scale: 1.2, rotate: 90 }}
                        whileTap={{ scale: 0.8 }}
                        className="ml-2 text-white font-bold"
                    >
                        x
                    </motion.button>
                    </motion.div>
                ))}
                </AnimatePresence>
            </div>
            
            {/* Search results */}
            <div className="h-32 overflow-y-auto">
              {loading ? (
                <div>Loading...</div>
              ) : (
                searchResult?.slice(0, 4).map((userResult) => (
                  <motion.div
                    key={userResult?._id}
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                    onClick={() => handleGroup(userResult)}
                    className="cursor-pointer p-2 bg-gray-700 hover:bg-gray-600 rounded-lg flex items-center space-x-2 mt-2"
                  >
                    <div className="relative">
                      <span className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center font-bold">
                        {userResult.name[0].toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-bold">{userResult?.name}</p>
                      <p className="text-xs text-gray-400">{userResult?.email}</p>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
            
             {/* Current Members in the Group */}
            <div className="flex flex-wrap gap-2 mb-3 mt-4">
              {selectedChat?.users?.map((u) => (
                <motion.div
                  key={u?._id}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center bg-purple-600 px-2 py-1 rounded-lg text-sm"
                >
                  {u?.name}
                  {u?._id === selectedChat?.groupAdmin?.user?._id && (
                    <span className="ml-2 text-xs text-yellow-300 font-bold">(Admin)</span>
                  )}
                  <motion.button
                    onClick={() => handleRemove(u)}
                    whileHover={{ scale: 1.2, color: 'rgb(252, 165, 165)'}}
                    whileTap={{ scale: 0.8 }}
                    className={`ml-2 font-bold`}
                  >
                    x
                  </motion.button>
                </motion.div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 mt-4">
              <motion.button
                onClick={onClose}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-4 py-2 bg-gray-600 rounded-lg hover:bg-gray-500 w-full sm:w-auto"
              >
                Cancel
              </motion.button>
              <motion.button
                onClick={handleSubmit}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-500 w-full sm:w-auto"
              >
                Create Chat
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default GroupChatModal;
