import axios from 'axios';

const BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:5000';

let accessToken = localStorage.getItem('accessToken') || null;

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

axiosInstance.interceptors.request.use(
  (config) => {
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    } else {
      delete config.headers.Authorization;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config;
    if (err.response?.status === 401 && !original._retry) {
      original._retry = true;

      try {
        const res = await axios.get(`${BASE_URL}/api/v1/auth/refresh-token`, {
          withCredentials: true,
        });

        const newToken = res.data.accessToken;
        accessToken = newToken;
        localStorage.setItem('accessToken', newToken);
        original.headers.Authorization = `Bearer ${newToken}`;

        return axiosInstance(original);
      } catch (e) {
        accessToken = null;
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(e);
      }
    }
    return Promise.reject(err);
  }
);

export default axiosInstance;
