import React, { useState } from 'react';
import './App.css';

function App() {
  // State to hold the values from the input fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Function to handle form submission
  const handleSubmit = (event) => {
    // Prevents the page from reloading
    event.preventDefault(); 
    console.log('Registering user:', { name, email, password });
    
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Welcome to Chat App</h1>
        <form onSubmit={handleSubmit}>
          <h2>Register</h2>
          <div>
            <input
              type="text"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit">Register</button>
        </form>
      </header>
    </div>
  );
}

export default App;