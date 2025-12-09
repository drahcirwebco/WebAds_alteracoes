
import React from 'react';
import type { Theme } from '../types';

interface HeaderProps {
  currentTheme: Theme;
  toggleTheme: () => void;
  title?: string;
}

const SunIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

const MoonIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
  </svg>
);

export const Header: React.FC<HeaderProps> = ({ currentTheme, toggleTheme, title = "WebAds Analytics" }) => {
  const date = new Date();
  const day = date.getDate();
  const month = date.toLocaleString('pt-BR', { month: 'long' });
  const formattedMonth = month.charAt(0).toUpperCase() + month.slice(1);
  const dateDisplay = `${day} de ${formattedMonth}`;

  return (
    <header className="bg-card-light dark:bg-card-dark shadow-md sticky top-0 z-10">
      <div className="flex justify-between items-center h-16 px-4 sm:px-6 lg:px-8">
        <h1 className="text-xl sm:text-2xl font-bold text-primary-light dark:text-text-primary-dark">{title}</h1>
        <div className="flex items-center gap-4">
            {/* Date and Greeting Display */}
            <div className="hidden md:flex items-center text-sm text-text-secondary-light dark:text-text-secondary-dark mr-2">
                <span className="font-medium">{dateDisplay}</span>
                <span className="mx-3 text-border-light dark:text-border-dark">|</span>
                <span className="flex items-center gap-1">
                    Tenha um Excelente dia <span role="img" aria-label="smile">{currentTheme === 'light' ? '😄' : '😎'}</span>
                </span>
            </div>

            <button
            onClick={toggleTheme}
            className="p-2 rounded-full text-text-secondary-light dark:text-text-secondary-dark hover:bg-gray-200 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-light dark:focus:ring-offset-background-dark"
            aria-label="Toggle theme"
            >
            {currentTheme === 'light' ? (
                <MoonIcon className="w-6 h-6" />
            ) : (
                <SunIcon className="w-6 h-6" />
            )}
            </button>
        </div>
      </div>
    </header>
  );
};
