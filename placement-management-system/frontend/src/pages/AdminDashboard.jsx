import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { Briefcase, Users, FileText, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'react-toastify';

const AdminDashboard = () => {
  const [jobs, setJobs] = useState([]);
  const [users, setUsers] = useState([]);
  const [applications, setApplications] = useState([]);
  const [pendingCompanies, setPendingCompanies] = useState([]);
  const [expandedCompany, setExpandedCompany] = useState(null);

  const applicationsCount = applications.length;
  
  const fetchData = async () => {
    try {
      const [jobsRes, appsRes, usersRes, pendingRes] = await Promise.all([
        api.get('/jobs'),
        api.get('/applications'),
        api.get('/auth/users'),
        api.get('/auth/pending-companies'),
      ]);
      setJobs(jobsRes.data);
      setApplications(appsRes.data);
      setUsers(usersRes.data);
      setPendingCompanies(pendingRes.data);
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

  const handleApproveCompany = async (id) => {
    try {
      await api.put(`/auth/approve-company/${id}`);
      toast.success('Company approved successfully!');
      fetchData();
    } catch (err) {
      toast.error('Failed to approve company');
    }
  };

  const handleRejectCompany = async (id) => {
    if(!window.confirm('Are you sure you want to reject and delete this company registration?')) return;
    try {
      await api.delete(`/auth/users/${id}`);
      toast.success('Company rejected successfully');
      fetchData();
    } catch(err) {
      toast.error('Failed to reject company');
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

  const handleToggleApproval = async (id, isCurrentlyApproved) => {
    try {
      if (isCurrentlyApproved) {
        if(!window.confirm('Are you sure you want to revoke access for this company? They will be unable to login.')) return;
        await api.put(`/auth/revoke-company/${id}`);
        toast.success('Company access revoked (Blocked)');
      } else {
        await api.put(`/auth/approve-company/${id}`);
        toast.success('Company access restored (Approved)');
      }
      fetchData();
    } catch (err) {
      toast.error('Failed to update company status');
    }
  };

  // Group shortlisted applications by company
  const shortlistedByCompany = applications
    .filter(app => app.status === 'shortlisted')
    .reduce((acc, app) => {
      const companyId = app.job?.company?._id || 'unknown';
      const companyName = app.job?.company?.companyName || 'Unknown Company';
      if (!acc[companyId]) {
        acc[companyId] = {
          companyName,
          companyId,
          students: []
        };
      }
      acc[companyId].students.push({
        applicationId: app._id,
        applicantName: app.applicant?.name || 'Unknown',
        applicantEmail: app.applicant?.email || 'N/A',
        jobTitle: app.job?.title || 'Unknown Job',
        updates: app.updates || []
      });
      return acc;
    }, {});

  const shortlistedCompaniesList = Object.values(shortlistedByCompany);

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

      {pendingCompanies.length > 0 && (
        <div className="mb-10">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-6">Pending Company Approvals</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pendingCompanies.map(company => (
              <div key={company._id} className="bg-amber-50 dark:bg-amber-900/10 p-6 rounded-2xl border border-amber-200 dark:border-amber-800/30 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow">
                <div className="mb-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="bg-amber-100 p-2 rounded-lg text-amber-600">
                      <Briefcase className="w-5 h-5" />
                    </div>
                    <h3 className="text-xl font-bold text-amber-900 dark:text-amber-400">{company.companyName || company.name}</h3>
                  </div>
                  <p className="text-sm font-medium text-amber-800 dark:text-amber-500">{company.email}</p>
                  {company.companyDescription && <p className="text-sm text-amber-700/80 mt-2 line-clamp-2">{company.companyDescription}</p>}
                </div>
                <div className="flex gap-3 mt-4">
                  <button onClick={() => handleApproveCompany(company._id)} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl transition-all shadow-sm hover:shadow-md active:scale-95 text-sm">
                    Approve
                  </button>
                  <button onClick={() => handleRejectCompany(company._id)} className="flex-1 bg-rose-100 hover:bg-rose-200 text-rose-700 font-bold py-2.5 rounded-xl transition-all shadow-sm hover:shadow-md active:scale-95 text-sm">
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
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
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded-md text-xs font-medium capitalize ${u.role === 'admin' ? 'bg-indigo-50 text-indigo-600' : u.role === 'company' ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'}`}>
                          {u.role}
                        </span>
                        {u.role === 'company' && (
                          <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${u.isApproved ? 'border-emerald-200 text-emerald-600 bg-emerald-50' : 'border-rose-200 text-rose-600 bg-rose-50'}`}>
                            {u.isApproved ? 'Approved' : 'Blocked'}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end items-center gap-2">
                        {u.role === 'company' && (
                          <button 
                            onClick={() => handleToggleApproval(u._id, u.isApproved)}
                            className={`px-3 py-1 text-xs font-bold rounded-md transition-colors ${u.isApproved ? 'bg-rose-50 text-rose-600 hover:bg-rose-100' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'}`}
                          >
                            {u.isApproved ? 'Revoke Access' : 'Approve Access'}
                          </button>
                        )}
                        <button onClick={() => handleDeleteUser(u._id)} disabled={u.role === 'admin'} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
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

      {/* Shortlisted Students by Company Section */}
      <div className="mt-8 bg-white dark:bg-slate-800 rounded-2xl shadow-[0_2px_15px_rgb(0,0,0,0.03)] border border-slate-100 dark:border-slate-700 overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">Shortlisted Students by Company</h2>
        </div>
        <div className="p-0">
          {shortlistedCompaniesList.length === 0 ? (
            <div className="p-8 text-center text-slate-500">No students have been shortlisted yet.</div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-700">
              {shortlistedCompaniesList.map((company) => (
                <div key={company.companyId} className="flex flex-col">
                  {/* Company Row */}
                  <div className="flex items-center justify-between p-6 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-800 dark:text-white">{company.companyName}</h3>
                      <p className="text-sm text-slate-500">{company.students.length} Student(s) Shortlisted</p>
                    </div>
                    <button
                      onClick={() => setExpandedCompany(expandedCompany === company.companyId ? null : company.companyId)}
                      className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-600 dark:hover:bg-slate-700 transition-colors"
                    >
                      {expandedCompany === company.companyId ? (
                        <>Hide Students <ChevronUp className="w-4 h-4" /></>
                      ) : (
                        <>View Students <ChevronDown className="w-4 h-4" /></>
                      )}
                    </button>
                  </div>
                  
                  {/* Expanded Students List */}
                  {expandedCompany === company.companyId && (
                    <div className="bg-slate-50/50 dark:bg-slate-900/50 p-6 border-t border-slate-100 dark:border-slate-700">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {company.students.map((student) => (
                          <div key={student.applicationId} className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col gap-1 relative group">
                            <div className="flex justify-between items-start mb-1">
                              <div>
                                <span className="font-semibold text-slate-800 dark:text-white block">{student.applicantName}</span>
                                <span className="text-xs text-slate-500">{student.applicantEmail}</span>
                              </div>
                              <div className="text-xs px-2 py-1 bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300 rounded-md inline-block whitespace-nowrap ml-2">
                                {student.jobTitle}
                              </div>
                            </div>
                            
                            {/* Messages sent to this student */}
                            {student.updates && student.updates.length > 0 && (
                              <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700">
                                <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-2 block">Messages Sent ({student.updates.length}):</span>
                                <div className="space-y-2 max-h-32 overflow-y-auto pr-2 custom-scrollbar">
                                  {student.updates.map((update, idx) => (
                                    <div key={idx} className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg text-xs border border-slate-100 dark:border-slate-700">
                                      <span className="text-[10px] text-slate-400 block mb-1 font-medium">{new Date(update.date).toLocaleDateString()} - {new Date(update.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                      <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">{update.message}</p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
