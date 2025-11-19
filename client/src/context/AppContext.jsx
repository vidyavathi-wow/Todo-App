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

  // THEME -----------------------
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    document.documentElement.style.backgroundColor =
      theme === 'dark' ? '#0f172a' : '#f5f5f5';

    localStorage.setItem('theme', theme);
  }, [theme]);
  // STATE -----------------------
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [todos, setTodos] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // INIT ------------------------
  useEffect(() => {
    const init = async () => {
      const storedToken = localStorage.getItem('accessToken');
      const storedRT = localStorage.getItem('refreshToken');

      if (storedToken) {
        setToken(storedToken);
      } else if (!storedToken && storedRT) {
        await tryRefreshToken();
      }

      setLoading(false);
    };

    init();
  }, []);

  // REFRESH TOKEN ---------------
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

  // AFTER TOKEN SET -------------
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

  // FETCH: PROFILE --------------
  const fetchUserProfile = async () => {
    try {
      const data = await getProfile();
      if (data.success) setUser(data.user);
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  // FETCH: TODOS ----------------
  const fetchTodosList = async () => {
    try {
      const data = await getTodos();
      if (data.success) setTodos(data.todos || []);
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  // FETCH: USERS ---------------- (for admin)
  const fetchUsersList = async () => {
    try {
      const data = await getUsers();
      if (data.success) setUsers(data.users || []);
    } catch (e) {
      console.error(e);
    }
  };

  // LOGOUT ----------------------
  const logoutUser = async () => {
    try {
      await axiosInstance.post('/api/v1/auth/logout', {
        refreshToken: localStorage.getItem('refreshToken'),
      });
    } catch (e) {}

    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');

    setToken(null);
    setUser(null);
    setTodos([]);
    setUsers([]);

    navigate('/login', { replace: true });
  };

  // CONTEXT VALUE ---------------
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

    fetchTodos: fetchTodosList,
    logout: logoutUser,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export default AppContext;
