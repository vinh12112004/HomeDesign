import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  viewMode: 'free',
  hoveredMesh: null,
  selectedMesh: null,
  showObjectEditor: false,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setViewMode: (state, action) => {
      state.viewMode = action.payload;
    },
    toggleViewMode: (state) => {
      state.viewMode = state.viewMode === 'free' ? 'fixed' : 'free';
    },
    setHoveredMesh: (state, action) => {
      state.hoveredMesh = action.payload;
    },
    setSelectedMesh: (state, action) => {
      state.selectedMesh = action.payload;
      state.showObjectEditor = action.payload !== null;
    },
    closeObjectEditor: (state) => {
      state.selectedMesh = null;
      state.showObjectEditor = false;
    },
  },
});

export const { setViewMode, toggleViewMode, setHoveredMesh, setSelectedMesh, closeObjectEditor } = uiSlice.actions;
export default uiSlice.reducer;