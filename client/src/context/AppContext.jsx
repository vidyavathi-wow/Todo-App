import { createContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

import axiosInstance from '../configs/axiosInstance';
import { getTodos } from '../services/todos';
import { getProfile } from '../services/profile';
import { getUsers } from '../services/users';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const navigate = useNavigate();

  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  const [token, setToken] = useState(null);
  const [todos, setTodos] = useState([]);
  const [input, setInput] = useState('');
  const [editTodo, setEditTodo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) setToken(storedToken);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (token) {
      axiosInstance.defaults.headers.common['Authorization'] =
        `Bearer ${token}`;
      fetchUserProfile();
      fetchTodos();
      fetchUsers();
    } else {
      setUser(null);
      setTodos([]);
    }
  }, [token]);

  const fetchUserProfile = async () => {
    try {
      const data = await getProfile();
      if (data.success) setUser(data.user);
      else toast.error(data.message || 'Failed to fetch profile');
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  const fetchTodos = async () => {
    try {
      const data = await getTodos();
      if (data.success) setTodos(data.todos || []);
      else toast.error(data.message || 'Failed to fetch todos');
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  const fetchUsers = async () => {
    try {
      const data = await getUsers();
      if (data.success) setUsers(data.users || []);
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to fetch users');
    }
  };

  const value = {
    axios: axiosInstance,
    navigate,
    token,
    setToken,
    todos,
    setTodos,
    input,
    setInput,
    editTodo,
    setEditTodo,
    fetchTodos,
    loading,
    user,
    setUser,
    users,

    theme,
    setTheme,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export default AppContext;
