import React from "react";
import { Route, Routes } from "react-router-dom";
import LoginPage from "./pages/LoginPage.jsx";
import ChatPage from "./pages/ChatPage.jsx";
import "./App.css";

function App() {
  return (
    <div className="App">
      <Routes>
        {/* when we use '/' shows loginpage */}
        <Route path="/" element={<LoginPage />} />

        {/* When the user navigates to "/chats", show the ChatPage */}
        <Route path="/chats" element={<ChatPage />} />
      </Routes>
    </div>
  );
}

export default App;
