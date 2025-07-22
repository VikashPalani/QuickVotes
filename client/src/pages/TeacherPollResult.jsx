import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { socket } from '../utils/socket'; // Import the socket instance for communication
import ChatPopup from '../components/ChatPopup'; // Import the ChatPopup component

function TeacherPollResult() {
  const [currentPoll, setCurrentPoll] = useState(null);
  const [pollResults, setPollResults] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [pollActive, setPollActive] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    socket.emit('requestPollState');

    socket.on('newPoll', (data) => {
      console.log('Teacher: Received newPoll', data);
      setCurrentPoll(data.poll);
      setPollResults(data.results);
      setPollActive(true);
      const initialTimeLeft = Math.max(0, data.poll.endTime - Date.now());
      setTimeLeft(Math.floor(initialTimeLeft / 1000));
    });

    socket.on('pollUpdate', (data) => {
      console.log('Teacher: Received pollUpdate', data);
      if (currentPoll && data.pollId === currentPoll.id) {
        setPollResults(data.results);
      }
    });

    socket.on('pollEnded', (data) => {
      console.log('Teacher: Received pollEnded', data);
      if (currentPoll && data.pollId === currentPoll.id) {
        setPollResults(data.results);
        setCurrentPoll(null);
        setPollActive(false);
        setTimeLeft(0);
      }
    });

    socket.on('currentPollState', (data) => {
      console.log('Teacher: Received currentPollState', data);
      setCurrentPoll(data.poll);
      setPollResults(data.results);
      setPollActive(true);
      setTimeLeft(Math.floor(data.timeLeft / 1000));
    });

    socket.on('waitingForPoll', () => {
      console.log('Teacher: No active poll, waiting.');
      setCurrentPoll(null);
      setPollResults({});
      setPollActive(false);
      setTimeLeft(0);
    });

    return () => {
      socket.off('newPoll');
      socket.off('pollUpdate');
      socket.off('pollEnded');
      socket.off('currentPollState');
      socket.off('waitingForPoll');
    };
  }, [currentPoll]);

  useEffect(() => {
    let timerInterval;
    if (pollActive && timeLeft > 0) {
      timerInterval = setInterval(() => {
        setTimeLeft(prevTime => {
          if (prevTime <= 1) {
            clearInterval(timerInterval);
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    } else if (timeLeft === 0 && pollActive) {
        setPollActive(false);
    }

    return () => clearInterval(timerInterval);
  }, [pollActive, timeLeft]);

  const handleNewPoll = () => {
    navigate('/teacher/create');
  };

  const totalVotes = Object.values(pollResults).reduce((sum, count) => sum + count, 0);

  return (
    <div className="container p-5 text-center">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Live Poll Results (Teacher View)</h1>

      {currentPoll ? (
        <div className="card bg-gray-50 p-6 rounded-lg shadow-sm">
          <h2 className="text-2xl font-semibold mb-4 text-gray-700">Question: {currentPoll.question}</h2>
          <p className="text-xl font-medium mb-4 text-gray-600">Time Remaining: <span className="font-bold text-blue-600">{timeLeft}</span> seconds</p>
          <h3 className="text-xl font-semibold mb-3 text-gray-700">Results:</h3>
          {totalVotes > 0 ? (
            <div className="space-y-4">
              {currentPoll.options.map((option, index) => {
                const votes = pollResults[option] || 0;
                const percentage = totalVotes === 0 ? 0 : (votes / totalVotes) * 100;
                return (
                  <div key={index} className="mb-2">
                    <p className="text-left text-gray-700 mb-1">{option}: <span className="font-semibold">{votes} votes</span> ({percentage.toFixed(1)}%)</p>
                    <div className="w-full bg-gray-200 rounded-full h-6">
                      <div
                        className="bg-green-500 h-6 rounded-full flex items-center justify-center text-white text-sm font-bold transition-all duration-500 ease-in-out"
                        style={{ width: `${percentage}%` }}
                      >
                        {percentage.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                );
              })}
              <p className="text-lg font-bold mt-4 text-gray-800">Total Votes: {totalVotes}</p>
            </div>
          ) : (
            <p className="text-gray-600">No votes yet.</p>
          )}
        </div>
      ) : (
        <div className="card bg-gray-50 p-6 rounded-lg shadow-sm">
          <p className="text-lg text-gray-600">No active poll. Please create a new one.</p>
        </div>
      )}

      <button
        onClick={handleNewPoll}
        disabled={pollActive && timeLeft > 0}
        className={`mt-8 py-3 px-8 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:-translate-y-1
          ${pollActive && timeLeft > 0 ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white font-bold'}`}
      >
        Ask New Question
      </button>
      {pollActive && timeLeft > 0 && <p className="text-red-600 mt-4 text-sm">Please wait for the current poll to end before asking a new question.</p>}

      {/* Chat Popup for Teacher */}
      <ChatPopup userRole="teacher" />
    </div>
  );
}

export default TeacherPollResult;
