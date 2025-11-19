import { createContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

import axiosInstance from '../configs/axiosInstance';
import { getProfile } from '../services/profile';
import { getTodos } from '../services/todos';
import { getUsers } from '../services/users';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const navigate = useNavigate();

  const [editTodo, setEditTodo] = useState(null);
  const [input, setInput] = useState('');

  // 🌙 THEME
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    document.documentElement.style.backgroundColor =
      theme === 'dark' ? '#0f172a' : '#f5f5f5';
    localStorage.setItem('theme', theme);
  }, [theme]);

  // 🔑 AUTH
  const [token, setToken] = useState(null);

  // 👤 USER + TODOS
  const [user, setUser] = useState(null);
  const [todos, setTodos] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // ⭐ GLOBAL FILTER (for TodoList + Calendar sync)
  const [selectedFilter, setSelectedFilter] = useState('my');

  // INIT
  useEffect(() => {
    const init = async () => {
      const at = localStorage.getItem('accessToken');
      const rt = localStorage.getItem('refreshToken');

      if (at) {
        setToken(at);
      } else if (!at && rt) {
        await tryRefreshToken();
      }

      setLoading(false);
    };
    init();
  }, []);

  // REFRESH TOKEN
  const tryRefreshToken = async () => {
    const rt = localStorage.getItem('refreshToken');
    if (!rt) return;

    try {
      const res = await axiosInstance.post('/api/v1/auth/refresh-token', {
        refreshToken: rt,
      });

      if (res.data.success) {
        localStorage.setItem('accessToken', res.data.accessToken);
        setToken(res.data.accessToken);
      }
    } catch {
      localStorage.clear();
    }
  };

  // AFTER TOKEN
  useEffect(() => {
    if (!token) {
      setUser(null);
      setTodos([]);
      setUsers([]);
      return;
    }

    axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;

    fetchUserProfile();
    fetchTodosList();
    fetchUsersList();
  }, [token]);

  // GET PROFILE
  const fetchUserProfile = async () => {
    try {
      const data = await getProfile();
      if (data.success) setUser(data.user);
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  // GET TODOS
  const fetchTodosList = async () => {
    try {
      const data = await getTodos();
      if (data.success) setTodos(data.todos || []);
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  // GET USERS (admin)
  const fetchUsersList = async () => {
    try {
      const data = await getUsers();
      if (data.success) setUsers(data.users || []);
    } catch (error) {
      console.error(error);
    }
  };

  // LOGOUT
  const logoutUser = async () => {
    try {
      await axiosInstance.post('/api/v1/auth/logout', {
        refreshToken: localStorage.getItem('refreshToken'),
      });
    } catch (e) {
      console.error('Logout error:', e);
    }

    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');

    setToken(null);
    setUser(null);
    setTodos([]);
    setUsers([]);

    navigate('/login', { replace: true });
  };

  // EXPORT CONTEXT
  const value = {
    axios: axiosInstance,
    navigate,

    token,
    setToken,

    todos,
    setTodos,

    user,
    setUser,

    users,

    theme,
    setTheme,

    loading,
    editTodo,
    setEditTodo,
    input,
    setInput,

    selectedFilter,
    setSelectedFilter,

    fetchTodos: fetchTodosList,
    logout: logoutUser,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export default AppContext;
