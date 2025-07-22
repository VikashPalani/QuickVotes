import React from 'react'
import { useEffect, useState } from "react";
import { socket } from "../utils/socket";

const TeacherPollResult = () => {
  const [results, setResults] = useState({});
  const [poll, setPoll] = useState(null);

  useEffect(() => {
    socket.on("poll_update", (data) => setResults(data));
    socket.on("new_poll", (pollData) => setPoll(pollData));
    socket.on("poll_ended", (data) => setResults(data));

    return () => {
      socket.off("poll_update");
      socket.off("new_poll");
      socket.off("poll_ended");
    };
  }, []);

  if (!poll) return <p className="text-center mt-10">Waiting for poll to start...</p>;

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Poll Results</h2>
      <p className="text-lg mb-4">{poll.question}</p>
      <ul className="space-y-2">
        {poll.options.map((opt, idx) => (
          <li key={idx} className="p-3 border rounded flex justify-between">
            <span>{opt}</span>
            <span className="font-semibold">{results[idx] || 0} votes</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TeacherPollResult;

