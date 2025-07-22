import React from 'react';
import { Link } from 'react-router-dom';

function Home() {
  return (
    <div className=" text-center p-8 rounded-xl shadow-2xl">
      <h1 className="text-5xl font-extrabold mb-6 text-gray-900 leading-tight animate-fade-in-down">
        Welcome to <span className="text-indigo-600">Live Polling</span> System
      </h1>
      <p className="text-xl mb-12 text-gray-700 max-w-md mx-auto animate-fade-in-up">
        Participate in real-time polls or host your own interactive sessions.
      </p>
      <div className="flex flex-col md:flex-row justify-center items-center gap-6 mt-10">
        {/* Teacher Button */}
        <Link to="/teacher/create">
          <button className="w-64 py-4 px-8 bg-indigo-600 hover:bg-indigo-700 text-white text-xl font-semibold rounded-full shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-indigo-300 active:bg-indigo-800 animate-slide-in-left">
            I'm a Teacher
          </button>
        </Link>
        {/* Student Button */}
        <Link to="/student">
          <button className="w-64 py-4 px-8 bg-green-500 hover:bg-green-600 text-white text-xl font-semibold rounded-full shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-green-300 active:bg-green-700 animate-slide-in-right">
            I'm a Student
          </button>
        </Link>
      </div>
    </div>
  );
}

export default Home;