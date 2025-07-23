import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import socket from '../utils/socket';
import { setPastPolls } from '../utils/TeacherSlice';

function PastPollsModal({ isOpen, onClose }) {
  const pastPolls = useSelector((state) => state.teacher.pastPolls);
  const dispatch = useDispatch();

  const [selectedPoll, setSelectedPoll] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      setError('');
      socket.emit('requestPastPolls');
      const handleError = (message) => {
        setError(message);
        setLoading(false);
      };
      socket.on('error', handleError);
      return () => {
        socket.off('error', handleError);
      };
    } else {
      setSelectedPoll(null);
      setError('');
      setLoading(false);
    }
  }, [isOpen, dispatch]);

  useEffect(() => {
    if (pastPolls.length > 0 && loading) {
      setLoading(false);
    }
  }, [pastPolls, loading]);


  const handlePollClick = (poll) => {
    setSelectedPoll(poll);
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-200 bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg h-[80vh] flex flex-col">
        <div className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white p-4 rounded-t-xl flex justify-between items-center">
          <h3 className="font-semibold text-xl">{selectedPoll ? 'Poll Details' : 'Past Poll Results'}</h3>
          <button onClick={onClose} className="text-white hover:text-gray-200 focus:outline-none">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
          {loading ? (
            <p className="text-center text-lg text-gray-600">Loading past polls...</p>
          ) : error ? (
            <p className="text-center text-lg text-red-600">Error: {error}</p>
          ) : selectedPoll ? (
            <div className="text-left">
              <h2 className="text-2xl font-semibold mb-3 text-gray-800">{selectedPoll.question}</h2>
              <p className="text-md text-gray-600 mb-1">Duration: {selectedPoll.duration} seconds</p>
              <p className="text-md text-gray-600 mb-4">Ended At: {formatTimestamp(selectedPoll.endedAt)}</p>
              <h3 className="text-xl font-semibold mb-3 text-gray-700">Final Results:</h3>
              {selectedPoll.finalResults && Object.keys(selectedPoll.finalResults).length > 0 ? (
                <div className="space-y-3">
                  {selectedPoll.options.map((option, index) => {
                    const votes = selectedPoll.finalResults[option] || 0;
                    const totalVotes = Object.values(selectedPoll.finalResults).reduce((sum, count) => sum + count, 0);
                    const percentage = totalVotes === 0 ? 0 : (votes / totalVotes) * 100;
                    return (
                      <div key={index} className="mb-2">
                        <p className="text-left text-gray-700 mb-1">{option}: <span className="font-semibold">{votes} votes</span> ({percentage.toFixed(1)}%)</p>
                        <div className="w-full bg-gray-200 rounded-full h-5">
                          <div
                            className="bg-green-500 h-5 rounded-full flex items-center justify-center text-white text-xs font-bold transition-all duration-500 ease-in-out"
                            style={{ width: `${percentage}%` }}
                          >
                            {percentage.toFixed(1)}%
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <p className="text-lg font-bold mt-4 text-gray-800">Total Votes: {Object.values(selectedPoll.finalResults).reduce((sum, count) => sum + count, 0)}</p>
                </div>
              ) : (
                <p className="text-gray-600">No results available for this poll.</p>
              )}
              <button
                onClick={() => setSelectedPoll(null)}
                className="mt-6 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-5 rounded-lg shadow-md transition duration-300"
              >
                Back to Past Polls List
              </button>
            </div>
          ) : (

            <div className="text-left">
              {pastPolls.length > 0 ? (
                <ul className="space-y-3">
                  {pastPolls.map((poll) => (
                    <li key={poll.id}
                        className="bg-gray-50 p-3 rounded-md border border-gray-200 cursor-pointer hover:bg-gray-100 transition duration-200 ease-in-out"
                        onClick={() => handlePollClick(poll)}>
                      <p className="font-semibold text-base text-gray-800 mb-1">{poll.question}</p>
                      <p className="text-xs text-gray-600">Ended: {formatTimestamp(poll.endedAt)}</p>
                      <p className="text-xs text-gray-600">Options: {poll.options.join(', ')}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-lg text-gray-600 text-center">No past polls found.</p>
              )}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-5 rounded-lg shadow-md transition duration-300"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default PastPollsModal;