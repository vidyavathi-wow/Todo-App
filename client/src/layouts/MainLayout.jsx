import { useContext, useState, useRef, useEffect } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import AppContext from '../context/AppContext';
import ThemeToggleBtn from '../components/ThemeToggleBtn';
import { FiLogOut, FiUser } from 'react-icons/fi';
import { FaChevronDown } from 'react-icons/fa';

const MainLayout = () => {
  const { token, user, theme, setTheme, logout } = useContext(AppContext);
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target))
        setDropdownOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <>
      <div className="flex items-center justify-between py-2 h-[70px] px-4 sm:px-10 bg-gray-900 dark:bg-gray-100 border-b border-gray-700 dark:border-gray-300 transition-colors duration-300">
        <Link
          to="/"
          className="cursor-pointer text-3xl font-bold text-white dark:text-gray-900 select-none"
        >
          <span className="text-primary">To</span>-Do
        </Link>

        {token && user && (
          <div className="flex items-center gap-5">
            <ThemeToggleBtn theme={theme} setTheme={setTheme} />

            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 focus:outline-none"
              >
                <img
                  src={
                    user.profilePic ||
                    'https://cdn-icons-png.flaticon.com/512/847/847969.png'
                  }
                  alt="Profile"
                  className="w-10 h-10 rounded-full border border-gray-600 dark:border-gray-400 object-cover"
                />
                <span className="hidden sm:block text-white dark:text-gray-900 font-medium capitalize">
                  {user.name?.split(' ')[0] || 'User'}
                </span>
                <FaChevronDown
                  className={`text-gray-400 text-sm transition-transform ${dropdownOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-3 w-52 bg-gray-800 dark:bg-gray-200 rounded-lg shadow-lg py-2 animate-fadeIn border border-gray-700 dark:border-gray-300">
                  <button
                    onClick={() => {
                      navigate('/profile');
                      setDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 flex items-center gap-3 text-gray-200 dark:text-gray-800 hover:bg-gray-700 dark:hover:bg-gray-300 transition"
                  >
                    {user.profilePic ? (
                      <img
                        src={user.profilePic}
                        alt="Profile"
                        className="w-6 h-6 rounded-full object-cover border border-gray-500"
                      />
                    ) : (
                      <FiUser className="text-primary" />
                    )}
                    <span>Profile</span>
                  </button>

                  <button
                    onClick={logout}
                    className="w-full text-left px-4 py-2 flex items-center gap-3 text-gray-200 dark:text-gray-800 hover:bg-gray-700 dark:hover:bg-gray-300 transition"
                  >
                    <FiLogOut className="text-red-500" />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="flex h-[calc(100vh-70px)] bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 transition-colors duration-300">
        <Sidebar />
        <Outlet />
      </div>
    </>
  );
};

export default MainLayout;
