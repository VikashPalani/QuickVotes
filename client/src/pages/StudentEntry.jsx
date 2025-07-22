import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { socket } from "../utils/socket";

function StudentEntry() {
  const [studentName, setStudentName] = useState(''); // State for the student's name
  const navigate = useNavigate();                     // Hook for programmatic navigation

  useEffect(() => {
    // On component mount, check if student name already exists in sessionStorage
    const storedName = sessionStorage.getItem('studentName');
    if (storedName) {
      setStudentName(storedName); // Pre-fill the input if name found
      navigate('/student/poll');  // Redirect directly to poll page if name exists
    }
  }, [navigate]); // navigate is a dependency to ensure effect runs if navigate changes (though it's stable)

  const handleSubmit = (e) => {
    e.preventDefault(); // Prevent default form submission
    if (studentName.trim()) {
      sessionStorage.setItem('studentName', studentName.trim()); // Store name in sessionStorage
      navigate('/student/poll'); // Navigate to the student polling page
    } else {
      // Using alert for simple validation as per instructions, consider a custom modal in production
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