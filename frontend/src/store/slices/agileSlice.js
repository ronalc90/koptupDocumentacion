import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import agileService from '../../services/agileService';

const initialState = {
  epics: [],
  userStories: [],
  tasks: [],
  isLoading: false,
  error: null,
};

export const fetchEpics = createAsyncThunk(
  'agile/fetchEpics',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const response = await agileService.getEpics(filters);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  }
);

export const fetchUserStories = createAsyncThunk(
  'agile/fetchUserStories',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const response = await agileService.getUserStories(filters);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  }
);

export const fetchTasks = createAsyncThunk(
  'agile/fetchTasks',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const response = await agileService.getTasks(filters);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  }
);

export const createEpic = createAsyncThunk(
  'agile/createEpic',
  async (epicData, { rejectWithValue }) => {
    try {
      const response = await agileService.createEpic(epicData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  }
);

export const createUserStory = createAsyncThunk(
  'agile/createUserStory',
  async (userStoryData, { rejectWithValue }) => {
    try {
      const response = await agileService.createUserStory(userStoryData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  }
);

export const createTask = createAsyncThunk(
  'agile/createTask',
  async (taskData, { rejectWithValue }) => {
    try {
      const response = await agileService.createTask(taskData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  }
);

const agileSlice = createSlice({
  name: 'agile',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchEpics.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchEpics.fulfilled, (state, action) => {
        state.isLoading = false;
        state.epics = action.payload.results || action.payload;
      })
      .addCase(fetchEpics.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(createEpic.fulfilled, (state, action) => {
        state.epics.push(action.payload);
      })
      .addCase(fetchUserStories.fulfilled, (state, action) => {
        state.userStories = action.payload.results || action.payload;
      })
      .addCase(createUserStory.fulfilled, (state, action) => {
        state.userStories.push(action.payload);
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.tasks = action.payload.results || action.payload;
      })
      .addCase(createTask.fulfilled, (state, action) => {
        state.tasks.push(action.payload);
      });
  },
});

export default agileSlice.reducer;
