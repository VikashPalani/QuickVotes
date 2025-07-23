const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);

const io = socketIo(server, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"],
        credentials: true
    }
});

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}));
app.use(express.json());

let currentPoll = null;
let studentAnswers = {};
let pollResults = {};
let pollTimer = null;

let chatMessages = [];
const MAX_CHAT_HISTORY = 50;

let pastPolls = [];
const MAX_PAST_POLLS = 20;

let activeStudents = {};
let studentIdToSocketIdMap = {};

io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

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
    socket.emit('chatHistory', chatMessages);
    socket.on('studentJoined', ({ studentId, studentName }) => {
        if (!activeStudents[socket.id]) {
            activeStudents[socket.id] = { studentId, name: studentName };
            studentIdToSocketIdMap[studentId] = socket.id;
            console.log(`Student ${studentName} (${studentId}) joined. Total active: ${Object.keys(activeStudents).length}`);
            io.emit('activeStudentsUpdate', Object.values(activeStudents));
        }
    });

    socket.on('createPoll', (data) => {
        if (pollTimer) {
            clearTimeout(pollTimer);
            pollTimer = null;
        }

        studentAnswers = {};
        pollResults = {};

        const pollId = Date.now().toString();
        const startTime = Date.now();
        const durationSeconds = parseInt(data.duration, 10) || 60;
        const endTime = startTime + durationSeconds * 1000;

        currentPoll = {
            id: pollId,
            question: data.question,
            options: data.options,
            duration: durationSeconds,
            startTime: startTime,
            endTime: endTime,
        };

        data.options.forEach(option => {
            pollResults[option] = 0;
        });

        console.log('New poll created:', currentPoll);
        io.emit('newPoll', { poll: currentPoll, results: pollResults });

        pollTimer = setTimeout(() => {
            console.log('Poll timer ended for poll:', currentPoll.id);
            io.emit('pollEnded', { pollId: currentPoll.id, results: pollResults });

            const completedPoll = {
                ...currentPoll,
                finalResults: pollResults,
                endedAt: Date.now()
            };
            pastPolls.unshift(completedPoll);
            if (pastPolls.length > MAX_PAST_POLLS) {
                pastPolls = pastPolls.slice(0, MAX_PAST_POLLS);
            }
            console.log('Poll results saved to in-memory history:', completedPoll.id);

            currentPoll = null;
            pollTimer = null;
        }, durationSeconds * 1000);
    });

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

    socket.on('sendMessage', (data) => {
        const { sender, message } = data;
        if (!sender || !message || message.trim() === '') {
            console.log('Invalid chat message received.');
            return;
        }
        const newMessage = { sender, message: message.trim(), timestamp: Date.now() };
        chatMessages.push(newMessage);
        if (chatMessages.length > MAX_CHAT_HISTORY) {
            chatMessages = chatMessages.slice(chatMessages.length - MAX_CHAT_HISTORY);
        }
        console.log('New chat message:', newMessage);
        io.emit('receiveMessage', newMessage);
    });

    socket.on('kickStudent', (studentIdToKick) => {
        console.log(`Teacher requested to kick student: ${studentIdToKick}`);
        const targetSocketId = studentIdToSocketIdMap[studentIdToKick];
        if (targetSocketId && io.sockets.sockets.has(targetSocketId)) {
            io.to(targetSocketId).emit('youWereKicked');
            console.log(`Emitted 'youWereKicked' to ${studentIdToKick}`);

            if (activeStudents[targetSocketId]) {
                delete activeStudents[targetSocketId];
                delete studentIdToSocketIdMap[studentIdToKick];
                io.emit('activeStudentsUpdate', Object.values(activeStudents));
            }
        } else {
            console.log(`Student ${studentIdToKick} not found or already disconnected.`);
        }
    });

    socket.on('requestPastPolls', () => {
        console.log('Sending past polls list to client. Count:', pastPolls.length);
        socket.emit('pastPollsList', pastPolls);
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
        const studentInfo = activeStudents[socket.id];
        if (studentInfo) {
            delete activeStudents[socket.id];
            delete studentIdToSocketIdMap[studentInfo.studentId];
            console.log(`Student ${studentInfo.name} (${studentInfo.studentId}) disconnected. Active students: ${Object.keys(activeStudents).length}`);
            io.emit('activeStudentsUpdate', Object.values(activeStudents));
        }
    });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));