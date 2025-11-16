import React, { useEffect } from 'react';
import moonicon from '../assets/moon_icon.svg';
import sunicon from '../assets/sun_icon.svg';
import { useContext } from 'react';
import AppContext from '../context/AppContext';

const ThemeToggleBtn = () => {
  const { theme, setTheme } = useContext(AppContext);
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setTheme(savedTheme);
    } else {
      const prefersDark = window.matchMedia(
        '(prefers-color-scheme: dark)'
      ).matches;
      setTheme(prefersDark ? 'dark' : 'light');
    }
  }, [setTheme]);

  // Apply theme globally
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.style.backgroundColor = '#0f172a';
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.style.backgroundColor = '#f5f5f5';
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      aria-label={
        theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'
      }
      className="transition hover:scale-105 focus:outline-none"
    >
      {theme === 'dark' ? (
        <img
          src={moonicon}
          alt="Switch to Light Mode"
          className="w-8 h-8 p-1.5 rounded-full border border-gray-400 shadow-md"
        />
      ) : (
        <img
          src={sunicon}
          alt="Switch to Dark Mode"
          className="w-8 h-8 p-1.5 rounded-full border border-gray-600 bg-gray-900 hover:bg-gray-800 shadow-md"
        />
      )}
    </button>
  );
};

export default ThemeToggleBtn;
