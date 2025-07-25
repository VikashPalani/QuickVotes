import React, { useState, useEffect, useRef } from 'react';
import socket from '../utils/socket';

function ChatPopup({ userRole, userName }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    socket.on('receiveMessage', (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    socket.on('chatHistory', (history) => {
      setMessages(history);
    });

    return () => {
      socket.off('receiveMessage');
      socket.off('chatHistory');
    };
  }, []);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim()) {
      const sender = userName || (userRole === 'teacher' ? 'Teacher' : 'Student');
      socket.emit('sendMessage', { sender, message: newMessage.trim() });
      setNewMessage('');
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 bg-purple-600 hover:bg-purple-700 text-white p-4 rounded-full shadow-lg transition-all duration-300 ease-in-out transform hover:scale-110 focus:outline-none focus:ring-4 focus:ring-purple-300 z-50"
        aria-label="Toggle Chat"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      </button>

      {isOpen && (
        <div className="fixed bottom-20 right-4 w-80 h-96 bg-white rounded-lg shadow-xl flex flex-col z-50 border border-gray-200">
          <div className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white p-3 rounded-t-lg flex justify-between items-center">
            <h3 className="font-semibold text-lg">Live Chat</h3>
            <button onClick={() => setIsOpen(false)} className="text-white hover:text-gray-200 focus:outline-none">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="flex-1 p-3 overflow-y-auto space-y-2 bg-gray-50">
            {messages.length === 0 ? (
              <p className="text-gray-500 text-center text-sm mt-4">No messages yet. Say hello!</p>
            ) : (
              messages.map((msg, index) => (
                <div key={index} className="flex items-start">
                  <span className="font-bold text-sm text-purple-700 mr-2">{msg.sender}:</span>
                  <p className="text-gray-800 text-sm break-words">{msg.message}</p>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSendMessage} className="p-3 border-t border-gray-200 bg-white">
            <div className="flex">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-purple-400 text-sm"
              />
              <button
                type="submit"
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-r-lg font-semibold transition duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-purple-400"
              >
                Send
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}

export default ChatPopup;