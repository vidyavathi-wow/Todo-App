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

  const [token, setToken] = useState(
    localStorage.getItem('accessToken') || null
  );
  const [user, setUser] = useState(null);

  const [todos, setTodos] = useState([]);
  const [users, setUsers] = useState([]);

  const [loading, setLoading] = useState(true);

  const [editTodo, setEditTodo] = useState(null);
  const [input, setInput] = useState('');

  const [selectedFilter, setSelectedFilter] = useState('my');

  const [userPage, setUserPage] = useState(1);
  const [totalUserPages, setTotalUserPages] = useState(1);

  // INIT --------------------------------------------------
  useEffect(() => {
    const storedToken = localStorage.getItem('accessToken');
    if (storedToken) {
      setToken(storedToken);
    }
    setLoading(false);
  }, []);

  // AFTER TOKEN CHANGES -----------------------------------
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
        console.error('Failed to fetch users:', e);
      }
    });
  }, [token]);

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
      if (data.success) {
        setTodos(data.todos || []);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  const fetchUsersList = async (page = 1, limit = 10) => {
    try {
      const data = await getUsers(page, limit);
      if (data.success) {
        setUsers(data.users || []);
        if (data.totalPages) {
          setUserPage(data.currentPage || page);
          setTotalUserPages(data.totalPages || 1);
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  // LOGOUT -----------------------------------------------
  const logoutUser = async () => {
    try {
      await axiosInstance.post('/api/v1/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    }

    localStorage.clear();

    setToken(null);
    setUser(null);
    setTodos([]);
    setUsers([]);

    navigate('/login', { replace: true });
  };

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
    userPage,
    totalUserPages,
    setUserPage,
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
    fetchUsers: fetchUsersList,
    logout: logoutUser,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export default AppContext;
