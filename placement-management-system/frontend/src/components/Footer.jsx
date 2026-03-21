import React from 'react';
import { Briefcase } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 mt-auto">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4 group inline-flex">
              <div className="bg-primary-600 p-2 rounded-lg group-hover:bg-primary-700 transition-colors">
                <Briefcase className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl text-slate-800 dark:text-white tracking-tight">PlacementHub</span>
            </Link>
            <p className="text-slate-500 dark:text-slate-400 max-w-sm leading-relaxed">
              Empowering students and connecting them with world-class opportunities. The modern standard for campus placements.
            </p>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-slate-800 dark:text-white tracking-wider uppercase mb-4">Platform</h3>
            <ul className="space-y-3">
              <li><Link to="/register" className="text-slate-500 dark:text-slate-400 hover:text-primary-600 transition-colors">Student Portal</Link></li>
              <li><Link to="/register" className="text-slate-500 dark:text-slate-400 hover:text-primary-600 transition-colors">Company Access</Link></li>
              <li><Link to="/login" className="text-slate-500 dark:text-slate-400 hover:text-primary-600 transition-colors">Admin Login</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-800 dark:text-white tracking-wider uppercase mb-4">Legal</h3>
            <ul className="space-y-3">
              <li><a href="#" className="text-slate-500 dark:text-slate-400 hover:text-primary-600 transition-colors" onClick={(e) => e.preventDefault()}>Privacy Policy</a></li>
              <li><a href="#" className="text-slate-500 dark:text-slate-400 hover:text-primary-600 transition-colors" onClick={(e) => e.preventDefault()}>Terms of Service</a></li>
              <li><a href="#" className="text-slate-500 dark:text-slate-400 hover:text-primary-600 transition-colors" onClick={(e) => e.preventDefault()}>Contact Us</a></li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-slate-400 text-sm">
            &copy; {new Date().getFullYear()} PlacementHub. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
