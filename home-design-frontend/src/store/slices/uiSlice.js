import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    viewMode: "free",
    hoveredMesh: null,
    selectedMesh: null,
    showObjectEditor: false,
    showTranformControls: false,
    showAddRoom2D: false,
    showMoveRoom2D: false,
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
        openAddRoom2D: (state) => {
            state.showAddRoom2D = true;
        },
        closeAddRoom2D: (state) => {
            state.showAddRoom2D = false;
        },
        openMoveRoom2D: (state) => {
            state.showMoveRoom2D = true;
        },
        closeMoveRoom2D: (state) => {
            state.showMoveRoom2D = false;
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
    openAddRoom2D,
    closeAddRoom2D,
    openMoveRoom2D,
    closeMoveRoom2D,
} = uiSlice.actions;
export default uiSlice.reducer;
