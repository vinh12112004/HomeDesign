import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  viewMode: 'free',
  hoveredMesh: null,
  selectedMesh: null,
  showObjectEditor: false,
  showTranformControls: false,
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
    },
    openObjectEditor: (state) => {
      state.showObjectEditor = true;
    },
    openTransformControls: (state) => {
      state.showTranformControls = true;
    },
    closeObjectEditor: (state) => {
      state.selectedMesh = null;
      state.showObjectEditor = false;
    },
    closeTransformControls: (state) => {
      state.showTranformControls = false;
      state.selectedMesh = null;
    }
  },
});

export const { setViewMode, toggleViewMode, setHoveredMesh, setSelectedMesh, openObjectEditor, closeObjectEditor, openTransformControls, closeTransformControls } = uiSlice.actions;
export default uiSlice.reducer;