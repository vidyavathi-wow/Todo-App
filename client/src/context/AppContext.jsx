import { createContext, useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

import axiosInstance from '../configs/axiosInstance';
import { getProfile } from '../services/profile';
import { getTodos } from '../services/todos';
import { getUsers } from '../services/users';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const navigate = useNavigate();

  // THEME ------------------------------
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  // AUTH -------------------------------
  const [token, setTokenState] = useState(null);
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  const setToken = useCallback((val) => {
    if (val) {
      localStorage.setItem('token', val);
      setTokenState(val);
    } else {
      localStorage.removeItem('token');
      setTokenState(null);
    }
  }, []);

  // INITIAL AUTH CHECK ------------------
  useEffect(() => {
    let mounted = true;

    const init = async () => {
      const stored = localStorage.getItem('token');
      if (!stored) {
        if (mounted) setAuthLoading(false);
        return;
      }

      try {
        const res = await axiosInstance.get('/api/v1/auth/me');
        if (res.data?.success && mounted) {
          setTokenState(stored);
          setUser(res.data.user);
        } else {
          setToken(null);
        }
      } catch (e) {
        console.error(e);
        setToken(null);
      } finally {
        if (mounted) setAuthLoading(false);
      }
    };

    init();
    return () => (mounted = false);
  }, [setToken]);

  // DATA --------------------------------
  const [todos, setTodos] = useState([]);
  const [users, setUsersList] = useState([]);

  // Fetch Todos
  const fetchTodos = async () => {
    try {
      const d = await getTodos();
      if (d.success) setTodos(d.todos || []);
    } catch (e) {
      console.error(e);
    }
  };

  // Fetch Users
  const fetchUsers = async () => {
    try {
      const d = await getUsers();
      if (d.success) setUsersList(d.users || []);
    } catch (e) {
      console.error(e);
    }
  };

  // Fetch Profile
  const fetchProfile = async () => {
    try {
      const d = await getProfile();
      if (d.success) setUser(d.user);
    } catch (e) {
      console.error(e);
    }
  };

  // FETCH WHEN TOKEN AVAILABLE ----------
  useEffect(() => {
    if (!token) {
      setUser(null);
      setTodos([]);
      setUsersList([]);
      return;
    }

    (async () => {
      try {
        await Promise.all([fetchProfile(), fetchTodos(), fetchUsers()]);
      } catch (e) {
        console.error(e);
      }
    })();
  }, [token]);

  // LOGOUT ------------------------------
  const logout = async () => {
    try {
      await axiosInstance.post('/api/v1/auth/logout').catch(() => {});
    } catch (e) {
      console.error(e);
    }

    setToken(null);
    setUser(null);
    navigate('/login', { replace: true });
    toast.success('Logged out');
  };

  // CONTEXT VALUE -----------------------
  const value = {
    axios: axiosInstance,
    token,
    setToken,
    user,
    setUser,
    logout,
    authLoading,

    theme,
    setTheme,

    todos,
    setTodos,
    users,

    fetchTodos,
    fetchUsers,
    fetchProfile,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export default AppContext;
