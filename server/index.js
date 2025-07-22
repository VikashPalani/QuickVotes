const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*", // Adjust in prod
    methods: ["GET", "POST"],
  },
});

const PORT = process.env.PORT || 5000;

// In-memory data (can replace with DB later)
let currentPoll = null; // { question, options, correctOption, timeLimit, startedAt }
let students = {}; // { socketId: { name, answered: false, answer: null } }
let pollAnswers = {}; // { optionIndex: count }

// Helper: Check if all students answered current poll
const allAnswered = () => {
  if (!currentPoll) return true;
  return Object.values(students).every((s) => s.answered);
};

io.on("connection", (socket) => {
  console.log(`New connection: ${socket.id}`);

  // Student joins with name
  socket.on("student_join", (name, callback) => {
    if (!name) return callback({ success: false, message: "Name required" });

    // Check if name is unique in current students
    const nameExists = Object.values(students).some(
      (s) => s.name === name
    );
    if (nameExists) {
      return callback({ success: false, message: "Name already taken" });
    }

    students[socket.id] = { name, answered: false, answer: null };
    callback({ success: true, currentPoll });

    // Inform teacher and students of updated participants if needed
    io.emit("students_update", Object.values(students).map(s => s.name));
  });

  // Teacher tries to create a new poll
  socket.on("teacher_create_poll", (pollData, callback) => {
    /*
      pollData = {
        question: string,
        options: string[],
        correctOption: number (index),
        timeLimit: number (seconds)
      }
    */

    if (currentPoll && !allAnswered()) {
      return callback({
        success: false,
        message:
          "Cannot create new poll until current poll is answered by all students",
      });
    }

    // Reset poll answers
    pollAnswers = {};
    pollData.options.forEach((_, idx) => {
      pollAnswers[idx] = 0;
    });

    // Save current poll and mark all students unanswered
    currentPoll = {
      ...pollData,
      startedAt: Date.now(),
    };
    for (const s of Object.values(students)) {
      s.answered = false;
      s.answer = null;
    }

    io.emit("new_poll", currentPoll);
    callback({ success: true });

    // Setup timer to end poll automatically
    setTimeout(() => {
      io.emit("poll_ended", pollAnswers);
      currentPoll = null;
    }, pollData.timeLimit * 1000);
  });

  // Student submits answer
  socket.on("student_answer", (optionIndex, callback) => {
    if (!currentPoll) {
      return callback({ success: false, message: "No active poll" });
    }

    const student = students[socket.id];
    if (!student) {
      return callback({ success: false, message: "Student not registered" });
    }

    if (student.answered) {
      return callback({ success: false, message: "Already answered" });
    }

    // Register answer
    student.answered = true;
    student.answer = optionIndex;

    pollAnswers[optionIndex] = (pollAnswers[optionIndex] || 0) + 1;

    // Notify teacher and students of live results
    io.emit("poll_update", pollAnswers);

    callback({ success: true });

    // If all answered early, end poll early
    if (allAnswered()) {
      io.emit("poll_ended", pollAnswers);
      currentPoll = null;
    }
  });

  // Teacher kicks a student (bonus)
  socket.on("teacher_kick_student", (studentName, callback) => {
    // Find student socketId by name
    const entry = Object.entries(students).find(
      ([id, s]) => s.name === studentName
    );
    if (!entry) return callback({ success: false, message: "Student not found" });

    const [kickSocketId] = entry;
    // Disconnect kicked student
    io.to(kickSocketId).emit("kicked");
    io.sockets.sockets.get(kickSocketId)?.disconnect(true);

    delete students[kickSocketId];
    io.emit("students_update", Object.values(students).map(s => s.name));

    callback({ success: true });
  });

  // On disconnect cleanup
  socket.on("disconnect", () => {
    if (students[socket.id]) {
      delete students[socket.id];
      io.emit("students_update", Object.values(students).map(s => s.name));
    }
    console.log(`Disconnected: ${socket.id}`);
  });
});

// Basic health check route
app.get("/", (req, res) => {
  res.send("Live Polling System Backend Running");
});

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
