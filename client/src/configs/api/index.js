export const API = {
  auth: {
    register: '/api/v1/auth/register',
    login: '/api/v1/auth/login',
    forgotPassword: '/api/v1/auth/forgot-password',
    resetPassword: '/api/v1/auth/reset-password',
  },

  users: {
    base: '/api/v1/users',
  },

  todos: {
    base: '/api/v1/todos',
    byId: (id) => `/api/v1/todos/${id}`,
    statusById: (id) => `/api/v1/todos/${id}/status`,
    dashboard: '/api/v1/todos/data/dashboard',
    byDate: (date) => `/api/v1/todos/by-date?date=${date}`,
    byDateRange: (start, end) =>
      `/api/v1/todos/by-date-range?start=${start}&end=${end}`,
  },

  profile: {
    base: '/api/v1/profile',
  },

  admin: {
    base: '/api/v1/admin',
    users: '/api/v1/admin/users',
    activityLogs: '/api/v1/admin/activitylogs',
    promote: (id) => `/api/v1/admin/users/${id}/promote`,
    demote: (id) => `/api/v1/admin/users/${id}/demote`,
    restore: (id) => `/api/v1/admin/users/${id}/restore`,
  },

  analytics: {
    base: '/api/v1/analytics',
  },

  activitylogs: {
    base: '/api/v1/activitylogs',
  },
};
