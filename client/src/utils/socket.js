import { io } from 'socket.io-client';
import { store } from './store';
import { setNewPoll, updatePollResults, endPoll, setCurrentPollState, setWaitingForPoll, decrementTimeLeft } from '../utils/PollSlice';
import { setActiveStudents, setPastPolls } from '../utils/TeacherSlice';
import { resetStudentStateForNewPoll } from '../utils/StudentSlice';

const SOCKET_SERVER_URL = 'http://localhost:5000';

const socket = io(SOCKET_SERVER_URL, {
  withCredentials: true,
});

socket.on('connect', () => {
  console.log('Connected to Socket.IO server:', socket.id);
});

socket.on('disconnect', () => {
  console.log('Disconnected from Socket.IO server');
});

socket.on('connect_error', (err) => {
  console.error('Socket.IO connection error:', err.message);
});

socket.on('newPoll', (data) => {
  console.log('Received newPoll', data);
  store.dispatch(setNewPoll(data));
  store.dispatch(resetStudentStateForNewPoll());
});

socket.on('pollUpdate', (data) => {
  console.log('Received pollUpdate', data);
  store.dispatch(updatePollResults(data));
});

socket.on('pollEnded', (data) => {
  console.log('Received pollEnded', data);
  store.dispatch(endPoll(data));
});

socket.on('currentPollState', (data) => {
  console.log('Received currentPollState', data);
  store.dispatch(setCurrentPollState(data));
});

socket.on('waitingForPoll', () => {
  console.log('Received waitingForPoll');
  store.dispatch(setWaitingForPoll());
});

socket.on('activeStudentsUpdate', (students) => {
  console.log('Received activeStudentsUpdate', students);
  store.dispatch(setActiveStudents(students));
});

socket.on('pastPollsList', (polls) => {
  console.log('Received pastPollsList', polls);
  store.dispatch(setPastPolls(polls));
});

socket.on('youWereKicked', () => {
  console.log('You were kicked by the teacher!');
  sessionStorage.removeItem('studentName');
  sessionStorage.removeItem('studentId');
  alert('You have been kicked by the teacher!');
  window.location.href = '/';
});

export default socket;