import axiosClient from "../axiosClient";

// type: 'texture' | 'furniture'
const assetApi = {
    list: async (type) => {
        const path =
            type === "furniture" ? "/Assets/furnitures" : "/Assets/textures";
        const res = await axiosClient.get(path);
        const arr = Array.isArray(res) ? res : res?.data || [];
        if (type === "furniture") {
            return arr.filter((it) => it && typeof it === "object");
        }
        return arr
            .map((it) => (typeof it === "string" ? it : it?.url))
            .filter(Boolean);
    },
    upload: async (type, file) => {
        const form = new FormData();
        form.append("file", file);
        const path =
            type === "furniture"
                ? "/Assets/upload/furniture"
                : "/Assets/upload/texture";
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
        form.append("mtlFile", mtlFile);
        form.append("textureFile", textureFile);
        form.append("nameModel", nameModel);
        const res = await axiosClient.post("/Assets/upload/furniture", form, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        return res?.data ?? res;
    },
};

export default assetApi;
