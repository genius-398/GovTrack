import React from 'react';
import { UserCheck, Shield, Sparkles, Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext.tsx';

interface HeaderProps {
  currentView: 'citizen' | 'admin';
  onSwitchView: (view: 'citizen' | 'admin') => void;
  onRequestNewDoc?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ currentView, onSwitchView }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Zone 1: Single text element wordmark */}
        <a
          href="/"
          onClick={(e) => {
            e.preventDefault();
            onSwitchView('citizen');
          }}
          className="flex items-center gap-2.5 text-xl font-extrabold tracking-tight text-slate-900 dark:text-white whitespace-nowrap"
        >
          <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-600/30">
            <span className="font-mono text-sm font-black">G</span>
          </div>
          <span>GovTrack</span>
        </a>

        {/* Zone 2: 4-6 clean text navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-500 dark:text-slate-400">
          <button
            onClick={() => onSwitchView('citizen')}
            className={`transition-colors hover:text-slate-900 dark:hover:text-white ${
              currentView === 'citizen' ? 'text-blue-600 dark:text-blue-400 font-bold' : ''
            }`}
          >
            Citizen Tracker
          </button>
          <button
            onClick={() => onSwitchView('admin')}
            className={`transition-colors hover:text-slate-900 dark:hover:text-white ${
              currentView === 'admin' ? 'text-blue-600 dark:text-blue-400 font-bold' : ''
            }`}
          >
            Administration Desk
          </button>
          <a href="#departments" className="hover:text-slate-900 dark:hover:text-white transition-colors">
            Authorities
          </a>
          <a href="#milestones" className="hover:text-slate-900 dark:hover:text-white transition-colors">
            SOP Milestones
          </a>
          <a href="#compliance" className="hover:text-slate-900 dark:hover:text-white transition-colors">
            Ledger Proof
          </a>
        </nav>

        {/* Zone 3: 1-2 primary actions (Theme toggle & Portal Switcher) */}
        <div className="flex items-center gap-3">
          {/* Light / Dark Mode Toggle */}
          <button
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all hover:scale-105"
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            {theme === 'light' ? (
              <Moon size={16} className="text-slate-700" />
            ) : (
              <Sun size={16} className="text-amber-400" />
            )}
          </button>

          {/* Portal Switcher */}
          <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-semibold">
            <button
              onClick={() => onSwitchView('citizen')}
              className={`px-3.5 py-1.5 rounded-lg transition-all whitespace-nowrap ${
                currentView === 'citizen'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs font-bold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Citizen Portal
            </button>
            <button
              onClick={() => onSwitchView('admin')}
              className={`px-3.5 py-1.5 rounded-lg transition-all whitespace-nowrap ${
                currentView === 'admin'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs font-bold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Admin Desk
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
