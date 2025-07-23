// src/features/student/studentSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  studentName: '',
  hasAnswered: false,
  selectedOption: null,
};

export const studentSlice = createSlice({
  name: 'student',
  initialState,
  reducers: {
    setStudentName: (state, action) => {
      state.studentName = action.payload;
    },
    setHasAnswered: (state, action) => {
      state.hasAnswered = action.payload;
    },
    setSelectedOption: (state, action) => {
      state.selectedOption = action.payload;
    },
    resetStudentStateForNewPoll: (state) => {
      state.hasAnswered = false;
      state.selectedOption = null;
    }
  },
});

export const { setStudentName, setHasAnswered, setSelectedOption, resetStudentStateForNewPoll } = studentSlice.actions;

export default studentSlice.reducer;