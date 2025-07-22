import React from 'react'
import { useEffect, useState } from "react";
import { socket } from "../utils/socket";

const StudentPolling = () => {
  const [poll, setPoll] = useState(null);
  const [selected, setSelected] = useState(null);
  const [results, setResults] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);

  useEffect(() => {
    socket.on("new_poll", (pollData) => {
      setPoll(pollData);
      setResults(null);
      setSelected(null);

      const endTime = Date.now() + pollData.timeLimit * 1000;

      const interval = setInterval(() => {
        const diff = Math.max(0, Math.floor((endTime - Date.now()) / 1000));
        setTimeLeft(diff);
        if (diff <= 0) clearInterval(interval);
      }, 1000);

      return () => clearInterval(interval);
    });

    socket.on("poll_ended", (data) => {
      setResults(data);
      setTimeLeft(null);
    });

    return () => {
      socket.off("new_poll");
      socket.off("poll_ended");
    };
  }, []);

  const submit = () => {
    if (selected === null) return;
    socket.emit("student_answer", selected, (res) => {
      if (!res.success) alert(res.message);
    });
  };

  if (!poll) return <p className="text-center mt-10">Waiting for a poll...</p>;

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-2">{poll.question}</h2>
      <p className="mb-4 text-gray-500">Time Left: {timeLeft}s</p>

      {results ? (
        <ul className="space-y-2">
          {poll.options.map((opt, idx) => (
            <li
              key={idx}
              className="p-3 border rounded flex justify-between bg-gray-50"
            >
              <span>{opt}</span>
              <span className="font-semibold">{results[idx] || 0} votes</span>
            </li>
          ))}
        </ul>
      ) : (
        <>
          <ul className="space-y-3">
            {poll.options.map((opt, idx) => (
              <li
                key={idx}
                onClick={() => setSelected(idx)}
                className={`p-3 border rounded cursor-pointer hover:bg-blue-100 ${
                  selected === idx ? "bg-blue-200" : ""
                }`}
              >
                {opt}
              </li>
            ))}
          </ul>
          <button
            onClick={submit}
            className="mt-6 bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded"
          >
            Submit Answer
          </button>
        </>
      )}
    </div>
  );
};

export default StudentPolling;

