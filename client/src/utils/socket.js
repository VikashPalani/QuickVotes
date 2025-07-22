import { io } from 'socket.io-client';
const SOCKET_SERVER_URL = 'http://localhost:5000'; // <--- CHANGED: Point to port 5000

export const socket = io(SOCKET_SERVER_URL, {
  withCredentials: true, // Keep this if you need it for cookies/auth, otherwise it can be removed
});

// Optional: Add some basic logging for debugging
socket.on('connect', () => {
  console.log('Connected to Socket.IO server');
});

socket.on('disconnect', () => {
  console.log('Disconnected from Socket.IO server');
});

socket.on('connect_error', (err) => {
  console.error('Socket.IO connection error:', err.message);
});