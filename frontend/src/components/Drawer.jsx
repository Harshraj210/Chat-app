import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useChatState } from '../context/ChatProvider';

const Drawer = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user } = useChatState(); // Get the user from our global state
  const navigate = useNavigate();

  const logoutHandler = () => {
    localStorage.removeItem("userInfo");
    navigate("/");
  };

  return (
    <div className='w-full flex justify-between items-center bg-gray-800 p-2 border-b-2 border-gray-700'>
      {/* Search User Button */}
      <button className='flex items-center space-x-2 bg-gray-700 hover:bg-gray-600 p-2 rounded-lg'>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" /></svg>
        <span>Search User</span>
      </button>

      <h1 className='text-2xl font-bold'>Chat App</h1>

      <div className='flex items-center space-x-4'>
        <div className='relative'>
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className='bg-gray-700 p-1 rounded-full focus:outline-none'>
            <span className='w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center font-bold'>
              
              {user && user.name ? user.name[0].toUpperCase() : '?'}
            </span>
          </button>
          
          {isMenuOpen && (
            <div className='absolute right-0 mt-2 w-48 bg-gray-700 rounded-md shadow-lg py-1 z-10'>
              <button className='block w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-gray-600'>
                My Profile
              </button>
              <button 
                onClick={logoutHandler} 
                className='block w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-gray-600'
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
export default Drawer
