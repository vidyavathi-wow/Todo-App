import { Outlet, Link, useLocation } from 'react-router-dom';
import { useContext } from 'react';
import ThemeToggleBtn from '../components/ThemeToggleBtn';
import AppContext from '../context/AppContext';

const AuthLayout = () => {
  const { theme, setTheme } = useContext(AppContext);
  const location = useLocation();

  const isLogin = location.pathname === '/login';

  return (
    <div className="min-h-screen bg-gray-900 dark:bg-gray-100 flex flex-col transition-colors duration-300">
      {/* Header */}
      <header className="h-[70px] flex items-center justify-between px-6 border-b border-gray-700 dark:border-gray-300">
        {/* Logo */}
        <Link
          to="/"
          className="text-3xl font-bold text-white dark:text-gray-900 select-none"
        >
          <span className="text-primary">To</span>-Do
        </Link>

        {/* Right side buttons */}
        <div className="flex items-center gap-4">
          {/* Theme Toggle */}
          <ThemeToggleBtn theme={theme} setTheme={setTheme} />

          {/* Login / Signup toggle button */}
          {isLogin ? (
            <Link
              to="/signup"
              className="text-primary font-medium hover:underline"
            >
              Signup
            </Link>
          ) : (
            <Link
              to="/login"
              className="text-primary font-medium hover:underline"
            >
              Login
            </Link>
          )}
        </div>
      </header>

      {/* Page Content */}
      <main className="flex-1 flex items-center justify-center px-4">
        <Outlet />
      </main>
    </div>
  );
};

export default AuthLayout;
