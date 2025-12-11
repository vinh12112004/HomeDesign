import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import roomApi from "../../api/services/roomApi";

// GET rooms by projectId
export const fetchRoomsByProject = createAsyncThunk(
    "rooms/fetchRoomsByProject",
    async (projectId) => {
        const response = await roomApi.getByProject(projectId);
        return response;
    }
);

const initialState = {
    rooms: [],
    loading: false,
    error: null,
};

const roomSlice = createSlice({
    name: "rooms",
    initialState,
    reducers: {
        clearRoomError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchRoomsByProject.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchRoomsByProject.fulfilled, (state, action) => {
                state.loading = false;
                state.rooms = action.payload;
            })
            .addCase(fetchRoomsByProject.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            });
    },
});

export const { clearRoomError } = roomSlice.actions;
export default roomSlice.reducer;
