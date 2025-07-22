import React from "react";
import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-blue-200 to-blue-500 text-gray-800">
      <h1 className="text-5xl font-bold mb-8">🎓 QuickVotes</h1>
      <p className="text-xl mb-6">Real-time polling system for Teachers and Students</p>
      <div className="flex gap-8">
        <Link
          to="/teacher/create"
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-2xl text-lg shadow-lg transition"
        >
          I'm a Teacher
        </Link>
        <Link
          to="/student"
          className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-2xl text-lg shadow-lg transition"
        >
          I'm a Student
        </Link>
      </div>
    </div>
  );
};

export default Home;
