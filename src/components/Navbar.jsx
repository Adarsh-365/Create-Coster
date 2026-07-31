import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Layers, Sparkles, FolderPlus, Sun, Moon, LogOut, Lock, Menu, X } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { path: '/', label: 'Homepage' },
    { path: '/workspace', label: 'Build Script', protected: true },
    { path: '/status', label: 'Status', protected: true },
    { path: '/completed', label: 'Export', protected: true },
  ];

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-200 dark:border-zinc-800 px-4 sm:px-6 py-3 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" onClick={closeMobileMenu} className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-500 group-hover:border-blue-400 group-hover:bg-blue-600/30 transition-all shadow-sm">
            <Layers className="w-4 h-4" />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-slate-900 dark:text-white tracking-tight text-base">ManimFlow</span>
            <span className="badge badge-blue text-[9px] uppercase tracking-wider font-mono px-1.5 py-0.5">Enterprise</span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-100 dark:bg-zinc-900/90 p-1 rounded-xl border border-slate-200 dark:border-zinc-800">
          {navLinks.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1 ${
                  isActive
                    ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-sm border border-slate-200 dark:border-zinc-700/60 font-semibold'
                    : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <span>{item.label}</span>
                {item.protected && !isAuthenticated && (
                  <Lock className="w-3 h-3 text-slate-400 dark:text-zinc-500" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Desktop Right Controls */}
        <div className="hidden md:flex items-center gap-3">
          {/* Light / Dark Mode Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white transition-colors"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-blue-600" />
            )}
          </button>

          {isAuthenticated ? (
            <div className="flex items-center gap-2">

              <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-zinc-800">
                <div className="w-7 h-7 rounded-full bg-blue-600/20 border border-blue-500/40 text-blue-600 dark:text-blue-400 font-mono text-[11px] font-bold flex items-center justify-center">
                  {user?.avatar || 'DV'}
                </div>
                <button
                  onClick={() => { logout(); navigate('/'); }}
                  className="p-1.5 text-slate-400 dark:text-zinc-400 hover:text-rose-500 transition-colors"
                  title="Log out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login" className="btn-secondary text-xs py-1.5 px-3">
                Sign In
              </Link>
              <Link to="/signup" className="btn-primary text-xs py-1.5 px-3">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Get Started</span>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Controls & Hamburger Button */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={toggleTheme}
            className="p-1.5 rounded-lg bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-blue-600" />}
          </button>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-200"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden pt-3 pb-4 px-2 space-y-2 border-t border-slate-200 dark:border-zinc-800 mt-3 animate-fadeIn">
          <div className="space-y-1">
            {navLinks.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={closeMobileMenu}
                  className={`w-full px-3 py-2 rounded-lg text-xs font-medium flex items-center justify-between ${
                    isActive
                      ? 'bg-blue-600 text-white font-semibold'
                      : 'text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800'
                  }`}
                >
                  <span>{item.label}</span>
                  {item.protected && !isAuthenticated && (
                    <Lock className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500" />
                  )}
                </Link>
              );
            })}
          </div>

          <div className="pt-3 border-t border-slate-200 dark:border-zinc-800 flex flex-col gap-2">
            {isAuthenticated ? (
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-blue-600/20 border border-blue-500/40 text-blue-600 dark:text-blue-400 font-mono text-xs font-bold flex items-center justify-center">
                    {user?.avatar || 'DV'}
                  </div>
                  <span className="text-xs font-medium text-slate-800 dark:text-zinc-200">{user?.name}</span>
                </div>
                <button
                  onClick={() => { logout(); closeMobileMenu(); navigate('/'); }}
                  className="btn-secondary text-xs py-1.5 px-3 text-rose-500"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Log Out</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-1">
                <Link to="/login" onClick={closeMobileMenu} className="btn-secondary text-xs py-2 justify-center">
                  Sign In
                </Link>
                <Link to="/signup" onClick={closeMobileMenu} className="btn-primary text-xs py-2 justify-center">
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
