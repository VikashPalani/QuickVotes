import { configureStore } from '@reduxjs/toolkit';
import pollReducer from './PollSlice';
import teacherReducer from './TeacherSlice';
import studentReducer from './StudentSlice';

export const store = configureStore({
  reducer: {
    poll: pollReducer,
    teacher: teacherReducer,
    student: studentReducer,
  },
});
