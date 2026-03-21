import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import { useAuthStore } from './store/useAuthStore';
import { useThemeStore } from './store/useThemeStore';

import StudentDashboard from './pages/StudentDashboard';
import CompanyDashboard from './pages/CompanyDashboard';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  const loadUser = useAuthStore(state => state.loadUser);
  const initTheme = useThemeStore(state => state.initTheme);

  useEffect(() => {
    loadUser();
    initTheme();
  }, [loadUser, initTheme]);

  return (
    <Router>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col font-sans text-slate-900 dark:text-slate-100 transition-colors duration-300">
        <Header />
        <main className="flex-grow flex flex-col items-center justify-center">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Protected Routes (Placeholders for now) */}
            <Route path="/student/dashboard" element={<StudentDashboard />} />
            <Route path="/company/dashboard" element={<CompanyDashboard />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            
            {/* Catch All */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <Footer />
        <ToastContainer position="top-right" autoClose={3000} />
      </div>
    </Router>
  );
}

export default App;
