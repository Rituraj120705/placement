import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { toast } from 'react-toastify';
import { PlusCircle, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';

const CompanyDashboard = () => {
  const [jobs, setJobs] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ 
    title: '', description: '', location: '', salary: '', 
    type: 'full-time', deadline: '', cgpa: '', skills: '', 
    compensationDetails: '', material: null 
  });

  // Applicant management state
  const [showApplicantsModal, setShowApplicantsModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [individualMessage, setIndividualMessage] = useState({ appId: null, text: '' });

  // Confirm delete state
  const [confirmDeleteJobId, setConfirmDeleteJobId] = useState(null);

  useEffect(() => {
    fetchMyJobs();
  }, []);

  const fetchMyJobs = async () => {
    try {
      const { data } = await api.get('/jobs/company/me');
      setJobs(data);
    } catch (err) { }
  };

  const handleCreateJob = async (e) => {
    e.preventDefault();
    try {
      const submitData = new FormData();
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null && formData[key] !== '') {
          submitData.append(key, formData[key]);
        }
      });

      await api.post('/jobs', submitData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Job Created Successfully!');
      setShowModal(false);
      setFormData({ 
        title: '', description: '', location: '', salary: '', 
        type: 'full-time', deadline: '', cgpa: '', skills: '', 
        compensationDetails: '', material: null 
      });
      fetchMyJobs();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create job');
    }
  };

  const handleDeleteJob = async (jobId) => {
    try {
      await api.delete(`/jobs/${jobId}`);
      toast.success('Job post deleted successfully.');
      setJobs(jobs.filter(j => j._id !== jobId));
      setConfirmDeleteJobId(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete job');
    }
  };

  const handleToggleStatus = async (job) => {
    const action = job.status === 'open' ? 'close' : 'reopen';
    try {
      const { data } = await api.put(`/jobs/${job._id}/toggle-status`);
      toast.success(`Applications ${data.status === 'open' ? 'reopened' : 'closed'} for "${job.title}".`);
      setJobs(jobs.map(j => j._id === job._id ? { ...j, status: data.status } : j));
    } catch (err) {
      toast.error(err.response?.data?.message || `Failed to ${action} applications`);
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

  const handleSendIndividualMessage = async (appId) => {
    if (!individualMessage.text.trim()) return toast.error('Message cannot be empty');
    try {
      const { data } = await api.post(`/applications/${appId}/message`, { message: individualMessage.text });
      toast.success(data.message);
      setIndividualMessage({ appId: null, text: '' });
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
      
      {/* Create Job Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar">
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Employment Type</label>
                  <select className="input-field px-4 py-2 border rounded-lg w-full focus:ring-2 focus:ring-primary-500 outline-none bg-white dark:bg-slate-800" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                    <option value="full-time">Full-time</option>
                    <option value="part-time">Part-time</option>
                    <option value="internship">Internship</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Last Date to Apply</label>
                  <input type="date" required className="input-field px-4 py-2 border rounded-lg w-full focus:ring-2 focus:ring-primary-500 outline-none bg-white dark:bg-slate-800" value={formData.deadline} onChange={e => setFormData({...formData, deadline: e.target.value})} />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Min CGPA Criteria</label>
                  <input type="number" step="0.1" min="0" max="10" className="input-field px-4 py-2 border rounded-lg w-full focus:ring-2 focus:ring-primary-500 outline-none" value={formData.cgpa} onChange={e => setFormData({...formData, cgpa: e.target.value})} placeholder="e.g. 7.5" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Required Skills (comma separated)</label>
                  <input type="text" className="input-field px-4 py-2 border rounded-lg w-full focus:ring-2 focus:ring-primary-500 outline-none" value={formData.skills} onChange={e => setFormData({...formData, skills: e.target.value})} placeholder="React, Node.js, Python" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Detailed Compensation Info</label>
                  <textarea className="input-field px-4 py-2 border rounded-lg w-full h-20 resize-none focus:ring-2 focus:ring-primary-500 outline-none text-sm" value={formData.compensationDetails} onChange={e => setFormData({...formData, compensationDetails: e.target.value})} placeholder="e.g. ₹40k Stipend, 12 LPA post-internship" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Supporting Material (PDF/Word)</label>
                  <input type="file" accept=".pdf,.doc,.docx" className="input-field px-4 py-2 border rounded-lg w-full focus:ring-2 focus:ring-primary-500 outline-none text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100" onChange={e => setFormData({...formData, material: e.target.files[0]})} />
                  <p className="text-[10px] text-slate-500 mt-1">Provide a brochure or detailed JD document (Max 10MB).</p>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-700">
                <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 text-slate-600 dark:text-slate-300 font-medium hover:bg-slate-100 rounded-lg transition-colors">Cancel</button>
                <button type="submit" className="btn-primary py-2.5 px-6">Publish Job</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Applicants Modal */}
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
                  <div key={app._id} className="py-4 flex flex-col gap-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
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
                        {app.coverLetter && (
                          <p className="text-sm text-slate-700 dark:text-slate-300 mt-2 italic bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg border border-slate-100 dark:border-slate-700">"{app.coverLetter}"</p>
                        )}
                        <div className="flex flex-wrap gap-2 mt-3">
                          {app.tenthMarksheet && <a href={`http://localhost:5000${app.tenthMarksheet}`} target="_blank" rel="noopener noreferrer" className="text-xs px-3 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-md font-semibold transition-colors">10th Marksheet</a>}
                          {app.twelfthMarksheet && <a href={`http://localhost:5000${app.twelfthMarksheet}`} target="_blank" rel="noopener noreferrer" className="text-xs px-3 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-md font-semibold transition-colors">12th Marksheet</a>}
                          {app.collegeMarksheet && <a href={`http://localhost:5000${app.collegeMarksheet}`} target="_blank" rel="noopener noreferrer" className="text-xs px-3 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-md font-semibold transition-colors">College Marksheet</a>}
                          {app.certificates && <a href={`http://localhost:5000${app.certificates}`} target="_blank" rel="noopener noreferrer" className="text-xs px-3 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-md font-semibold transition-colors">Certificates</a>}
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-2 items-end">
                        {app.status === 'pending' && (
                          <div className="flex gap-2 items-center">
                            {new Date(selectedJob?.deadline) > new Date() ? (
                              <span className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded">Wait until deadline passes to shortlist</span>
                            ) : (
                              <button onClick={() => updateStatus(app._id, 'shortlisted')} className="px-3 py-1.5 bg-emerald-50 text-emerald-600 text-sm font-semibold rounded-lg hover:bg-emerald-100 transition-colors">Shortlist</button>
                            )}
                            <button onClick={() => updateStatus(app._id, 'rejected')} className="px-3 py-1.5 bg-red-50 text-red-600 text-sm font-semibold rounded-lg hover:bg-red-100 transition-colors">Reject</button>
                          </div>
                        )}
                        <button onClick={() => setIndividualMessage({ appId: individualMessage.appId === app._id ? null : app._id, text: '' })} className="px-3 py-1.5 bg-indigo-50 text-indigo-600 text-sm font-semibold rounded-lg hover:bg-indigo-100 transition-colors">
                          {individualMessage.appId === app._id ? 'Cancel Message' : 'Message Student'}
                        </button>
                      </div>
                    </div>
                    {/* Individual Message Wrapper */}
                    {individualMessage.appId === app._id && (
                      <div className="w-full p-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl mt-2 animate-fade-in-up">
                        <textarea 
                          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none resize-none h-20 mb-3 text-sm flex-grow bg-white dark:bg-slate-800 dark:text-white"
                          placeholder={`Type individual message to ${app.applicant?.name || 'student'}...`}
                          value={individualMessage.text}
                          onChange={e => setIndividualMessage({...individualMessage, text: e.target.value})}
                        />
                        <div className="flex justify-end relative">
                          <button onClick={() => handleSendIndividualMessage(app._id)} className="btn-primary py-1.5 px-5 text-sm font-semibold">
                            Send
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
            
            {/* Message shortlisted students */}
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

      {/* Delete Confirmation Dialog */}
      {confirmDeleteJobId && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 w-full max-w-md shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5 text-red-600" />
              </div>
              <h2 className="text-xl font-bold text-slate-800 dark:text-white">Delete Job Post?</h2>
            </div>
            <p className="text-slate-600 dark:text-slate-300 mb-6">
              This will <strong>permanently delete</strong> the job posting and all associated applications. This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setConfirmDeleteJobId(null)} className="px-5 py-2.5 text-slate-600 dark:text-slate-300 font-medium hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
                Cancel
              </button>
              <button onClick={() => handleDeleteJob(confirmDeleteJobId)} className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors">
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Job list */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-[0_2px_15px_rgb(0,0,0,0.03)] border border-slate-100 dark:border-slate-700 overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">Your Job Postings</h2>
        </div>
        <div className="divide-y divide-slate-100 dark:divide-slate-700">
          {jobs.map(job => (
            <div key={job._id} className="p-6 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-lg text-slate-900 dark:text-white">{job.title}</h3>
                    <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${job.status === 'open' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'}`}>
                      {job.status === 'open' ? 'Open' : 'Closed'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm text-slate-500 font-medium">{job.location}</span>
                    <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                    <span className="text-sm text-slate-500 capitalize">{job.type}</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 items-center">
                  <button onClick={() => openApplicantsModal(job)} className="text-primary-600 font-semibold text-sm bg-primary-50 hover:bg-primary-100 py-2 px-4 rounded-lg transition-colors">
                    Manage Applicants
                  </button>
                  <button
                    onClick={() => handleToggleStatus(job)}
                    title={job.status === 'open' ? 'Close Applications' : 'Reopen Applications'}
                    className={`flex items-center gap-1.5 font-semibold text-sm py-2 px-4 rounded-lg transition-colors ${job.status === 'open' ? 'bg-amber-50 text-amber-700 hover:bg-amber-100' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'}`}
                  >
                    {job.status === 'open' ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                    {job.status === 'open' ? 'Close Applications' : 'Reopen Applications'}
                  </button>
                  <button
                    onClick={() => setConfirmDeleteJobId(job._id)}
                    title="Delete job post"
                    className="flex items-center gap-1.5 font-semibold text-sm py-2 px-4 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
          {jobs.length === 0 && <div className="p-10 text-center text-slate-500">You haven't posted any jobs yet.</div>}
        </div>
      </div>
    </div>
  );
};

export default CompanyDashboard;
