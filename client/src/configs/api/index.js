export const API = {
  auth: {
    register: '/api/v1/auth/register',
    login: '/api/v1/auth/login',
    forgotPassword: '/api/v1/auth/forgot-password',
    resetPassword: '/api/v1/auth/reset-password',
  },

  todos: {
    base: '/api/v1/todos',
    byId: (id) => `/api/v1/todos/${id}`,
    statusById: (id) => `/api/v1/todos/${id}/status`,
    dashboard: '/api/v1/todos/data/dashboard',
  },

  profile: {
    base: '/api/v1/profile',
  },

  admin: {
    base: '/api/v1/admin',
    users: '/api/v1/admin/users',
    activityLogs: '/api/v1/admin/activitylogs',
  },

  analytics: {
    base: '/api/v1/analytics',
  },
};
