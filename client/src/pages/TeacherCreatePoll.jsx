import React from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { socket } from "../utils/socket";

const TeacherCreatePoll = () => {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [correctOption, setCorrectOption] = useState(null);
  const [timeLimit, setTimeLimit] = useState(60);
  const navigate = useNavigate();

  const addOption = () => setOptions([...options, ""]);
  const handleOptionChange = (i, value) => {
    const newOptions = [...options];
    newOptions[i] = value;
    setOptions(newOptions);
  };

  const createPoll = () => {
    if (!question || options.length < 2 || correctOption === null) {
      alert("Fill all fields correctly");
      return;
    }

    socket.emit(
      "teacher_create_poll",
      {
        question,
        options,
        correctOption,
        timeLimit,
      },
      (res) => {
        if (res.success) {
          navigate("/teacher/result");
        } else {
          alert(res.message);
        }
      }
    );
  };

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h2 className="text-3xl font-bold mb-6">Create New Poll</h2>

      <input
        type="text"
        placeholder="Enter your question"
        className="w-full p-3 mb-4 border rounded"
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
      />

      <label className="block mb-2">Options</label>
      {options.map((opt, idx) => (
        <div key={idx} className="flex gap-3 mb-2">
          <input
            type="text"
            className="flex-1 p-2 border rounded"
            value={opt}
            onChange={(e) => handleOptionChange(idx, e.target.value)}
          />
          <input
            type="radio"
            name="correctOption"
            checked={correctOption === idx}
            onChange={() => setCorrectOption(idx)}
            title="Mark as correct"
          />
        </div>
      ))}
      <button
        className="mt-2 text-blue-600 underline"
        onClick={addOption}
      >
        + Add Option
      </button>

      <div className="mt-4">
        <label className="block mb-1">Time Limit (seconds)</label>
        <input
          type="number"
          className="p-2 border rounded w-32"
          value={timeLimit}
          onChange={(e) => setTimeLimit(Number(e.target.value))}
        />
      </div>

      <button
        onClick={createPoll}
        className="mt-6 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded"
      >
        Start Poll
      </button>
    </div>
  );
};

export default TeacherCreatePoll;
