// client/src/configs/axiosInstance.js
import axios from "axios";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL || "http://localhost:5000",
  withCredentials: true,
});

axiosInstance.interceptors.request.use(
  (config) => {
    try {
      const token = localStorage.getItem("token");
      if (token) config.headers.Authorization = `Bearer ${token}`;
    } catch {}
    return config;
  },
  (error) => Promise.reject(error)
);

// Global 401 handler
axiosInstance.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err?.response?.status;

    if (status === 401) {
      try {
        localStorage.removeItem("token");
      } catch {}

      // FORCE page reload -> resets everything
      window.location.href = "/login";
    }

    return Promise.reject(err);
  }
);

export default axiosInstance;
