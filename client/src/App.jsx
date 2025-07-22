import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import TeacherCreatePoll from './pages/TeacherCreatePoll';
import TeacherPollResult from './pages/TeacherPollResult';
import StudentEntry from './pages/StudentEntry';
import StudentPolling from './pages/StudentPolling';
// No need to import './index.css' anymore if it's empty

function App() {
  return (
    <>
      {/* Main container with Tailwind classes for centering and styling */}
      <div className="min-h-screen flex items-center justify-center p-5 bg-gradient-to-br from-blue-50 to-indigo-100 font-inter">
        <div className="w-full max-w-2xl bg-white rounded-xl shadow-lg p-8 box-border">
          <Routes>
            {/* Route for the home page */}
            <Route path="/" element={<Home />} />
            {/* Route for teacher to create a poll */}
            <Route path="/teacher/create" element={<TeacherCreatePoll />} />
            {/* Route for teacher to view poll results */}
            <Route path="/teacher/result" element={<TeacherPollResult />} />
            {/* Route for student entry (name input) */}
            <Route path="/student" element={<StudentEntry />} />
            {/* Route for student to participate in polling */}
            <Route path="/student/poll" element={<StudentPolling />} />
          </Routes>
        </div>
      </div>
    </>
  );
}

export default App;