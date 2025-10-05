import React, { useState } from "react";
import { toast } from "react-hot-toast";

import axios from "axios";
import { useChatState } from "../context/ChatProvider";

const GroupChatModal = ({ isOpen, onClose,setFetchAgain, }) => {
  const [groupChatName, setGroupChatName] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [renameLoading, setRenameLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);

  const { user, chats, setChats, selectedChat, setSelectedChat } = useChatState();

  const handleRemove = async (userToRemove) => {
    if (!selectedChat?.groupAdmin?.user) return;
    if (
      selectedChat?.groupAdmin?.user?._id !== user?.user?._id &&
      userToRemove?._id !== user?.user?._id
    ) {
      console.error("Only admins can remove someone!");
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


      setFetchAgain(!fetchAgain);
      fetchMessages();
      setLoading(false);
    } catch (error) {
      setLoading(false);
      toast.error("Failed to remove user");

    }
  };

  const handleAddUser = async (userToAdd) => {
    if (!userToAdd?._id) return;
    if (!selectedChat?.users) return;
    if (selectedChat?.users.find((u) => u?._id === userToAdd?._id)) return;
    if (selectedChat?.groupAdmin?.user?._id !== user?.user?._id) {
      console.error("Only admins can add someone!");
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

      setFetchAgain(!fetchAgain);
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

       setChats(prevChats =>
      prevChats.map(c => (c._id === data._id ? data : c))
    );
      setFetchAgain(!fetchAgain);
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
    if (!groupChatName || selectedUsers.length === 0) return;

    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.post(
        "/api/chat/group",
        { name: groupChatName, users: JSON.stringify(selectedUsers.map((u) => u?._id)) },
        config
      );
      setChats([data, ...chats]);
      onClose();
    } catch (error) {
      console.error("Group creation failed", error);
    }
  };

  const handleGroup = (userToAdd) => {
    if (selectedUsers.some((u) => u?._id === userToAdd?._id)) return;
    setSelectedUsers([...selectedUsers, userToAdd]);
  };

  const handleDelete = (delUser) => {
    setSelectedUsers(selectedUsers.filter((sel) => sel?._id !== delUser?._id));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center">
      <div className="bg-gray-800 p-6 rounded-lg w-full max-w-md text-white shadow-lg">
        <h2 className="text-2xl font-bold text-center mb-4">Group Chat Settings</h2>

        {selectedChat && (
          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-2">Group: {selectedChat?.chatName}</h3>

            {/* Rename Group */}
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                placeholder="Rename group"
                value={groupChatName}
                onChange={(e) => setGroupChatName(e.target.value)}
                className="w-full p-2 bg-gray-700 rounded-lg focus:outline-none"
              />
              <button
                onClick={handleRename}
                className="px-3 py-2 bg-green-600 rounded-lg hover:bg-green-500"
                disabled={renameLoading}
              >
                Rename
              </button>
            </div>

            {/* Current Members */}
            <div className="flex flex-wrap gap-2 mb-3">
              {selectedChat?.users?.map((u) => (
                <div key={u?._id} className="flex items-center bg-purple-600 px-2 py-1 rounded-lg text-sm">
                  {u?.name}
                  {(selectedChat?.groupAdmin?.user?._id === user?.user?._id || u?._id === user?.user?._id) && (
                    <button
                      onClick={() => handleRemove(u)}
                      className="ml-2 text-white font-bold hover:text-red-300"
                    >
                      x
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Add Users */}
        <div className="flex flex-col space-y-3 mb-4">
          <input
            type="text"
            placeholder="Add Users..."
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full p-2 bg-gray-700 rounded-lg focus:outline-none"
          />

          <div className="h-32 overflow-y-auto">
            {loading ? (
              <div>Loading...</div>
            ) : (
              searchResult?.slice(0, 4).map((userResult) => (
                <div
                  key={userResult?._id}
                  onClick={() => handleAddUser(userResult)}
                  className="cursor-pointer p-2 bg-gray-700 hover:bg-gray-600 rounded-lg flex items-center space-x-2 mt-2"
                >
                  <span className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center font-bold">
                    {userResult?.name?.[0]?.toUpperCase()}
                  </span>
                  <div>
                    <p className="font-bold">{userResult?.name}</p>
                    <p className="text-xs text-gray-400">{userResult?.email}</p>
                  </div>
                </div>
              ))
            )}
          </div>
          {/* Current Members in the Group */}
<div className="flex flex-wrap gap-2 mb-3 mt-4">
  {selectedChat?.users?.map((u) => (
    <div
      key={u?._id}
      className="flex items-center bg-purple-600 px-2 py-1 rounded-lg text-sm"
    >
      {u?.name}
      {/* Show Admin Label */}
      {u?._id === selectedChat?.groupAdmin?.user?._id && (
        <span className="ml-2 text-xs text-yellow-300 font-bold">(Admin)</span>
      )}

      {/* Remove Button */}
      <button
        onClick={() => handleRemove(u)}
        className={`ml-2 font-bold ${
          selectedChat?.groupAdmin?.user?._id === user?.user?._id ||
          u?._id === user?.user?._id
            ? "text-white hover:text-red-300"
            : "text-gray-400 cursor-not-allowed"
        }`}
        disabled={
          !(
            selectedChat?.groupAdmin?.user?._id === user?.user?._id ||
            u?._id === user?.user?._id
          )
        }
      >
        x
      </button>
    </div>
  ))}
</div>

        </div>

        {/* Selected Users */}
        <div className="flex flex-wrap gap-2 mb-4 min-h-[40px]">
          {selectedUsers.map((u) => (
            <div key={u?._id} className="flex items-center bg-blue-600 px-2 py-1 rounded-lg text-sm">
              {u?.name}
              <button
                onClick={() => handleDelete(u)}
                className="ml-2 text-white font-bold hover:text-red-300"
              >
                x
              </button>
            </div>
          ))}
        </div>

        <div className="flex justify-end space-x-3">
          <button onClick={onClose} className="px-4 py-2 bg-gray-600 rounded-lg hover:bg-gray-500">
            Cancel
          </button>
          <button onClick={handleSubmit} className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-500">
            Create / Update Chat
          </button>
        </div>
      </div>
    </div>
  );
};

export default GroupChatModal;
