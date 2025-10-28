import { createContext, useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const navigate = useNavigate();
  const [token, setToken] = useState(null);
  const [todos, setTodos] = useState([]);
  const [input, setInput] = useState('');
  const [editTodo, setEditTodo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (token) {
      fetchTodos();
    }
  }, [token]);

  const fetchTodos = async () => {
    try {
      const { data } = await axios.get('/api/v1/todos');
      if (data.success) {
        setTodos(data.todos);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to fetch todos');
    }
  };

  const value = {
    axios,
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
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export default AppContext;
