import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    viewMode: "free",
    hoveredMesh: null,
    selectedMesh: null,
    showObjectEditor: false,
    showTranformControls: false,
    showRoomDesigner2D: false,
    transformMode: "translate",
};

const uiSlice = createSlice({
    name: "ui",
    initialState,
    reducers: {
        setViewMode: (state, action) => {
            state.viewMode = action.payload;
        },
        toggleViewMode: (state) => {
            state.viewMode = state.viewMode === "free" ? "fixed" : "free";
        },
        setHoveredMesh: (state, action) => {
            state.hoveredMesh = action.payload;
        },
        setSelectedMesh: (state, action) => {
            state.selectedMesh = action.payload;
        },
        clearSelectedMesh: (state) => {
            state.selectedMesh = null;
            state.showObjectEditor = false;
            state.showTranformControls = false;
        },
        openObjectEditor: (state) => {
            state.showObjectEditor = true;
        },
        openTransformControls: (state, action) => {
            state.showTranformControls = true;
            state.transformMode = action.payload || "translate"; // Mặc định là "translate"
        },
        closeObjectEditor: (state) => {
            state.selectedMesh = null;
            state.showObjectEditor = false;
        },
        closeTransformControls: (state) => {
            state.showTranformControls = false;
            state.selectedMesh = null;
        },
        openRoomDesigner2D: (state) => {
            state.showRoomDesigner2D = true;
        },
        closeRoomDesigner2D: (state) => {
            state.showRoomDesigner2D = false;
        },
    },
});

export const {
    setViewMode,
    toggleViewMode,
    setHoveredMesh,
    setSelectedMesh,
    openObjectEditor,
    closeObjectEditor,
    openTransformControls,
    closeTransformControls,
    clearSelectedMesh,
    openRoomDesigner2D,
    closeRoomDesigner2D,
} = uiSlice.actions;
export default uiSlice.reducer;
