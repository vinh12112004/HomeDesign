import axiosClient from "../axiosClient";

// type: 'texture' | 'furniture' | 'opening'
const assetApi = {
    list: async (type) => {
        let path = "/Assets/textures";

        if (type === "furniture") path = "/Assets/furnitures";
        else if (type === "opening") path = "/Assets/openings";

        const res = await axiosClient.get(path);
        const arr = Array.isArray(res) ? res : res?.data || [];

        if (type === "furniture" || type === "opening") {
            // các loại model (object)
            return arr.filter((it) => it && typeof it === "object");
        }

        // texture (string URL)
        return arr
            .map((it) => (typeof it === "string" ? it : it?.url))
            .filter(Boolean);
    },

    upload: async (type, file) => {
        const form = new FormData();
        form.append("file", file);

        let path = "/Assets/upload/texture";
        if (type === "furniture") path = "/Assets/upload/furniture";
        else if (type === "opening") path = "/Assets/upload/opening";

        const res = await axiosClient.post(path, form, {
            headers: { "Content-Type": "multipart/form-data" },
        });

        const data = res?.data ?? res;
        return typeof data === "string" ? data : data?.url;
    },

    uploadFurnitureModel: async ({
        objFile,
        mtlFile,
        textureFile,
        nameModel,
    }) => {
        const form = new FormData();
        form.append("objFile", objFile);
        if (mtlFile) form.append("mtlFile", mtlFile);
        if (textureFile) form.append("textureFile", textureFile);
        form.append("nameModel", nameModel);

        const res = await axiosClient.post("/Assets/upload/furniture", form, {
            headers: { "Content-Type": "multipart/form-data" },
        });

        return res?.data ?? res;
    },

    // Upload opening model (giống furniture)
    uploadOpeningModel: async ({
        objFile,
        mtlFile,
        textureFile,
        nameModel,
    }) => {
        const form = new FormData();
        form.append("objFile", objFile);
        if (mtlFile) form.append("mtlFile", mtlFile);
        if (textureFile) form.append("textureFile", textureFile);
        form.append("nameModel", nameModel);

        const res = await axiosClient.post("/Assets/upload/opening", form, {
            headers: { "Content-Type": "multipart/form-data" },
        });

        return res?.data ?? res;
    },
};

export default assetApi;
