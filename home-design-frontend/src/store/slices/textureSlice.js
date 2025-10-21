import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import textureApi from '../../api/services/textureApi';

export const fetchTextures = createAsyncThunk('textures/fetchAll', async () => {
  return await textureApi.list(); // string[]
});

export const uploadTexture = createAsyncThunk('textures/upload', async (file) => {
  return await textureApi.upload(file); // string (url)
});

const textureSlice = createSlice({
  name: 'textures',
  initialState: {
    items: /** @type {string[]} */ ([]), // chỉ lưu URL
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTextures.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTextures.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload || [];
      })
      .addCase(fetchTextures.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error?.message || 'Failed to load textures';
      })
      .addCase(uploadTexture.fulfilled, (state, action) => {
        if (action.payload) state.items.unshift(action.payload); // thêm url mới
      });
  },
});

export default textureSlice.reducer;