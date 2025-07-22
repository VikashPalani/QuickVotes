import { configureStore, createSlice } from '@reduxjs/toolkit';

const userSlice = createSlice({
  name: 'user',
  initialState: { name: '', role: '' },
  reducers: {
    setName: (state, action) => { state.name = action.payload },
    setRole: (state, action) => { state.role = action.payload },
  },
});

export const { setName, setRole } = userSlice.actions;

const store = configureStore({
  reducer: {
    user: userSlice.reducer,
  },
});

export default store;
