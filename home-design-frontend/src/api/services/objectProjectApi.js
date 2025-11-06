import axiosClient from "../axiosClient";

const objectProjectApi = {
    getAll: (projectId) => {
        const url = `/ProjectObjects/${projectId}`;
        return axiosClient.get(url);
    },

    create: (projectId, objectData) => {
        const url = `/ProjectObjects/${projectId}`;
        return axiosClient.post(url, objectData);
    },

    update: (objectId, objectData) => {
        const url = `/ProjectObjects/${objectId}`;
        return axiosClient.put(url, objectData);
    },

    delete: (projectId, objectId) => {
        const url = `/ProjectObjects/${projectId}/${objectId}`;
        return axiosClient.delete(url);
    },

    getById: (projectId, objectId) => {
        const url = `/ProjectObjects/${projectId}/${objectId}`;
        return axiosClient.get(url);
    },
    createHole: (objectId, holeData) => {
        const url = `/ProjectObjects/${objectId}/createhole`;
        return axiosClient.post(url, holeData);
    },
};

export default objectProjectApi;
