import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { socket } from '../utils/socket';

function TeacherCreatePoll() {
  const [question, setQuestion] = useState('');
  // Initialize with two empty options as a minimum requirement
  const [options, setOptions] = useState(['', '']);
  const [pollDuration, setPollDuration] = useState(60);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Handler for updating an individual option's text
  const handleOptionChange = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  // Handler for adding a new empty option field
  const handleAddOption = () => {
    // Limit maximum options if desired, e.g., 6 or 8
    if (options.length < 8) { // Example limit
      setOptions([...options, '']);
      setError(''); // Clear error if adding after a validation error
    } else {
      setError('Maximum 8 options allowed.');
    }
  };

  // Handler for removing an option field
  const handleRemoveOption = (indexToRemove) => {
    // Ensure at least two options remain
    if (options.length > 2) {
      setOptions(options.filter((_, index) => index !== indexToRemove));
      setError(''); // Clear error if removing after a validation error
    } else {
      setError('A poll must have at least two options.');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    // Filter out any empty options before sending to the server
    const validOptions = options.filter(opt => opt.trim() !== '');
    const duration = parseInt(pollDuration, 10);

    if (!question.trim()) {
      setError('Please enter a question.');
      return;
    }
    if (validOptions.length < 2) {
      setError('Please provide at least two options.');
      return;
    }
    if (isNaN(duration) || duration <= 0) {
      setError('Please enter a valid poll duration (a positive number in seconds).');
      return;
    }

    // Emit the new poll data including duration and filtered options
    socket.emit('createPoll', { question, options: validOptions, duration });

    navigate('/teacher/result');
  };

  return (
    // Adjusted padding and vertical spacing for a more compact look
    <div className="container p-4 text-center h-full overflow-hidden flex flex-col">
      <h1 className="text-3xl font-extrabold mb-6 text-gray-900">Create New Poll</h1>
      <form onSubmit={handleSubmit} className="space-y-6 flex-1 flex flex-col justify-between">
        {/* Scrollable content area for sections */}
        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar"> {/* Added custom-scrollbar for aesthetics */}
          {/* Poll Question Section */}
          <div className="bg-white p-5 rounded-xl shadow-lg border border-gray-200 mb-6">
            <label htmlFor="question" className="block text-lg font-semibold text-gray-800 mb-2 text-left">Poll Question:</label>
            <input
              type="text"
              id="question"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="e.g., What is your favorite programming language?"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-base focus:ring-blue-500 focus:border-blue-500 shadow-sm transition duration-200"
            />
          </div>

          {/* Options Section */}
          <div className="bg-white p-5 rounded-xl shadow-lg border border-gray-200 mb-6">
            <label className="block text-lg font-semibold text-gray-800 mb-2 text-left">Options:</label>
            <div className="space-y-3"> {/* Reduced vertical space between options */}
              {options.map((option, index) => (
                <div key={index} className="flex items-center gap-2"> {/* Reduced gap */}
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    placeholder={`Option ${index + 1}`}
                    required={index < 2}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-base focus:ring-blue-500 focus:border-blue-500 shadow-sm transition duration-200"
                  />
                  {options.length > 2 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveOption(index)}
                      className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-full shadow-md transition duration-200 ease-in-out transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-red-300"
                      aria-label={`Remove Option ${index + 1}`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={handleAddOption}
              className="mt-4 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-5 rounded-full shadow-md transition duration-300 ease-in-out transform hover:-translate-y-1 focus:outline-none focus:ring-4 focus:ring-purple-300"
            >
              Add Option
            </button>
          </div>

          {/* Poll Duration Section */}
          <div className="bg-white p-5 rounded-xl shadow-lg border border-gray-200 mb-6">
            <label htmlFor="pollDuration" className="block text-lg font-semibold text-gray-800 mb-2 text-left">Poll Duration (seconds):</label>
            <input
              type="number"
              id="pollDuration"
              value={pollDuration}
              onChange={(e) => setPollDuration(e.target.value)}
              placeholder="e.g., 60"
              min="10"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-base focus:ring-blue-500 focus:border-blue-500 shadow-sm transition duration-200"
            />
          </div>
        </div>

        {/* Error Message and Submit Button (fixed at bottom) */}
        <div className="mt-auto pt-4"> {/* Use mt-auto to push to bottom */}
          {error && <p className="text-red-600 font-medium mb-4 text-sm">{error}</p>}
          <button
            type="submit"
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-full shadow-xl transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-green-300"
          >
            Start Poll
          </button>
        </div>
      </form>
    </div>
  );
}

export default TeacherCreatePoll;