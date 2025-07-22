const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);

// Configure CORS for Socket.io and Express
const io = socketIo(server, {
    cors: {
        origin: "http://localhost:5173", // Your frontend URL
        methods: ["GET", "POST"],
        credentials: true
    }
});

app.use(cors({
    origin: "http://localhost:5173", // Your frontend URL
    credentials: true
}));
app.use(express.json());

// Global state for the current poll
let currentPoll = null; // { id: string, question: string, options: string[], duration: number, startTime: number, endTime: number }
let studentAnswers = {}; // { studentId: { answer: string, timestamp: number, pollId: string } }
let pollResults = {}; // { option: count, ... }
let pollTimer = null; // Stores the setTimeout ID for the poll timer

// Global state for chat messages
let chatMessages = []; // { sender: string, message: string, timestamp: number }[]
const MAX_CHAT_HISTORY = 50; // Limit chat history to prevent excessive memory usage

io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    // Send current poll state and chat history to newly connected client
    if (currentPoll) {
        const timeLeft = Math.max(0, currentPoll.endTime - Date.now());
        socket.emit('currentPollState', {
            poll: currentPoll,
            results: pollResults,
            timeLeft: timeLeft
        });
    } else {
        socket.emit('waitingForPoll');
    }
    socket.emit('chatHistory', chatMessages); // Send existing chat history

    // Event listener for teacher to create a new poll
    socket.on('createPoll', (data) => {
        // Clear any existing timer if a poll was already active
        if (pollTimer) {
            clearTimeout(pollTimer);
            pollTimer = null;
        }

        // Reset poll state for the new poll
        studentAnswers = {};
        pollResults = {};

        const pollId = Date.now().toString();
        const startTime = Date.now();
        // Use the duration provided by the teacher, default to 60 seconds if not provided or invalid
        const durationSeconds = parseInt(data.duration, 10) || 60;
        const endTime = startTime + durationSeconds * 1000;

        currentPoll = {
            id: pollId,
            question: data.question,
            options: data.options,
            duration: durationSeconds, // Store the configured duration
            startTime: startTime,
            endTime: endTime
        };

        // Initialize poll results with 0 votes for each option
        data.options.forEach(option => {
            pollResults[option] = 0;
        });

        console.log('New poll created:', currentPoll);
        io.emit('newPoll', { poll: currentPoll, results: pollResults });

        // Start the poll timer
        pollTimer = setTimeout(() => {
            console.log('Poll timer ended for poll:', currentPoll.id);
            io.emit('pollEnded', { pollId: currentPoll.id, results: pollResults });
            currentPoll = null; // Mark poll as ended on the server
            pollTimer = null;
        }, durationSeconds * 1000);
    });

    // Event listener for student to submit an answer
    socket.on('submitAnswer', (data) => {
        const { pollId, answer, studentId } = data;

        if (!currentPoll || currentPoll.id !== pollId) {
            console.log('Attempted to answer an invalid or expired poll.');
            return;
        }

        if (studentAnswers[studentId] && studentAnswers[studentId].pollId === pollId) {
            console.log(`Student ${studentId} already answered this poll.`);
            return;
        }

        if (currentPoll.options.includes(answer)) {
            pollResults[answer]++;
            studentAnswers[studentId] = { answer: answer, timestamp: Date.now(), pollId: pollId };
            console.log(`Student ${studentId} answered: ${answer}. Current results:`, pollResults);
            io.emit('pollUpdate', { pollId: currentPoll.id, results: pollResults });
        } else {
            console.log('Invalid answer option:', answer);
        }
    });

    // Event listener for clients requesting the current poll state
    socket.on('requestPollState', () => {
        if (currentPoll) {
            const timeLeft = Math.max(0, currentPoll.endTime - Date.now());
            socket.emit('currentPollState', {
                poll: currentPoll,
                results: pollResults,
                timeLeft: timeLeft
            });
        } else {
            socket.emit('waitingForPoll');
        }
    });

    // --- Chat Functionality ---
    socket.on('sendMessage', (data) => {
        const { sender, message } = data;
        if (!sender || !message || message.trim() === '') {
            console.log('Invalid chat message received.');
            return;
        }
        const newMessage = { sender, message: message.trim(), timestamp: Date.now() };
        chatMessages.push(newMessage);
        // Keep chat history limited
        if (chatMessages.length > MAX_CHAT_HISTORY) {
            chatMessages = chatMessages.slice(chatMessages.length - MAX_CHAT_HISTORY);
        }
        console.log('New chat message:', newMessage);
        io.emit('receiveMessage', newMessage); // Broadcast to all clients
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));