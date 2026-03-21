import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { Briefcase, Users, FileText, Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';

const AdminDashboard = () => {
  const [jobs, setJobs] = useState([]);
  const [users, setUsers] = useState([]);
  const [applicationsCount, setApplicationsCount] = useState(0);
  
  const fetchData = async () => {
    try {
      const [jobsRes, appsRes, usersRes] = await Promise.all([
        api.get('/jobs'),
        api.get('/applications'),
        api.get('/auth/users'),
      ]);
      setJobs(jobsRes.data);
      setApplicationsCount(appsRes.data.length);
      setUsers(usersRes.data);
    } catch (e) { 
      console.error('Failed to fetch admin stats:', e);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDeleteUser = async (id) => {
    if(!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await api.delete(`/auth/users/${id}`);
      toast.success('User deleted');
      fetchData();
    } catch(err) {
      toast.error('Failed to delete user');
    }
  };

  const handleDeleteJob = async (id) => {
    if(!window.confirm('Are you sure you want to delete this job?')) return;
    try {
      await api.delete(`/jobs/${id}`);
      toast.success('Job deleted');
      fetchData();
    } catch(err) {
      toast.error('Failed to delete job');
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-4 md:p-8 flex-grow">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Admin Dashboard</h1>
        <p className="text-slate-600 dark:text-slate-300 mt-1">System Overview and Analytics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-[0_2px_15px_rgb(0,0,0,0.03)] border border-slate-100 dark:border-slate-700 flex items-center gap-6">
          <div className="bg-primary-50 text-primary-600 p-4 rounded-2xl">
            <Briefcase className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-slate-500 font-medium mb-1">Total Active Jobs</h3>
            <p className="text-3xl font-bold text-slate-800 dark:text-white">{jobs.length}</p>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-[0_2px_15px_rgb(0,0,0,0.03)] border border-slate-100 dark:border-slate-700 flex items-center gap-6">
          <div className="bg-emerald-50 text-emerald-600 p-4 rounded-2xl">
            <FileText className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-slate-500 font-medium mb-1">Total Applications</h3>
            <p className="text-3xl font-bold text-slate-800 dark:text-white">{applicationsCount}</p>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-[0_2px_15px_rgb(0,0,0,0.03)] border border-slate-100 dark:border-slate-700 flex items-center gap-6">
          <div className="bg-indigo-50 text-indigo-600 p-4 rounded-2xl">
            <Users className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-slate-500 font-medium mb-1">Registered Users</h3>
            <p className="text-3xl font-bold text-slate-800 dark:text-white">{users.length}</p>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Users Table */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-[0_2px_15px_rgb(0,0,0,0.03)] border border-slate-100 dark:border-slate-700 overflow-hidden flex flex-col max-h-[600px]">
          <div className="p-6 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50/50">
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">System Users</h2>
          </div>
          <div className="overflow-y-auto overflow-x-auto p-0">
            <table className="w-full min-w-[600px] text-left text-sm text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-800/50 sticky top-0">
                <tr>
                  <th className="px-6 py-3 font-semibold text-slate-800 dark:text-white">Name</th>
                  <th className="px-6 py-3 font-semibold text-slate-800 dark:text-white">Role</th>
                  <th className="px-6 py-3 font-semibold text-slate-800 dark:text-white text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map(u => (
                  <tr key={u._id} className="hover:bg-slate-50 dark:bg-slate-800/50">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-800 dark:text-white">{u.name}</div>
                      <div className="text-xs text-slate-400">{u.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-md text-xs font-medium capitalize ${u.role === 'admin' ? 'bg-indigo-50 text-indigo-600' : u.role === 'company' ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => handleDeleteUser(u._id)} disabled={u.role === 'admin'} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan="3" className="px-6 py-8 text-center text-slate-500">No users found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Jobs Table */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-[0_2px_15px_rgb(0,0,0,0.03)] border border-slate-100 dark:border-slate-700 overflow-hidden flex flex-col max-h-[600px]">
          <div className="p-6 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50/50">
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">Active Jobs</h2>
          </div>
          <div className="overflow-y-auto overflow-x-auto p-0">
            <table className="w-full min-w-[600px] text-left text-sm text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-800/50 sticky top-0">
                <tr>
                  <th className="px-6 py-3 font-semibold text-slate-800 dark:text-white">Job Title</th>
                  <th className="px-6 py-3 font-semibold text-slate-800 dark:text-white">Company</th>
                  <th className="px-6 py-3 font-semibold text-slate-800 dark:text-white text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {jobs.map(j => (
                  <tr key={j._id} className="hover:bg-slate-50 dark:bg-slate-800/50">
                    <td className="px-6 py-4 font-medium text-slate-800 dark:text-white">{j.title}</td>
                    <td className="px-6 py-4">{j.company?.companyName || 'Unknown'}</td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => handleDeleteJob(j._id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                {jobs.length === 0 && (
                  <tr>
                    <td colSpan="3" className="px-6 py-8 text-center text-slate-500">No active jobs found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
