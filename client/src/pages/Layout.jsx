import { useContext, useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import AppContext from '../context/AppContext';
import ThemeToggleBtn from '../components/ThemeToggleBtn';

const Layout = () => {
  const { token, axios, navigate } = useContext(AppContext);
  const [theme, setTheme] = useState('light');

  const logout = () => {
    localStorage.removeItem('token');
    axios.defaults.headers.common['Authorization'] = null;
    navigate('/login');
  };

  return (
    <>
      <div className="flex items-center justify-between py-2 h-[70px] px-4 sm:px-12 bg-gray-900 dark:bg-gray-100 border-b border-gray-700 dark:border-gray-300 transition-colors duration-300">
        <Link
          to="/"
          className="w-32 sm:w-40 cursor-pointer text-3xl font-bold text-white dark:text-gray-900"
        >
          <span className="text-primary">To</span>-Do
        </Link>

        <ThemeToggleBtn theme={theme} setTheme={setTheme} />

        {token && (
          <button
            onClick={logout}
            className="text-sm px-8 py-2 bg-primary text-white rounded-full cursor-pointer hover:bg-primary/80 transition"
          >
            Logout
          </button>
        )}
      </div>

      <div className="flex h-[calc(100vh-70px)] bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 transition-colors duration-300">
        <Sidebar />
        <Outlet />
      </div>
    </>
  );
};

export default Layout;
