import React, { useEffect } from 'react';
import moonicon from '../assets/moon_icon.svg';
import sunicon from '../assets/sun_icon.svg';

const ThemeToggleBtn = ({ theme, setTheme }) => {
  // Load theme preference
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

  // Apply theme and save to localStorage
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.style.backgroundColor = '#0f172a'; // smoother load
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
      className="transition hover:opacity-80"
    >
      {theme === 'dark' ? (
        <img
          src={sunicon}
          alt="Light Mode"
          className="w-8 h-8 p-1.5 border border-gray-500 rounded-full bg-white"
        />
      ) : (
        <img
          src={moonicon}
          alt="Dark Mode"
          className="w-8 h-8 p-1.5 border border-gray-500 rounded-full bg-gray-800"
        />
      )}
    </button>
  );
};

export default ThemeToggleBtn;
