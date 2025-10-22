import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import assetApi from '../../api/services/assetApi';

// payload: { type: 'texture'|'furniture' }
export const fetchAssets = createAsyncThunk('assets/fetchAll', async ({ type }) => {
  const urls = await assetApi.list(type);
  return { type, urls };
});

// payload: { type: 'texture'|'furniture', file: File }
export const uploadAsset = createAsyncThunk('assets/upload', async ({ type, file }) => {
  const url = await assetApi.upload(type, file);
  return { type, url };
});

const initial = () => ({ texture: [], furniture: [] });

const assetSlice = createSlice({
  name: 'assets',
  initialState: {
    items: initial(),           // { texture: string[], furniture: string[] }
    loading: { texture: false, furniture: false },
    error: { texture: null, furniture: null },
  },
  reducers: {},
  extraReducers: (b) => {
    b
      .addCase(fetchAssets.pending, (s, a) => {
        const t = a.meta.arg.type;
        s.loading[t] = true; s.error[t] = null;
      })
      .addCase(fetchAssets.fulfilled, (s, a) => {
        const { type, urls } = a.payload;
        s.loading[type] = false;
        s.items[type] = urls || [];
      })
      .addCase(fetchAssets.rejected, (s, a) => {
        const t = a.meta.arg.type;
        s.loading[t] = false; s.error[t] = a.error?.message || 'Failed to load assets';
      })
      .addCase(uploadAsset.fulfilled, (s, a) => {
        const { type, url } = a.payload || {};
        if (url) s.items[type].unshift(url);
      });
  },
});

export default assetSlice.reducer;