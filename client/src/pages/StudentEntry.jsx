import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import socket from "../utils/socket";

function StudentEntry() {
  const [studentName, setStudentName] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const storedName = sessionStorage.getItem('studentName');
    if (storedName) {
      setStudentName(storedName);
      navigate('/student/poll');
    }
  }, [navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (studentName.trim()) {
      sessionStorage.setItem('studentName', studentName.trim());
      navigate('/student/poll');
    } else {
      alert('Please enter your name.');
    }
  };

  return (
    <div className="container p-5 text-center">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Join as a Student</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card bg-gray-50 p-6 rounded-lg shadow-sm">
          <label htmlFor="studentName" className="block text-lg font-medium text-gray-700 mb-2">Your Name:</label>
          <input
            type="text"
            id="studentName"
            value={studentName}
            onChange={(e) => setStudentName(e.target.value)}
            placeholder="Enter your name"
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-lg"
          />
        </div>
        <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:-translate-y-1">
          Join Poll
        </button>
      </form>
    </div>
  );
}

export default StudentEntry;