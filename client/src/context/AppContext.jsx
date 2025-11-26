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

  // THEME -------------------------------------------------
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    document.documentElement.style.backgroundColor =
      theme === 'dark' ? '#0f172a' : '#f5f5f5';
    localStorage.setItem('theme', theme);
  }, [theme]);

  // AUTH / DATA STATE -------------------------------------
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);

  const [todos, setTodos] = useState([]);
  const [users, setUsers] = useState([]);

  const [loading, setLoading] = useState(true);

  const [editTodo, setEditTodo] = useState(null);
  const [input, setInput] = useState('');

  // Filter used for calendar / todo list
  const [selectedFilter, setSelectedFilter] = useState('my');

  // (optional) pagination meta for users (backend now supports it)
  const [userPage, setUserPage] = useState(1);
  const [totalUserPages, setTotalUserPages] = useState(1);

  // INIT --------------------------------------------------
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

  // REFRESH TOKEN -----------------------------------------
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

  // AFTER TOKEN CHANGES -----------------------------------
  useEffect(() => {
    if (!token) {
      setUser(null);
      setTodos([]);
      setUsers([]);
      return;
    }

    axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;

    // 1) Load profile first
    fetchUserProfile().then((loaded) => {
      if (!loaded) return;

      // 2) Load todos (full list; Dashboard paginates on frontend)
      fetchTodosList();

      // 3) Load users (first page) – used for "Assigned To" dropdown etc.
      try {
        fetchUsersList();
      } catch (e) {
        console.warn('Users list failed (non-blocking):', e);
      }
    });
  }, [token]);

  // FETCH: PROFILE ----------------------------------------
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

  // FETCH: TODOS  (no pagination here; Dashboard slices locally)
  const fetchTodosList = async () => {
    try {
      const data = await getTodos(); // uses /todos without page/limit or with your defaults
      if (data.success) {
        // support both old {todos} and paginated {todos, totalPages}
        setTodos(data.todos || []);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  // FETCH: USERS (with backend pagination support)
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
      console.error(error);
    }
  };

  // LOGOUT -----------------------------------------------
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

  // CONTEXT VALUE ----------------------------------------
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
    // user pagination (if you need it in UI later)
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
