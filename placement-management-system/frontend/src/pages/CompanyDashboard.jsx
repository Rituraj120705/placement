import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { toast } from 'react-toastify';
import { PlusCircle } from 'lucide-react';

const CompanyDashboard = () => {
  const [jobs, setJobs] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ title: '', description: '', location: '', salary: '', type: 'full-time' });

  // Applicant management state
  const [showApplicantsModal, setShowApplicantsModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [messageText, setMessageText] = useState('');

  useEffect(() => {
    fetchMyJobs();
  }, []);

  const fetchMyJobs = async () => {
    try {
      const { data } = await api.get('/jobs');
      setJobs(data);
    } catch (err) { }
  };

  const handleCreateJob = async (e) => {
    e.preventDefault();
    try {
      await api.post('/jobs', formData);
      toast.success('Job Created Successfully!');
      setShowModal(false);
      setFormData({ title: '', description: '', location: '', salary: '', type: 'full-time' });
      fetchMyJobs();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create job');
    }
  };

  const openApplicantsModal = async (job) => {
    setSelectedJob(job);
    setShowApplicantsModal(true);
    try {
      const { data } = await api.get(`/applications/job/${job._id}`);
      setApplicants(data);
    } catch(err) {
      toast.error('Failed to load applicants');
    }
  };

  const updateStatus = async (appId, status) => {
    try {
      await api.put(`/applications/${appId}/status`, { status });
      toast.success(`Application marked as ${status}`);
      setApplicants(applicants.map(app => app._id === appId ? { ...app, status } : app));
    } catch(err) {
      toast.error('Failed to update status');
    }
  };

  const handleSendMessage = async () => {
    if (!messageText.trim()) return toast.error('Message cannot be empty');
    try {
      const { data } = await api.post(`/applications/job/${selectedJob._id}/message-shortlisted`, { message: messageText });
      toast.success(data.message);
      setMessageText('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send message');
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-4 md:p-8 flex-grow">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Company Dashboard</h1>
          <p className="text-slate-600 dark:text-slate-300 mt-1">Manage your job postings and applicants</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2 py-2.5 px-5">
          <PlusCircle className="w-5 h-5" /> Post New Job
        </button>
      </div>
      
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 w-full max-w-xl shadow-2xl">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-6">Create Job Posting</h2>
            <form onSubmit={handleCreateJob} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Job Title</label>
                <input type="text" required className="input-field px-4 py-2 border rounded-lg w-full focus:ring-2 focus:ring-primary-500 outline-none" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="e.g. Frontend Developer" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Description</label>
                <textarea required className="input-field px-4 py-2 border rounded-lg w-full h-32 resize-none focus:ring-2 focus:ring-primary-500 outline-none" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Describe the role..." />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Location</label>
                  <input type="text" required className="input-field px-4 py-2 border rounded-lg w-full focus:ring-2 focus:ring-primary-500 outline-none" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} placeholder="Remote, NYC, etc." />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Salary</label>
                  <input type="text" className="input-field px-4 py-2 border rounded-lg w-full focus:ring-2 focus:ring-primary-500 outline-none" value={formData.salary} onChange={e => setFormData({...formData, salary: e.target.value})} placeholder="e.g. $80k - $100k" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Employment Type</label>
                <select className="input-field px-4 py-2 border rounded-lg w-full focus:ring-2 focus:ring-primary-500 outline-none bg-white dark:bg-slate-800" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                  <option value="full-time">Full-time</option>
                  <option value="part-time">Part-time</option>
                  <option value="internship">Internship</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-700">
                <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 text-slate-600 dark:text-slate-300 font-medium hover:bg-slate-100 rounded-lg transition-colors">Cancel</button>
                <button type="submit" className="btn-primary py-2.5 px-6">Publish Job</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showApplicantsModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 w-full max-w-3xl shadow-2xl max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Applicants - {selectedJob?.title}</h2>
              <button onClick={() => setShowApplicantsModal(false)} className="text-slate-500 hover:text-slate-700 dark:text-slate-200 font-semibold px-4 py-2 bg-slate-100 rounded-lg">Close</button>
            </div>
            <div className="overflow-y-auto flex-grow divide-y divide-slate-100">
              {applicants.length === 0 ? (
                <p className="text-slate-500 text-center py-10">No applicants yet.</p>
              ) : (
                applicants.map(app => (
                  <div key={app._id} className="py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <h3 className="font-bold text-lg text-slate-800 dark:text-white">{app.applicant?.name || 'Unknown User'}</h3>
                      <p className="text-sm text-slate-600 dark:text-slate-300">{app.applicant?.email || 'N/A'} • {app.applicant?.major || 'N/A'} {app.applicant?.graduationYear ? `(${app.applicant.graduationYear})` : ''}</p>
                      {app.applicant?.skills?.length > 0 && (
                        <p className="text-xs text-slate-500 mt-1">Skills: {app.applicant.skills.join(', ')}</p>
                      )}
                      <p className="text-xs font-semibold mt-2 capitalize">Status: 
                        <span className={`ml-1 ${app.status === 'pending' ? 'text-amber-500' : app.status === 'rejected' ? 'text-red-500' : 'text-emerald-500'}`}>
                          {app.status}
                        </span>
                      </p>
                    </div>
                    {app.status === 'pending' && (
                      <div className="flex gap-2">
                        <button onClick={() => updateStatus(app._id, 'shortlisted')} className="px-3 py-1.5 bg-emerald-50 text-emerald-600 text-sm font-semibold rounded-lg hover:bg-emerald-100 transition-colors">Shortlist</button>
                        <button onClick={() => updateStatus(app._id, 'rejected')} className="px-3 py-1.5 bg-red-50 text-red-600 text-sm font-semibold rounded-lg hover:bg-red-100 transition-colors">Reject</button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
            
            {/* New section for messaging shortlisted students */}
            <div className="mt-8 pt-6 border-t border-slate-200 shrink-0">
              <h3 className="font-bold text-lg text-slate-800 dark:text-white mb-2">Message Shortlisted Students</h3>
              <p className="text-sm text-slate-500 mb-4">Send an update, interview link, or announcement directly to everyone you have shortlisted for this role.</p>
              <textarea 
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none resize-none h-24 mb-3"
                placeholder="Type your message here..."
                value={messageText}
                onChange={e => setMessageText(e.target.value)}
              />
              <button onClick={handleSendMessage} className="btn-primary py-2.5 px-6 float-right font-semibold">
                Send Notification
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-[0_2px_15px_rgb(0,0,0,0.03)] border border-slate-100 dark:border-slate-700 overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50/50">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">Your Active Postings</h2>
        </div>
        <div className="divide-y divide-slate-100">
          {jobs.map(job => (
            <div key={job._id} className="p-6 hover:bg-slate-50 dark:bg-slate-800/50 transition-colors flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="font-bold text-lg text-slate-900">{job.title}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm text-slate-500 font-medium">{job.location}</span>
                  <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                  <span className="text-sm text-slate-500 capitalize">{job.type}</span>
                </div>
              </div>
              <button onClick={() => openApplicantsModal(job)} className="text-primary-600 font-semibold text-sm bg-primary-50 hover:bg-primary-100 py-2 px-4 rounded-lg transition-colors">
                Manage Applicants
              </button>
            </div>
          ))}
          {jobs.length === 0 && <div className="p-10 text-center text-slate-500">You haven't posted any jobs yet.</div>}
        </div>
      </div>
    </div>
  );
};

export default CompanyDashboard;
