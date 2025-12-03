axiosInstance.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config;

    // === 🔥 EXPIRED ACCESS TOKEN (NORMAL REFRESH) ===
    if (err.response?.status === 401 && !original._retry) {
      original._retry = true;

      try {
        const res = await axios.get(`${BASE_URL}/api/v1/auth/refresh-token`, {
          withCredentials: true,
        });

        const newToken = res.data.accessToken;

        localStorage.setItem('accessToken', newToken);
        original.headers.Authorization = `Bearer ${newToken}`;

        return axiosInstance(original);
      } catch (e) {
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(e);
      }
    }

    // === 🔥 INVALID REFRESH TOKEN (after promote/demote) ===
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
