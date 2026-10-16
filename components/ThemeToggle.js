'use client';

import { useEffect, useState } from 'react';
import { FaMoon, FaSun } from 'react-icons/fa';

const STORAGE_KEY = 'theme';

function readTheme() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved === 'light' ? 'light' : 'dark';
  } catch {
    return 'dark';
  }
}

function applyTheme(theme) {
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // Private browsing - the class still applies for this session.
  }
  document.documentElement.classList.toggle('dark', theme === 'dark');
}

/**
 * The segmented light/dark pill from the portfolio navbar.
 * Left segment = dark (moon), right segment = light (sun).
 */
export default function ThemeToggle() {
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    setTheme(readTheme());

    // Stay in sync if another tab changes it.
    const onStorage = (e) => {
      if (e.key === STORAGE_KEY && (e.newValue === 'light' || e.newValue === 'dark')) {
        setTheme(e.newValue);
        document.documentElement.classList.toggle('dark', e.newValue === 'dark');
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const choose = (next) => {
    setTheme(next);
    applyTheme(next);
  };

  return (
    <div className="relative flex shrink-0 items-center rounded-lg bg-gray-100 p-0.5 dark:bg-gray-800">
      <span
        aria-hidden="true"
        className={`absolute top-0.5 bottom-0.5 left-0.5 w-[calc(50%-0.125rem)] rounded-md bg-white shadow-sm transition-transform duration-300 ease-out dark:bg-gray-700 ${
          theme === 'light' ? 'translate-x-full' : 'translate-x-0'
        }`}
      />
      <button
        type="button"
        onClick={() => choose('dark')}
        aria-label="Switch to dark mode"
        aria-pressed={theme === 'dark'}
        className="relative z-10 flex h-7 w-7 items-center justify-center rounded-md"
      >
        <FaMoon
          size={11}
          className={`transition-colors ${
            theme === 'dark'
              ? 'text-gray-900 dark:text-white'
              : 'text-gray-400 dark:text-gray-500'
          }`}
        />
      </button>
      <button
        type="button"
        onClick={() => choose('light')}
        aria-label="Switch to light mode"
        aria-pressed={theme === 'light'}
        className="relative z-10 flex h-7 w-7 items-center justify-center rounded-md"
      >
        <FaSun
          size={11}
          className={
            theme === 'light'
              ? 'text-gray-900 dark:text-white'
              : 'text-gray-400 dark:text-gray-500'
          }
        />
      </button>
    </div>
  );
}
