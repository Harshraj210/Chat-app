import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./LoginPage.css";

const LoginPage = () => {
  const [showLogin, setShowLogin] = useState(true); // State to toggle

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    if (userInfo) navigate("/chats");
  }, [navigate]);

  const handleLogin = async () => {
    if (!loginEmail || !loginPassword) {
      console.error("Please fill all the fields for login");
      return;
    }

    try {
      const config = {
        headers: {
          "Content-type": "application/json",
        },
      };

      const { data } = await axios.post(
        "http://localhost:3000/api/users/login",
        { email: loginEmail, password: loginPassword }
      );

      localStorage.setItem("userInfo", JSON.stringify(data));
      navigate("/chats");
    } catch (error) {
      if (error.response) {
        console.error("Login Failed:", error.response.data.message);
      } else {
        // This handles network errors where the server couldn't be reached
        console.error("An error occurred:", error.message);
      }
    }
  };

  const handleRegister = async () => {
    if (!name || !email || !password) {
      console.error("Please fill all the fields for registration");
      return;
    }

    try {
      const config = {
        headers: {
          "Content-type": "application/json",
        },
      };

      const { data } = await axios.post(
    "http://localhost:3000/api/users/register", // <-- CORRECTED PORT
    { name, email, password }
);

      localStorage.setItem("userInfo", JSON.stringify(data));
      navigate("/chats");
    } catch (error) {
      if (error.response) {
        console.error("Registration failed:", error.response.data.message);
      } else {
        // This handles network errors where the server couldn't be reached
        console.error("An error occurred:", error.message);
      }
    }
  };

  return (
    <div className="login-container">
      <div className="form-box">
        <div className="button-box">
          <div id="btn" style={{ left: showLogin ? "0" : "110px" }}></div>
          <button
            type="button"
            className="toggle-btn"
            onClick={() => setShowLogin(true)}
          >
            Log In
          </button>
          <button
            type="button"
            className="toggle-btn"
            onClick={() => setShowLogin(false)}
          >
            Register
          </button>
        </div>

        {/* Login Form */}
        <form
          id="login"
          className="input-group"
          style={{ left: showLogin ? "50px" : "-400px" }}
          onSubmit={(e) => {
            e.preventDefault();
            handleLogin();
          }}
        >
          <input
            type="email"
            className="input-field"
            placeholder="Email"
            required
            onChange={(e) => setLoginEmail(e.target.value)}
          />
          <input
            type="password"
            className="input-field"
            placeholder="Password"
            required
            onChange={(e) => setLoginPassword(e.target.value)}
          />
          <button type="submit" className="submit-btn">
            Log in
          </button>
        </form>

        {/* Register Form */}
        <form
          id="register"
          className="input-group"
          style={{ left: showLogin ? "450px" : "50px" }}
          onSubmit={(e) => {
            e.preventDefault();
            handleRegister();
          }}
        >
          <input
            type="text"
            className="input-field"
            placeholder="Name"
            required
            onChange={(e) => setName(e.target.value)}
          />
          <input
            type="email"
            className="input-field"
            placeholder="Email"
            required
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            className="input-field"
            placeholder="Password"
            required
            onChange={(e) => setPassword(e.target.value)}
          />
          <button type="submit" className="submit-btn">
            Register
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
