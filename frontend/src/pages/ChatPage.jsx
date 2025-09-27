import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const ChatPage = () => {
    const [chats, setChats] = useState([]);
    const navigate = useNavigate();

    // This function will fetch the chats from the backend
    const fetchChats = async () => {
        try {
            const userInfo = JSON.parse(localStorage.getItem("userInfo"));
            
            // This config object includes the auth token in the header
            const config = {
                headers: {
                    Authorization: `Bearer ${userInfo.token}`,
                },
            };

            // Make the API call
            const { data } = await axios.get("http://localhost:5000/api/chat", config);
            setChats(data);
        } catch (error) {
            console.error("Failed to load the chats", error);
        }
    };

    // useEffect to run fetchChats when the component loads
    useEffect(() => {
        const userInfo = JSON.parse(localStorage.getItem("userInfo"));
        if (!userInfo) {
            navigate("/");
            return; // Stop execution if not logged in
        }
        
        fetchChats();
    }, [navigate]);

    const logoutHandler = () => {
        localStorage.removeItem("userInfo");
        navigate("/");
    };

    return (
        <div>
            <h1>Welcome to the Chat Page!</h1>
            <h1>Work in Progress.....</h1>
            <div>
                <h2>My Chats</h2>
                {/* We will map over the 'chats' state here later to display them */}
                {chats.map(chat => (
                    <div key={chat._id}>{chat.chatName}</div>
                ))}
            </div>
            <button onClick={logoutHandler}>Logout</button>
        </div>
    );
};
export default ChatPage;