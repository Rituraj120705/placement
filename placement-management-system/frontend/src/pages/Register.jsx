import React, { useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { UserPlus } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student',
    major: '',
    companyName: ''
  });
  
  const register = useAuthStore(state => state.register);
  const { isLoading, error } = useAuthStore();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await register(formData);
    if (success) {
      toast.success('Registration successful!');
      if (formData.role === 'company') navigate('/company/dashboard');
      else navigate('/student/dashboard');
    } else {
      toast.error(error || 'Registration failed');
    }
  };

  return (
    <div className="w-full max-w-xl bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-xl my-8 border border-gray-100 dark:border-slate-700">
      <div className="text-center mb-8">
        <div className="bg-primary-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <UserPlus className="text-primary-600 w-8 h-8" />
        </div>
        <h2 className="text-3xl font-bold text-slate-800 dark:text-white">Create an Account</h2>
        <p className="text-slate-500 dark:text-slate-400 mt-2">Join the placement management system</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Full Name</label>
            <input 
              name="name" type="text" required value={formData.name} onChange={handleChange}
              className="input-field px-4 py-2 border rounded-lg w-full outline-none focus:ring-2 focus:ring-primary-500 transition-shadow" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Email</label>
            <input 
              name="email" type="email" required value={formData.email} onChange={handleChange}
              className="input-field px-4 py-2 border rounded-lg w-full outline-none focus:ring-2 focus:ring-primary-500 transition-shadow" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Password</label>
            <input 
              name="password" type="password" required value={formData.password} onChange={handleChange}
              className="input-field px-4 py-2 border rounded-lg w-full outline-none focus:ring-2 focus:ring-primary-500 transition-shadow" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">I am a...</label>
            <select 
              name="role" value={formData.role} onChange={handleChange}
              className="input-field px-4 py-2 border rounded-lg w-full outline-none focus:ring-2 focus:ring-primary-500 transition-shadow bg-white dark:bg-slate-800"
            >
              <option value="student">Student</option>
              <option value="company">Company / Recruiter</option>
            </select>
          </div>
          
          {formData.role === 'student' && (
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Major / Branch</label>
              <input 
                name="major" type="text" value={formData.major} onChange={handleChange}
                className="input-field px-4 py-2 border rounded-lg w-full outline-none focus:ring-2 focus:ring-primary-500 transition-shadow" placeholder="e.g. Computer Science"
              />
            </div>
          )}

          {formData.role === 'company' && (
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Company Name</label>
              <input 
                name="companyName" type="text" value={formData.companyName} onChange={handleChange}
                className="input-field px-4 py-2 border rounded-lg w-full outline-none focus:ring-2 focus:ring-primary-500 transition-shadow" placeholder="Your Company Ltd."
              />
            </div>
          )}
        </div>

        <button 
          type="submit" disabled={isLoading}
          className="w-full btn-primary py-3 rounded-lg font-semibold mt-4 flex justify-center"
        >
          {isLoading ? 'Creating Account...' : 'Sign Up'}
        </button>
      </form>

      <div className="mt-6 text-center text-sm text-slate-600 dark:text-slate-300">
        Already have an account?{' '}
        <Link to="/login" className="text-primary-600 hover:underline font-semibold">
          Log in
        </Link>
      </div>
    </div>
  );
};

export default Register;
