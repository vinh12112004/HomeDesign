import axiosClient from "../axiosClient";

const roomApi = {
    // GET: api/rooms/project/{projectId}
    getByProject: (projectId) => {
        const url = `/rooms/project/${projectId}`;
        return axiosClient.get(url);
    },
};

export default roomApi;
