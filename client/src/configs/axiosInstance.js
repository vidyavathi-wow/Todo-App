import axios from 'axios';

const BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:5000';

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

// REQUEST INTERCEPTOR — always read latest access token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      delete config.headers.Authorization;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// RESPONSE INTERCEPTOR
axiosInstance.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config;

    // ============================================================
    // 🔥 CASE 1: ACCESS TOKEN EXPIRED → TRY REFRESH
    // ============================================================
    if (err.response?.status === 401 && !original._retry) {
      original._retry = true;

      try {
        const res = await axios.get(`${BASE_URL}/api/v1/auth/refresh-token`, {
          withCredentials: true,
        });

        const newToken = res.data.accessToken;

        // Save new token
        localStorage.setItem('accessToken', newToken);

        // Attach new token to original request
        original.headers.Authorization = `Bearer ${newToken}`;

        return axiosInstance(original);
      } catch (refreshError) {
        // Refresh token INVALID → Force logout
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    // ============================================================
    // 🔥 CASE 2: REFRESH TOKEN INVALID (promote/demote/logout) → FORCE LOGOUT
    // ============================================================
    if (err.response?.status === 403) {
      try {
        await axios.post(
          `${BASE_URL}/api/v1/auth/logout`,
          {},
          { withCredentials: true }
        );
      } catch (_) {}

      localStorage.clear();
      window.location.href = '/login';
      return;
    }

    return Promise.reject(err);
  }
);

export default axiosInstance;
