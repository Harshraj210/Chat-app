import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useChatState } from "../context/ChatProvider";
import axios from "axios";

const Drawer = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { user, setSelectedChat, chats, setChats } = useChatState();
  const navigate = useNavigate();

  const handleSearch = async () => {
    if (!search) {
      console.log("Please enter something to search!!");
      return;
    }
    try {
      setLoading(true);
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
          Expires: "0",
        },
      };
      const { data } = await axios.get(`/api/users?search=${search}`, config);
      setLoading(false);
      setSearchResult(data);
    } catch (error) {
      setLoading(false);
      console.error("Failed to load search results", error);
    }
  };

  const accessChat = async (userId) => {
    try {
      const config = {
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.post(`/api/chat`, { userId }, config);
      if (!chats.find((c) => c._id === data._id)) {
        setChats([data, ...chats]);
      }
      setSelectedChat(data);
      setIsDrawerOpen(false);
    } catch (error) {
      console.error("Error fetching chat", error);
    }
  };

  const logoutHandler = () => {
    localStorage.removeItem("userInfo");
    navigate("/");
  };

  return (
    <>
      {/* ======================= */}
      {/* MAIN TOP BAR */}
      {/* ======================= */}
      <div className="w-full flex justify-between items-center bg-gray-800 p-3 border-b-2 border-gray-700 flex-wrap sm:flex-nowrap">
        {/*  Search Button (Left) */}
        <button
          onClick={() => setIsDrawerOpen(true)}
          className="flex items-center space-x-2 bg-gray-700 hover:bg-gray-600 p-2 rounded-lg w-full sm:w-auto justify-center sm:justify-start"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
              clipRule="evenodd"
            />
          </svg>
          <span className="text-sm sm:text-base">Search User</span>
        </button>

        {/* 💬 App Title (Center) */}
        <h1 className="text-xl sm:text-2xl font-bold text-center w-full sm:w-auto mt-2 sm:mt-0">
          Chat App
        </h1>

        {/*  Profile & Logout Menu (Right) */}
        <div className="flex items-center space-x-3 justify-center w-full sm:w-auto mt-2 sm:mt-0">
          <div className="relative">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="bg-gray-700 p-1 rounded-full focus:outline-none"
            >
              <span className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center font-bold">
                {user && user.user.name
                  ? user.user.name[0].toUpperCase()
                  : "?"}
              </span>
            </button>

            {isMenuOpen && (
              <div className="absolute right-0 mt-2 w-40 bg-gray-700 rounded-md shadow-lg py-1 z-50">
                <button
                  className="block w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-gray-600"
                  onClick={() => setIsMenuOpen(false)}
                >
                  My Profile
                </button>
                <button
                  onClick={logoutHandler}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-gray-600"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      
      {/* SEARCH DRAWER PANEL */}
      {/* ======================= */}
      <div
        className={`fixed top-0 left-0 h-full bg-gray-800 w-72 max-w-[80%] shadow-lg transform ${
          isDrawerOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 ease-in-out z-50`}
      >
        <div className="p-4 h-full flex flex-col">
          <div className="flex justify-between items-center border-b border-gray-700 pb-2 mb-4">
            <h2 className="text-xl font-semibold">Search Users</h2>
            <button
              onClick={() => setIsDrawerOpen(false)}
              className="text-gray-400 hover:text-white"
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
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <div className="flex space-x-2 mb-3">
            <input
              type="text"
              placeholder="Search by name or email"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full p-2 bg-gray-700 rounded-lg border border-gray-600 focus:outline-none text-sm"
            />
            <button
              onClick={handleSearch}
              className="p-2 bg-blue-600 rounded-lg text-sm hover:bg-blue-700"
            >
              Go
            </button>
          </div>

          <div className="overflow-y-auto flex-1 space-y-2 pr-1">
            {loading ? (
              <p>Loading...</p>
            ) : (
              searchResult?.map((foundUser) => (
                <div
                  key={foundUser._id}
                  onClick={() => accessChat(foundUser._id)}
                  className="flex items-center space-x-3 p-2 bg-gray-700 hover:bg-gray-600 rounded-lg cursor-pointer"
                >
                  <span className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center font-bold">
                    {foundUser.name[0].toUpperCase()}
                  </span>
                  <div>
                    <p className="font-bold text-sm sm:text-base">
                      {foundUser.name}
                    </p>
                    <p className="text-xs text-gray-400">{foundUser.email}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* to close drawer on outside click) */}
      {isDrawerOpen && (
        <div
          onClick={() => setIsDrawerOpen(false)}
          className="fixed top-0 left-0 w-full h-full bg-black opacity-50 z-40"
        ></div>
      )}
    </>
  );
};

export default Drawer;
