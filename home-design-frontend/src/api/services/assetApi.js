import axiosClient from '../axiosClient';

// type: 'texture' | 'furniture'
const assetApi = {
  list: async (type) => {
    const path = type === 'furniture' ? '/Assets/furnitures' : '/Assets/textures';
    const res = await axiosClient.get(path);
    const arr = Array.isArray(res) ? res : (res?.data || []);
    return arr.map(it => (typeof it === 'string' ? it : it?.url)).filter(Boolean);
  },
  upload: async (type, file) => {
    const form = new FormData();
    form.append('file', file);
    const path = type === 'furniture' ? '/Assets/upload/furniture' : '/Assets/upload/texture';
    const res = await axiosClient.post(path, form, { headers: { 'Content-Type': 'multipart/form-data' } });
    const data = res?.data ?? res;
    return typeof data === 'string' ? data : data?.url;
  },
};

export default assetApi;