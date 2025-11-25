import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import projectApi from "../../api/services/projectApi";

// Async thunks
export const fetchProjects = createAsyncThunk(
    "projects/fetchProjects",
    async (params = {}) => {
        const response = await projectApi.getAll(params);
        return response;
    }
);

export const createProject = createAsyncThunk(
    "projects/createProject",
    async (projectData) => {
        const response = await projectApi.createProject(projectData);
        return response;
    }
);

export const deleteProject = createAsyncThunk(
    "projects/deleteProject",
    async (projectId) => {
        await projectApi.deleteProject(projectId);
        return projectId;
    }
);
export const addRoom = createAsyncThunk(
    "projects/addRoom",
    async ({ projectId, roomData }) => {
        const response = await projectApi.addRoom(projectId, roomData);
        return response;
    }
);

const initialState = {
    projects: [],
    currentProject: null,
    loading: false,
    isCreating: false,
    isDeleting: false,
    isAddingRoom: false,
    error: null,
};

const projectSlice = createSlice({
    name: "projects",
    initialState,
    reducers: {
        setCurrentProject: (state, action) => {
            state.currentProject = action.payload;
        },
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch projects
            .addCase(fetchProjects.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchProjects.fulfilled, (state, action) => {
                state.loading = false;
                state.projects = action.payload;
            })
            .addCase(fetchProjects.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            })
            // Create project
            .addCase(createProject.pending, (state) => {
                state.isCreating = true;
                state.error = null;
            })
            .addCase(createProject.fulfilled, (state, action) => {
                state.isCreating = false;
                state.projects.push(action.payload);
            })
            .addCase(createProject.rejected, (state, action) => {
                state.isCreating = false;
                state.error = action.error.message;
            })
            // Delete project
            .addCase(deleteProject.pending, (state) => {
                state.isDeleting = true;
                state.error = null;
            })
            .addCase(deleteProject.fulfilled, (state, action) => {
                state.isDeleting = false;
                state.projects = state.projects.filter(
                    (p) => p.id !== action.payload
                );
            })
            .addCase(deleteProject.rejected, (state, action) => {
                state.isDeleting = false;
                state.error = action.error.message;
            })
            // Add room
            .addCase(addRoom.pending, (state) => {
                state.isAddingRoom = true;
                state.error = null;
            })
            .addCase(addRoom.fulfilled, (state, action) => {
                state.isAddingRoom = false;
            })
            .addCase(addRoom.rejected, (state, action) => {
                state.isAddingRoom = false;
                state.error = action.error.message;
            });
    },
});

export const { setCurrentProject, clearError } = projectSlice.actions;
export default projectSlice.reducer;
