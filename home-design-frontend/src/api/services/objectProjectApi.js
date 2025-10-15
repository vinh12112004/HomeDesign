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
  
  update: (projectId, objectId, objectData) => {
    const url = `/ProjectObjects/${projectId}/${objectId}`;
    return axiosClient.put(url, objectData);
  },
  
  delete: (projectId, objectId) => {
    const url = `/ProjectObjects/${projectId}/${objectId}`;
    return axiosClient.delete(url);
  },
  
  getById: (projectId, objectId) => {
    const url = `/ProjectObjects/${projectId}/${objectId}`;
    return axiosClient.get(url);
  }
};

export default objectProjectApi;