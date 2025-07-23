// src/features/teacher/teacherSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  activeStudents: [],
  pastPolls: [],
};

export const teacherSlice = createSlice({
  name: 'teacher',
  initialState,
  reducers: {
    setActiveStudents: (state, action) => {
      state.activeStudents = action.payload;
    },
    setPastPolls: (state, action) => {
      state.pastPolls = action.payload;
    },
  },
});

export const { setActiveStudents, setPastPolls } = teacherSlice.actions;

export default teacherSlice.reducer;
