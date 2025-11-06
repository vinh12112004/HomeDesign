import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import assetApi from "../../api/services/assetApi";

// Fetch assets
// - For texture: returns string[]
// - For furniture: returns FurnitureModel[] with { objPath, mtlPath, texturePath, nameModel }
export const fetchAssets = createAsyncThunk(
    "assets/fetchAll",
    async ({ type }) => {
        const data = await assetApi.list(type);
        return { type, data };
    }
);

// Upload single file (legacy - mainly for textures)
export const uploadAsset = createAsyncThunk(
    "assets/upload",
    async ({ type, file }) => {
        const url = await assetApi.upload(type, file);
        return { type, url };
    }
);

// Upload complete furniture model (obj + mtl + texture + nameModel)
export const uploadFurnitureModel = createAsyncThunk(
    "assets/uploadFurnitureModel",
    async ({ objFile, mtlFile, textureFile, nameModel }) => {
        const model = await assetApi.uploadFurnitureModel({
            objFile,
            mtlFile,
            textureFile,
            nameModel,
        });
        return model;
    }
);

export const uploadOpeningModel = createAsyncThunk(
    "assets/uploadOpeningModel",
    async ({ objFile, mtlFile, textureFile, nameModel }) => {
        const model = await assetApi.uploadOpeningModel({
            objFile,
            mtlFile,
            textureFile,
            nameModel,
        });
        return model;
    }
);

const initial = () => ({
    texture: [],
    furniture: [],
    opening: [],
});

const assetSlice = createSlice({
    name: "assets",
    initialState: {
        items: initial(), // { texture: string[], furniture: FurnitureModel[] }
        loading: { texture: false, furniture: false },
        error: { texture: null, furniture: null },
    },
    reducers: {},
    extraReducers: (b) => {
        b
            // Fetch assets
            .addCase(fetchAssets.pending, (s, a) => {
                const t = a.meta.arg.type;
                s.loading[t] = true;
                s.error[t] = null;
            })
            .addCase(fetchAssets.fulfilled, (s, a) => {
                const { type, data } = a.payload;
                s.loading[type] = false;
                s.items[type] = data || [];
            })
            .addCase(fetchAssets.rejected, (s, a) => {
                const t = a.meta.arg.type;
                s.loading[t] = false;
                s.error[t] = a.error?.message || "Failed to load assets";
            })

            // Upload single asset (mainly for textures)
            .addCase(uploadAsset.fulfilled, (s, a) => {
                const { type, url } = a.payload || {};
                if (url && type === "texture") {
                    s.items.texture.unshift(url);
                }
            })

            // Upload furniture model
            .addCase(uploadFurnitureModel.pending, (s) => {
                s.loading.furniture = true;
                s.error.furniture = null;
            })
            .addCase(uploadFurnitureModel.fulfilled, (s, a) => {
                s.loading.furniture = false;
                if (a.payload) {
                    s.items.furniture.unshift(a.payload);
                }
            })
            .addCase(uploadFurnitureModel.rejected, (s, a) => {
                s.loading.furniture = false;
                s.error.furniture = a.error?.message || "Upload failed";
            })
            // Upload opening model
            .addCase(uploadOpeningModel.pending, (s) => {
                s.loading.opening = true;
                s.error.opening = null;
            })
            .addCase(uploadOpeningModel.fulfilled, (s, a) => {
                s.loading.opening = false;
                if (a.payload) {
                    s.items.opening.unshift(a.payload);
                }
            })
            .addCase(uploadOpeningModel.rejected, (s, a) => {
                s.loading.opening = false;
                s.error.opening = a.error?.message || "Upload failed";
            });
    },
});

export default assetSlice.reducer;
