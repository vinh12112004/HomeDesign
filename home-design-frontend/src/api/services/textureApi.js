import axiosClient from '../axiosClient';

const textureApi = {
  // Trả về mảng URL (string[])
  list: async () => {
    const res = await axiosClient.get('/Assets/textures');
    const arr = Array.isArray(res) ? res : (res?.data || []);
    return arr.map(it => (typeof it === 'string' ? it : it.url)).filter(Boolean);
  },

  // Trả về URL (string)
  upload: async (file) => {
    const form = new FormData();
    form.append('file', file);
    const res = await axiosClient.post('/Assets/upload/texture', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    const data = res?.data ?? res;
    return typeof data === 'string' ? data : data?.url;
  },
};

export default textureApi;