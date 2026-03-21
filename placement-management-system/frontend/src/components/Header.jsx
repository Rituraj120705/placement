import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { useThemeStore } from '../store/useThemeStore';
import { Briefcase, LogOut, User, Menu, X, Sun, Moon } from 'lucide-react';

const Header = () => {
  const { isAuthenticated, user, logout } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getDashboardLink = () => {
    if (!user) return '#';
    if (user.role === 'admin') return '/admin/dashboard';
    if (user.role === 'company') return '/company/dashboard';
    return '/student/dashboard';
  };

  return (
    <nav className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-lg border-b border-slate-200/60 dark:border-slate-800/60 sticky top-0 z-50 shadow-[0_4px_30px_rgb(0,0,0,0.03)] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-2 group">
              <div className="bg-primary-600 p-2 rounded-lg group-hover:bg-primary-700 transition-colors">
                <Briefcase className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <span className="font-bold text-xl text-slate-800 dark:text-white tracking-tight">PlacementHub</span>
            </Link>
          </div>
          
          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-4">
            <button 
              onClick={toggleTheme} 
              className="p-2 text-slate-500 hover:text-primary-600 dark:text-slate-400 dark:hover:text-primary-400 focus:outline-none transition-colors"
              title="Toggle Theme"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            {isAuthenticated ? (
              <>
                <Link to={getDashboardLink()} className="text-slate-600 hover:text-primary-600 font-medium transition-colors">
                  Dashboard
                </Link>
                <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
                  <div className="flex flex-col items-end">
                    <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">{user?.name}</span>
                    <span className="text-xs text-slate-500 capitalize">{user?.role}</span>
                  </div>
                  <button 
                    onClick={handleLogout}
                    className="p-2 text-slate-400 hover:text-red-600 bg-slate-50 hover:bg-red-50 rounded-full transition-colors focus:outline-none"
                    title="Log Out"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="text-slate-600 hover:text-primary-600 font-semibold transition-colors">
                  Log in
                </Link>
                <Link to="/register" className="btn-primary py-2.5 px-6 shadow-md shadow-primary-500/20 hover:shadow-lg hover:-translate-y-0.5 transition-all">
                  Sign up
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center">
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
              className="text-slate-600 hover:text-primary-600 p-2 focus:outline-none"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 shadow-xl absolute w-full left-0 top-16 py-4 px-6 flex flex-col gap-4 animate-fade-in-up origin-top">
          <button onClick={toggleTheme} className="text-slate-700 dark:text-slate-300 font-medium py-3 text-left flex items-center justify-between hover:text-primary-600 transition-colors border-b border-slate-100 dark:border-slate-800">
            <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
            {theme === 'dark' ? <Sun className="w-5 h-5"/> : <Moon className="w-5 h-5"/>}
          </button>
          {isAuthenticated ? (
            <>
               <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                  <div className="w-10 h-10 bg-primary-50 text-primary-600 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5"/>
                  </div>
                  <div>
                    <div className="font-bold text-slate-800 dark:text-white">{user?.name}</div>
                    <div className="text-xs font-semibold text-primary-600 capitalize">{user?.role}</div>
                  </div>
               </div>
               <Link to={getDashboardLink()} onClick={() => setIsMobileMenuOpen(false)} className="text-slate-700 font-medium py-3 hover:text-primary-600 transition-colors">
                 My Dashboard
               </Link>
               <button onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }} className="text-red-500 font-semibold py-3 text-left flex items-center gap-2 hover:bg-red-50 rounded-lg px-2 -mx-2 transition-colors">
                 <LogOut className="w-5 h-5"/> Log Out
               </button>
            </>
          ) : (
             <>
               <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="text-slate-700 font-medium py-3 text-center border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
                 Log in
               </Link>
               <Link to="/register" onClick={() => setIsMobileMenuOpen(false)} className="btn-primary flex justify-center py-3.5 shadow-md shadow-primary-500/20">
                 Sign up for free
               </Link>
             </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Header;
