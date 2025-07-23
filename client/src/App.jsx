import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import TeacherCreatePoll from './pages/TeacherCreatePoll';
import TeacherPollResult from './pages/TeacherPollResult';
import StudentEntry from './pages/StudentEntry';
import StudentPolling from './pages/StudentPolling';

function App() {
  return (
    <Router>
      <div className="min-h-screen flex items-center justify-center p-5 bg-gradient-to-b from-blue-100 to-blue-200 font-inter">
        <div className="w-full max-w-2xl bg-white rounded-xl shadow-lg p-8 box-border">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/teacher/create" element={<TeacherCreatePoll />} />
            <Route path="/teacher/result" element={<TeacherPollResult />} />
            <Route path="/student" element={<StudentEntry />} />
            <Route path="/student/poll" element={<StudentPolling />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
