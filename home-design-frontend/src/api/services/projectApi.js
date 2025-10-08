import axiosClient from "../axiosClient";

const projectApi = {
  getAll: (params) => {
    const url = "/Project";
    return axiosClient.get(url, { params });
  },
  createProject: (data) => {
    const url = "/Project";
    return axiosClient.post(url, data);
  },
  deleteProject: (projectId) => {
    const url = `/Project/${projectId}`;
    return axiosClient.delete(url);
  }
};

export default projectApi;
