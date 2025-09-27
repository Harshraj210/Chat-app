import React,{useState,useEffect} from "react";
import axios from "axios";
import { Navigate } from "react-router-dom";

const Drawer = () =>{
  return (

  <div className="w-full bg-gray-800 flex justify-center items-center border-gray-800  p-2 border-b-2">
    <button className="flex hover:bg-gray-600 bg-gray-600rounded items-center space-x-2 p-2 rounded-lg ">
      {/* SVG --> Scalable Vector Graphic (mage made from mathematical lines and curves) */}
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" /></svg>
    <span>
     Search User..
    </span>
     
    </button>
    <h1 className="text-2xl font-bold">WLECOME TO YOUR CHAT APP</h1>
    {/* profile section */}
    <div>
      <button className="bg-gray-700 p-2 rounded-full">
         <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
      </button>
    </div>
  </div>
  )
}
export default Drawer