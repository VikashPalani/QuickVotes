import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { socket } from "../utils/socket";
import { useRef } from "react";

import ChatPopup from '../components/ChatPopup'; // Import the ChatPopup component

function StudentPolling() {
  const [studentName, setStudentName] = useState('');
  const [currentPoll, setCurrentPoll] = useState(null);
  const [pollResults, setPollResults] = useState({});
  const [hasAnswered, setHasAnswered] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [waitingForPoll, setWaitingForPoll] = useState(true);
  const [selectedOption, setSelectedOption] = useState(null);
  const navigate = useNavigate();

  const studentIdRef = useRef(sessionStorage.getItem('studentId') || crypto.randomUUID());

  useEffect(() => {
    const storedName = sessionStorage.getItem('studentName');
    if (!storedName) {
      navigate('/student');
      return;
    }
    setStudentName(storedName);

    if (!sessionStorage.getItem('studentId')) {
        sessionStorage.setItem('studentId', studentIdRef.current);
    }

    socket.emit('requestPollState');

    socket.on('newPoll', (data) => {
      console.log('Student: Received newPoll', data);
      setCurrentPoll(data.poll);
      setPollResults(data.results);
      setHasAnswered(false);
      setWaitingForPoll(false);
      setSelectedOption(null);
      const initialTimeLeft = Math.max(0, data.poll.endTime - Date.now());
      setTimeLeft(Math.floor(initialTimeLeft / 1000));

      sessionStorage.removeItem(`answeredPoll_${data.poll.id}`);
    });

    socket.on('pollUpdate', (data) => {
      console.log('Student: Received pollUpdate', data);
      if (currentPoll && data.pollId === currentPoll.id) {
        setPollResults(data.results);
      }
    });

    socket.on('pollEnded', (data) => {
      console.log('Student: Received pollEnded', data);
      if (currentPoll && data.pollId === currentPoll.id) {
        setPollResults(data.results);
        setTimeLeft(0);
        setHasAnswered(true);
      }
    });

    socket.on('currentPollState', (data) => {
      console.log('Student: Received currentPollState', data);
      setCurrentPoll(data.poll);
      setPollResults(data.results);
      setWaitingForPoll(false);
      const initialTimeLeft = Math.max(0, data.timeLeft);
      setTimeLeft(Math.floor(initialTimeLeft / 1000));

      const answeredPollId = sessionStorage.getItem(`answeredPoll_${data.poll.id}`);
      if (answeredPollId === data.poll.id || initialTimeLeft <= 0) {
        setHasAnswered(true);
      } else {
        setHasAnswered(false);
      }
    });

    socket.on('waitingForPoll', () => {
      console.log('Student: No active poll, waiting.');
      setCurrentPoll(null);
      setPollResults({});
      setHasAnswered(false);
      setWaitingForPoll(true);
      setTimeLeft(0);
      setSelectedOption(null);
    });

    return () => {
      socket.off('newPoll');
      socket.off('pollUpdate');
      socket.off('pollEnded');
      socket.off('currentPollState');
      socket.off('waitingForPoll');
    };
  }, [navigate, currentPoll]);

  useEffect(() => {
    let timerInterval;
    if (currentPoll && timeLeft > 0 && !hasAnswered) {
      timerInterval = setInterval(() => {
        setTimeLeft(prevTime => {
          if (prevTime <= 1) {
            clearInterval(timerInterval);
            setHasAnswered(true);
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    } else if (currentPoll && timeLeft === 0 && !hasAnswered) {
        setHasAnswered(true);
    }

    return () => clearInterval(timerInterval);
  }, [currentPoll, timeLeft, hasAnswered]);

  const handleSubmitAnswer = () => {
    if (currentPoll && selectedOption && !hasAnswered && timeLeft > 0) {
      socket.emit('submitAnswer', {
        pollId: currentPoll.id,
        answer: selectedOption,
        studentId: studentIdRef.current
      });
      setHasAnswered(true);
      sessionStorage.setItem(`answeredPoll_${currentPoll.id}`, currentPoll.id);
    }
  };

  const totalVotes = Object.values(pollResults).reduce((sum, count) => sum + count, 0);

  return (
    <div className="container p-5 text-center">
      <h1 className="text-3xl font-bold mb-4 text-gray-800">Live Poll (Student View)</h1>
      <p className="text-lg text-gray-600 mb-6">Hello, <span className="font-semibold text-blue-700">{studentName}</span>!</p>

      {waitingForPoll && (
        <div className="card bg-gray-50 p-6 rounded-lg shadow-sm">
          <p className="text-lg text-gray-600">Waiting for the teacher to start a new poll...</p>
        </div>
      )}

      {currentPoll && !waitingForPoll && (
        <div className="card bg-gray-50 p-6 rounded-lg shadow-sm">
          <h2 className="text-2xl font-semibold mb-4 text-gray-700">Question: {currentPoll.question}</h2>
          {timeLeft > 0 && !hasAnswered ? (
            <>
              <p className="text-xl font-medium mb-4 text-gray-600">Time Remaining: <span className="font-bold text-blue-600">{timeLeft}</span> seconds</p>
              <div className="flex flex-col gap-3 mt-5">
                {currentPoll.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedOption(option)}
                    className={`py-3 px-6 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:-translate-y-1
                      ${selectedOption === option ? 'bg-green-600 text-white' : 'bg-blue-500 hover:bg-blue-600 text-white'}`}
                  >
                    {option}
                  </button>
                ))}
              </div>
              <button
                onClick={handleSubmitAnswer}
                disabled={!selectedOption || hasAnswered}
                className={`mt-8 py-3 px-8 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:-translate-y-1
                  ${!selectedOption || hasAnswered ? 'bg-gray-400 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700 text-white font-bold'}`}
              >
                Submit Answer
              </button>
              {hasAnswered && <p className="text-red-600 mt-4 text-sm">You have submitted your answer.</p>}
            </>
          ) : (
            <>
              <h3 className="text-xl font-semibold mb-3 text-gray-700">Poll Ended / Results:</h3>
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
                <p className="text-gray-600">No votes yet for this poll.</p>
              )}
            </>
          )}
        </div>
      )}

      {/* Chat Popup for Student */}
      <ChatPopup userRole="student" userName={studentName} />
    </div>
  );
}

export default StudentPolling;