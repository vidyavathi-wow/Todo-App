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

  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    document.documentElement.style.backgroundColor =
      theme === 'dark' ? '#0f172a' : '#f5f5f5';
    localStorage.setItem('theme', theme);
  }, [theme]);

  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [todos, setTodos] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [editTodo, setEditTodo] = useState(null);
  const [input, setInput] = useState('');

  // ⭐ ADD THIS (missing in your code)
  const [selectedFilter, setSelectedFilter] = useState('my');

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
        localStorage.setItem('refreshToken', res.data.refreshToken);
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

    fetchUserProfile().then((loaded) => {
      if (!loaded) return;

      fetchTodosList();

      try {
        fetchUsersList();
      } catch (e) {
        console.warn('Users list failed but ignored in non-admin', e);
      }
    });
  }, [token]);

  // FETCH FUNCTIONS -------------
  const fetchUserProfile = async () => {
    try {
      const data = await getProfile();
      if (data.success) {
        setUser(data.user);
        return true;
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
    return false;
  };

  const fetchTodosList = async () => {
    try {
      const data = await getTodos();
      if (data.success) setTodos(data.todos || []);
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  const fetchUsersList = async () => {
    try {
      const data = await getUsers();
      if (data.success) setUsers(data.users || []);
    } catch (error) {
      console.error(error);
    }
  };

  // LOGOUT ----------------------
  const logoutUser = async () => {
    try {
      await axiosInstance.post('/api/v1/auth/logout', {
        refreshToken: localStorage.getItem('refreshToken'),
      });
    } catch (error) {
      console.error(error);
    }

    localStorage.clear();
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

    user,
    setUser,

    todos,
    setTodos,

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

    fetchUserProfile,
    fetchTodos: fetchTodosList,
    logout: logoutUser,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export default AppContext;
