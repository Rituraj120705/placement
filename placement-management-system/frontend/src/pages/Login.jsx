import React, { useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { LogIn } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const login = useAuthStore(state => state.login);
  const { isLoading, error } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await login(email, password);
    if (success) {
      toast.success('Logged in successfully!');
      // Navigate to respective dashboard based on role
      const user = useAuthStore.getState().user;
      if (user?.role === 'admin') navigate('/admin/dashboard');
      else if (user?.role === 'company') navigate('/company/dashboard');
      else navigate('/student/dashboard');
    } else {
      toast.error(error || 'Login failed');
    }
  };

  return (
    <div className="w-full max-w-md bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-700">
      <div className="text-center mb-8">
        <div className="bg-primary-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <LogIn className="text-primary-600 w-8 h-8" />
        </div>
        <h2 className="text-3xl font-bold text-slate-800 dark:text-white">Welcome Back</h2>
        <p className="text-slate-500 dark:text-slate-400 mt-2">Sign in to your account</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Email</label>
          <input 
            type="email" 
            required 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input-field px-4 py-2 border rounded-lg w-full focus:ring-2 focus:ring-primary-500 outline-none transition-shadow" 
            placeholder="you@example.com"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Password</label>
          <input 
            type="password" 
            required 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input-field px-4 py-2 border rounded-lg w-full focus:ring-2 focus:ring-primary-500 outline-none transition-shadow" 
            placeholder="••••••••"
          />
        </div>

        <button 
          type="submit" 
          disabled={isLoading}
          className="w-full btn-primary py-3 rounded-lg font-semibold flex items-center justify-center gap-2"
        >
          {isLoading ? 'Signing In...' : 'Sign In'}
        </button>
      </form>

      <div className="mt-6 text-center text-sm text-slate-600 dark:text-slate-300">
        Don't have an account?{' '}
        <Link to="/register" className="text-primary-600 hover:text-primary-700 font-semibold hover:underline">
          Sign up
        </Link>
      </div>
    </div>
  );
};

export default Login;
