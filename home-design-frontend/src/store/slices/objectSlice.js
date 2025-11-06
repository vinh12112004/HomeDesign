import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import objectProjectApi from "../../api/services/objectProjectApi";

export const fetchObjects = createAsyncThunk(
    "objects/fetchObjects",
    async (projectId) => {
        const response = await objectProjectApi.getAll(projectId);
        return response;
    }
);

export const createObject = createAsyncThunk(
    "objects/createObject",
    async ({ projectId, objectData }) => {
        const response = await objectProjectApi.create(projectId, objectData);
        return response;
    }
);

export const updateObject = createAsyncThunk(
    "objects/update",
    async ({ objectId, objectData }) => {
        const response = await objectProjectApi.update(objectId, objectData);
        return response;
    }
);

export const deleteObject = createAsyncThunk(
    "objects/deleteObject",
    async ({ projectId, objectId }) => {
        await objectProjectApi.delete(projectId, objectId);
        return objectId;
    }
);

export const createHole = createAsyncThunk(
    "objects/createHole",
    async ({ objectId, holeData, projectId }) => {
        await objectProjectApi.createHole(objectId, holeData);
        const response = await objectProjectApi.getAll(projectId);
        return response;
    }
);

const initialState = {
    objects: [],
    loading: false,
    isCreating: false,
    isUpdating: false,
    isDeleting: false,
    error: null,
};

const objectSlice = createSlice({
    name: "objects",
    initialState,
    reducers: {
        clearObjects: (state) => {
            state.objects = [];
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchObjects.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchObjects.fulfilled, (state, action) => {
                state.loading = false;
                state.objects = action.payload;
            })
            .addCase(fetchObjects.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            })
            .addCase(createObject.fulfilled, (state, action) => {
                state.objects.push(action.payload);
            })
            .addCase(updateObject.fulfilled, (state, action) => {
                const index = state.objects.findIndex(
                    (obj) => obj.id === action.payload.id
                );
                if (index !== -1) {
                    state.objects[index] = action.payload;
                }
            })
            .addCase(deleteObject.fulfilled, (state, action) => {
                state.objects = state.objects.filter(
                    (obj) => obj.id !== action.payload
                );
            })
            .addCase(createHole.pending, (state) => {
                state.isCreatingHole = true;
            })
            .addCase(createHole.fulfilled, (state, action) => {
                state.isCreatingHole = false;
                state.objects = action.payload;
            })
            .addCase(createHole.rejected, (state, action) => {
                state.isCreatingHole = false;
                state.error = action.error.message;
            });
    },
});

export const { clearObjects } = objectSlice.actions;
export default objectSlice.reducer;
