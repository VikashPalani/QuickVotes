import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import StudentEntry from "./pages/StudentEntry";
import StudentPolling from "./pages/StudentPolling";
import TeacherPollResult from "./pages/TeacherPollResult";
import TeacherCreatePoll from "./pages/TeacherCreatePoll";

function App() {
  return (
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/teacher/create" element={<TeacherCreatePoll />} />
        <Route path="/teacher/result" element={<TeacherPollResult />} />
        <Route path="/student" element={<StudentEntry />} />
        <Route path="/student/poll" element={<StudentPolling />} />
      </Routes>
  );
}

export default App;