import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  currentPoll: null,
  pollResults: {},
  timeLeft: 0,
  pollActive: false,
  waitingForPoll: true,
};

export const pollSlice = createSlice({
  name: 'poll',
  initialState,
  reducers: {
    setNewPoll: (state, action) => {
      state.currentPoll = action.payload.poll;
      state.pollResults = action.payload.results;
      state.pollActive = true;
      state.waitingForPoll = false;
      state.timeLeft = Math.floor(Math.max(0, action.payload.poll.endTime - Date.now()) / 1000);
    },
    updatePollResults: (state, action) => {
      state.pollResults = action.payload.results;
    },
    endPoll: (state, action) => {
      state.pollResults = action.payload.results;
      state.currentPoll = null;
      state.pollActive = false;
      state.timeLeft = 0;
      state.waitingForPoll = true;
    },
    setCurrentPollState: (state, action) => {
      state.currentPoll = action.payload.poll;
      state.pollResults = action.payload.results;
      state.pollActive = true;
      state.waitingForPoll = false;
      state.timeLeft = Math.floor(action.payload.timeLeft / 1000);
    },
    setWaitingForPoll: (state) => {
      state.currentPoll = null;
      state.pollResults = {};
      state.pollActive = false;
      state.timeLeft = 0;
      state.waitingForPoll = true;
    },
    decrementTimeLeft: (state) => {
      if (state.timeLeft > 0) {
        state.timeLeft -= 1;
      }
      if (state.timeLeft === 0 && state.pollActive) {
        state.pollActive = false;
      }
    },
  },
});

export const {
  setNewPoll,
  updatePollResults,
  endPoll,
  setCurrentPollState,
  setWaitingForPoll,
  decrementTimeLeft,
} = pollSlice.actions;

export default pollSlice.reducer;