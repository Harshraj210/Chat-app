import React, { useState } from "react";
import axios from "axios";
import { useChatState } from "../context/ChatProvider";
// this modal deals with groupchat function for adding and deleting memebers

const GroupChatModal = ({ isOpen, onClose }) => {
  const [groupChatName, setGroupChatName] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);

  const { user, chats, setChats } = useChatState();
  // Handler to search for users to add to the group
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
  // Handler to submit the new group chat data to the backend
  const handleSubmit = async () => {
    if (!groupChatName || selectedUsers.length === 0) {
      
      console.log("Please provide a chat name and select users.");
      return;
    }
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.post(
        "/api/chat/group",
        {
          name: groupChatName,
          users: JSON.stringify(selectedUsers.map((u) => u._id)),
        },
        config
      );
      setChats([data, ...chats]); // Add the new group to the top of the chat list
      onClose(); // Close the modal on success
    } catch (error) {
      console.error("Group creation failed", error);
    }
  };
  // Handler to add a user to the selected list

   const handleGroup = (userToAdd) => {
        if (selectedUsers.some(u => u._id === userToAdd._id)) {
            // User is already added
            return;
        }
        setSelectedUsers([...selectedUsers, userToAdd]);
    };
    // Handler to remove a user from the selected list
    const handleDelete = (delUser) => {
        setSelectedUsers(selectedUsers.filter((sel) => sel._id !== delUser._id));
    };
    if (!isOpen) return null;
    return (
        // Modal overlay
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center">
            {/* Modal content */}
            <div className="bg-gray-800 p-6 rounded-lg w-full max-w-md text-white">
                <h2 className="text-2xl font-bold text-center mb-4">Create Group Chat</h2>
                <div className="flex flex-col space-y-4">
                    <input 
                        type="text" 
                        placeholder="Group Name" 
                        onChange={(e) => setGroupChatName(e.target.value)} 
                        className="w-full p-2 bg-gray-700 rounded-lg focus:outline-none" 
                    />
                    <input 
                        type="text" 
                        placeholder="Add Users...." 
                        onChange={(e) => handleSearch(e.target.value)} 
                        className="w-full p-2 bg-gray-700 rounded-lg focus:outline-none" 
                    />
                    
                    {/* Display chips for selected users */}
                    <div className='w-full flex flex-wrap gap-2'>
                        {selectedUsers.map(u => (
                            <div key={u._id} className='flex items-center bg-purple-600 px-2 py-1 rounded-lg text-sm'>
                                {u.name}
                                <button onClick={() => handleDelete(u)} className='ml-2 text-white font-bold'>x</button>
                            </div>
                        ))}
                    </div>

                    {/* Display search results */}
                    <div className='h-32 overflow-y-auto'>
                        {loading ? <div>Loading...</div> : (
                            searchResult?.slice(0, 4).map(userResult => (
                                <div key={userResult._id} onClick={() => handleGroup(userResult)} className='cursor-pointer p-2 bg-gray-700 hover:bg-gray-600 rounded-lg flex items-center space-x-2 mt-2'>
                                    <span className='w-8 h-8 rounded-full bg-green-500 flex items-center justify-center font-bold'>{userResult.name[0].toUpperCase()}</span>
                                    <div>
                                        <p className='font-bold'>{userResult.name}</p>
                                        <p className='text-xs text-gray-400'>{userResult.email}</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
                <div className="flex justify-end mt-6 space-x-3">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-600 rounded-lg hover:bg-gray-500">Cancel</button>
                    <button onClick={handleSubmit} className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-500">Create Group</button>
                </div>
            </div>
        </div>
    );
};

export default GroupChatModal;


