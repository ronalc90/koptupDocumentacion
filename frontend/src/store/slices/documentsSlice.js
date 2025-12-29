import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import documentService from '../../services/documentService';

const initialState = {
  documents: [],
  currentDocument: null,
  isLoading: false,
  error: null,
};

export const fetchDocuments = createAsyncThunk(
  'documents/fetchAll',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const response = await documentService.getAll(filters);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  }
);

export const fetchDocumentById = createAsyncThunk(
  'documents/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await documentService.getById(id);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  }
);

export const createDocument = createAsyncThunk(
  'documents/create',
  async (documentData, { rejectWithValue }) => {
    try {
      const response = await documentService.create(documentData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  }
);

export const updateDocument = createAsyncThunk(
  'documents/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await documentService.update(id, data);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  }
);

const documentsSlice = createSlice({
  name: 'documents',
  initialState,
  reducers: {
    clearCurrentDocument: (state) => {
      state.currentDocument = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDocuments.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchDocuments.fulfilled, (state, action) => {
        state.isLoading = false;
        state.documents = action.payload.results || action.payload;
      })
      .addCase(fetchDocuments.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchDocumentById.fulfilled, (state, action) => {
        state.currentDocument = action.payload;
      })
      .addCase(createDocument.fulfilled, (state, action) => {
        state.documents.push(action.payload);
      })
      .addCase(updateDocument.fulfilled, (state, action) => {
        state.currentDocument = action.payload;
      });
  },
});

export const { clearCurrentDocument } = documentsSlice.actions;
export default documentsSlice.reducer;
