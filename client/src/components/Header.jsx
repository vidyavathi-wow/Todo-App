import { Link, useNavigate } from 'react-router-dom';
import { useContext, useState, useRef, useEffect } from 'react';
import AppContext from '../context/AppContext';
import ThemeToggleBtn from './ThemeToggleBtn';
import { FiLogOut, FiUser } from 'react-icons/fi';
import { FaChevronDown } from 'react-icons/fa';

export default function Header() {
  const { token, user, axios, setToken, setUser } = useContext(AppContext);
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const logout = () => {
    localStorage.removeItem('token');
    axios.defaults.headers.common['Authorization'] = null;
    setToken(null);
    setUser(null);
    navigate('/login');
  };

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  return (
    <header
      className="
        fixed top-0 left-0 w-full z-50
        flex items-center justify-between
        px-4 sm:px-10 h-[70px]
        bg-gray-900 dark:bg-gray-100
        border-b border-gray-700 dark:border-gray-300
        shadow-md
        transition-colors duration-300
      "
    >
      {/* Logo */}
      <Link
        to="/"
        className="text-3xl font-bold tracking-wide text-white dark:text-gray-900"
      >
        <span className="text-primary">To</span>-Do
      </Link>

      {/* Right section */}
      <div className="flex items-center gap-6">
        <ThemeToggleBtn />

        {/* If authenticated */}
        {token && user ? (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="
                flex items-center gap-2
                hover:opacity-90 transition
              "
            >
              <img
                src={
                  user.profilePic ||
                  'https://cdn-icons-png.flaticon.com/512/847/847969.png'
                }
                className="
                  w-10 h-10 rounded-full object-cover
                  border border-gray-600 dark:border-gray-400
                "
                alt="profile"
              />

              <span className="hidden sm:block font-medium text-white dark:text-gray-900 capitalize">
                {user.name?.split(' ')[0]}
              </span>

              <FaChevronDown
                className={`
                  text-gray-400 dark:text-gray-700
                  text-sm transition-transform duration-200
                  ${dropdownOpen ? 'rotate-180' : ''}
                `}
              />
            </button>

            {/* Dropdown */}
            {dropdownOpen && (
              <div
                className="
                  absolute right-0 mt-3 w-56
                  bg-gray-800 dark:bg-white
                  rounded-xl shadow-lg
                  border border-gray-700 dark:border-gray-300
                  animate-fadeIn
                "
              >
                <button
                  onClick={() => {
                    navigate('/profile');
                    setDropdownOpen(false);
                  }}
                  className="
                    w-full px-4 py-3 text-left flex items-center gap-3
                    text-gray-200 dark:text-gray-900
                    hover:bg-gray-700 dark:hover:bg-gray-200
                    rounded-t-xl transition
                  "
                >
                  <FiUser className="text-primary" />
                  Profile
                </button>

                <button
                  onClick={logout}
                  className="
                    w-full px-4 py-3 text-left flex items-center gap-3
                    text-gray-200 dark:text-gray-900
                    hover:bg-gray-700 dark:hover:bg-gray-200
                    rounded-b-xl transition
                  "
                >
                  <FiLogOut className="text-red-500" />
                  Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <Link
            to="/login"
            className="
              text-white dark:text-gray-900
              font-medium text-sm
              border px-4 py-2 rounded-lg
              border-gray-600 dark:border-gray-400
              hover:bg-gray-800 dark:hover:bg-gray-200
              transition
            "
          >
            Login
          </Link>
        )}
      </div>
    </header>
  );
}
