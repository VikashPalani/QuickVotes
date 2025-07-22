import React from 'react'
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { socket } from "../utils/socket";

const StudentEntry = () => {
  const [name, setName] = useState(localStorage.getItem("studentName") || "");
  const navigate = useNavigate();

  const join = () => {
    if (!name) return alert("Please enter a name");

    socket.emit("student_join", name, (res) => {
      if (res.success) {
        localStorage.setItem("studentName", name);
        navigate("/student/poll");
      } else {
        alert(res.message);
      }
    });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-blue-100">
      <h2 className="text-3xl font-bold mb-6">Enter Your Name</h2>
      <input
        type="text"
        className="p-3 border rounded mb-4 w-80"
        placeholder="e.g. John"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <button
        onClick={join}
        className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
      >
        Join Poll
      </button>
    </div>
  );
};

export default StudentEntry;
