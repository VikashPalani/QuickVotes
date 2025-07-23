import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import socket from '../utils/socket';
import ChatPopup from '../components/ChatPopup';
import PastPollsModal from '../components/PastPollsModal';
import { decrementTimeLeft } from '../utils/PollSlice';

function TeacherPollResult() {
  const { currentPoll, pollResults, timeLeft, pollActive } = useSelector((state) => state.poll);
  const { activeStudents } = useSelector((state) => state.teacher);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [isPastPollsModalOpen, setIsPastPollsModalOpen] = useState(false);

  useEffect(() => {
    socket.emit('requestPollState');

    let timerInterval;
    if (pollActive && timeLeft > 0) {
      timerInterval = setInterval(() => {
        dispatch(decrementTimeLeft());
      }, 1000);
    }

    return () => clearInterval(timerInterval);
  }, [pollActive, timeLeft, dispatch]);

  const handleNewPoll = () => {
    navigate('/teacher/create');
  };

  const handleViewPastPolls = () => {
    setIsPastPollsModalOpen(true);
    socket.emit('requestPastPolls');
  };

  const handleClosePastPollsModal = () => {
    setIsPastPollsModalOpen(false);
  };

  const totalVotes = Object.values(pollResults).reduce((sum, count) => sum + count, 0);

  return (
    <div className="container p-5 text-center">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Live Poll Results (Teacher View)</h1>

      {currentPoll ? (
        <div className="card bg-gray-50 p-6 rounded-lg shadow-sm mb-6">
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
        <div className="card bg-gray-50 p-6 rounded-lg shadow-sm mb-6">
          <p className="text-lg text-gray-600">No active poll. Please create a new one.</p>
        </div>
      )}

      <div className="flex justify-center gap-4 mt-8">
        <button
          onClick={handleNewPoll}
          disabled={pollActive && timeLeft > 0}
          className={`py-3 px-6 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:-translate-y-1
            ${pollActive && timeLeft > 0 ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white font-bold'}`}
        >
          Ask New Question
        </button>
        <button
          onClick={handleViewPastPolls}
          className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:-translate-y-1"
        >
          View Past Polls
        </button>
      </div>
      {pollActive && timeLeft > 0 && <p className="text-red-600 mt-4 text-sm">Please wait for the current poll to end before asking a new question.</p>}

      <ChatPopup userRole="teacher" />

      <PastPollsModal isOpen={isPastPollsModalOpen} onClose={handleClosePastPollsModal} />
    </div>
  );
}

export default TeacherPollResult;