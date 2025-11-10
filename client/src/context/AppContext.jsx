import { createContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getTodos } from '../services/todos';
import { getUserProfile } from '../services/profile';
import axiosInstance from '../configs/axiosInstance';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const navigate = useNavigate();
  const [token, setToken] = useState(null);
  const [todos, setTodos] = useState([]);
  const [input, setInput] = useState('');
  const [editTodo, setEditTodo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) setToken(storedToken);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (token) {
      fetchUserProfile();
      fetchTodos();
    }
  }, [token]);

  const fetchUserProfile = async () => {
    try {
      const data = await getUserProfile();
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
      if (error.response?.data?.errors) {
        error.response.data.errors.forEach((err) => toast.error(err.msg));
      } else {
        toast.error(
          error.response?.data?.message ||
            error.message ||
            'Something went wrong'
        );
      }
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
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export default AppContext;
