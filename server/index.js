const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }
});

let currentPoll = null;
let answers = {};
let students = {};

io.on('connection', (socket) => {
  console.log('Connected:', socket.id);

  socket.on('registerStudent', (name) => {
    students[socket.id] = name;
  });

  socket.on('askQuestion', (poll) => {
    currentPoll = poll;
    answers = {};
    io.emit('newQuestion', poll);
  });

  socket.on('submitAnswer', (data) => {
    if (!answers[socket.id]) {
      answers[socket.id] = data;
      if (Object.keys(answers).length === Object.keys(students).length) {
        io.emit('pollResults', answers);
        currentPoll = null;
      }
    }
  });

  socket.on('getResults', () => {
    io.emit('pollResults', answers);
  });

  socket.on('disconnect', () => {
    delete students[socket.id];
    delete answers[socket.id];
  });
});

app.get('/', (req, res) => {
  res.send('Polling backend is running.');
});

server.listen(5000, () => console.log('Backend running on port 5000'));
