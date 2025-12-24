import { createSlice } from "@reduxjs/toolkit";

const undoSlice = createSlice({
    name: "undo",
    initialState: {
        undoStack: [],
        redoStack: [],
    },
    reducers: {
        pushAction(state, action) {
            state.undoStack.push(action.payload);
            state.redoStack = []; // có action mới → clear redo
        },

        undo(state) {
            if (state.undoStack.length === 0) return;
            const action = state.undoStack.pop();
            state.redoStack.push(action);
        },

        redo(state) {
            if (state.redoStack.length === 0) return;
            const action = state.redoStack.pop();
            state.undoStack.push(action);
        },

        clearHistory(state) {
            state.undoStack = [];
            state.redoStack = [];
        },
    },
});

export const { pushAction, undo, redo, clearHistory } = undoSlice.actions;
export default undoSlice.reducer;

export const isObjectChanged = (cur, orig) => {
    return (
        cur.positionJson !== orig.positionJson ||
        cur.rotationJson !== orig.rotationJson ||
        cur.scaleJson !== orig.scaleJson ||
        cur.metadataJson !== orig.metadataJson
    );
};
