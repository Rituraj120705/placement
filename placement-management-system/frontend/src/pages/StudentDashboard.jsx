import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuthStore } from '../store/useAuthStore';
import { Briefcase, Building, MapPin, DollarSign, CheckCircle, Clock } from 'lucide-react';
import { toast } from 'react-toastify';

const StudentDashboard = () => {
  const { user } = useAuthStore();
  const [jobs, setJobs] = useState([]);
  const [myApplications, setMyApplications] = useState([]);
  const [fullApplications, setFullApplications] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);

  useEffect(() => {
    fetchJobs();
    fetchMyApplications();
  }, []);

  const fetchJobs = async () => {
    try {
      const { data } = await api.get('/jobs');
      const activeJobs = data.filter(job => {
        if (!job.deadline) return true; // fallback
        const deadline = new Date(job.deadline);
        deadline.setHours(23, 59, 59, 999);
        return deadline >= new Date();
      });
      setJobs(activeJobs);
    } catch (err) {
      toast.error('Failed to load jobs');
    }
  };

  const fetchMyApplications = async () => {
    try {
      const { data } = await api.get('/applications/my');
      setMyApplications(data.map(app => app.job?._id).filter(Boolean));
      setFullApplications(data);
    } catch (err) {
      console.error(err);
    }
  };

  const applyForJob = async (jobId) => {
    try {
      await api.post(`/applications/${jobId}`, { coverLetter: 'Interested in this role.' });
      toast.success('Successfully applied!');
      fetchMyApplications();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to apply');
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-4 md:p-8 flex-grow">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Welcome, {user?.name}</h1>
        <p className="text-slate-600 dark:text-slate-300 mt-1">Here are the latest job opportunities.</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {jobs.map(job => (
          <div key={job._id} className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-[0_2px_15px_rgb(0,0,0,0.03)] border border-slate-100 dark:border-slate-700 flex flex-col h-full hover:shadow-[0_2px_20px_rgb(0,0,0,0.06)] transition-all">
            <div className="flex justify-between items-start mb-4">
              <div className="bg-primary-50 p-3 rounded-xl text-primary-600">
                <Briefcase className="w-6 h-6" />
              </div>
              <span className="px-3 py-1 bg-slate-50 text-slate-600 dark:text-slate-300 border border-slate-200 text-xs font-semibold rounded-full capitalize">
                {job.type}
              </span>
            </div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-white line-clamp-1">{job.title}</h3>
            <div className="flex items-center text-slate-500 mt-2 gap-2 text-sm font-medium">
              <Building className="w-4 h-4" /> {job.company?.companyName || 'Unknown Company'}
            </div>
            
            <div className="mt-4 space-y-2 flex-grow">
              <div className="flex items-center text-slate-600 dark:text-slate-300 text-sm gap-2">
                <MapPin className="w-4 h-4 text-slate-400" /> {job.location}
              </div>
              <div className="flex items-center text-slate-600 dark:text-slate-300 text-sm gap-2">
                <DollarSign className="w-4 h-4 text-slate-400" /> {job.salary || 'Not specified'}
              </div>
              {job.deadline && (
                <div className="flex items-center text-amber-600 text-sm gap-2 font-medium pb-1 mt-1">
                  <Clock className="w-4 h-4" /> Apply by {new Date(job.deadline).toLocaleDateString()}
                </div>
              )}
              <p className="mt-4 text-sm text-slate-500 line-clamp-3 leading-relaxed">{job.description}</p>
            </div>
            
            <button
              onClick={() => setSelectedJob(job)}
              className="w-full mt-6 py-3 rounded-xl font-medium transition-all bg-primary-50 text-primary-600 hover:bg-primary-600 hover:text-white hover:shadow-lg hover:shadow-primary-500/30"
            >
              View Details
            </button>
          </div>
        ))}

        {jobs.length === 0 && (
          <div className="col-span-full py-20 text-center">
             <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
               <Briefcase className="w-10 h-10 text-slate-400" />
             </div>
             <h3 className="text-lg font-bold text-slate-800 dark:text-white">No active jobs found</h3>
             <p className="text-slate-500 mt-1">Check back later for new opportunities!</p>
          </div>
        )}
      </div>

      {/* My Applications Section */}
      <div className="mt-16 mb-8 pt-8 border-t border-slate-200">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">My Applications & Updates</h2>
        <p className="text-slate-600 dark:text-slate-300 mt-1">Track your application status and messages from companies.</p>
      </div>
      
      <div className="space-y-6">
        {fullApplications.length === 0 ? (
           <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 border border-slate-100 dark:border-slate-700 text-center text-slate-500">You haven't applied to any jobs yet.</div>
        ) : fullApplications.map(app => (
           <div key={app._id} className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-[0_2px_15px_rgb(0,0,0,0.03)] border border-slate-100 dark:border-slate-700">
             <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
               <div>
                  <h3 className="text-lg font-bold text-slate-800 dark:text-white">{app.job?.title}</h3>
                  <p className="text-primary-600 font-medium">{app.job?.company?.companyName || 'Company'}</p>
               </div>
               <span className={`px-4 py-1.5 rounded-full text-sm font-bold capitalize ${app.status === 'pending' ? 'bg-amber-50 text-amber-600' : app.status === 'rejected' ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
                 {app.status}
               </span>
             </div>
             
             {/* Company Updates list */}
             {app.updates && app.updates.length > 0 && (
               <div className="mt-6 bg-slate-50 rounded-xl p-5 border border-slate-200">
                 <h4 className="font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2 pt-1"><CheckCircle className="w-5 h-5 text-primary-500" /> Messages from Company</h4>
                 <div className="space-y-4">
                   {app.updates.map((update, idx) => (
                     <div key={idx} className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 relative">
                       <span className="text-xs font-semibold text-slate-400 absolute top-5 right-5">{new Date(update.date).toLocaleDateString()}</span>
                       <p className="text-slate-700 dark:text-slate-200 leading-relaxed pr-24 whitespace-pre-wrap">{update.message}</p>
                     </div>
                   ))}
                 </div>
               </div>
             )}
           </div>
        ))}
      </div>

      {/* Job Details Modal */}
      {selectedJob && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar relative animate-fade-in-up">
            <button onClick={() => setSelectedJob(null)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
            
            <div className="mb-6 pr-8">
              <h2 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">{selectedJob.title}</h2>
              <p className="text-xl text-primary-600 font-medium">{selectedJob.company?.companyName || 'Unknown Company'}</p>
            </div>

            <div className="flex flex-wrap gap-4 mb-6">
              <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-sm font-semibold rounded-full capitalize">{selectedJob.type}</span>
              <span className="px-3 py-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm font-medium rounded-full flex items-center gap-1"><MapPin className="w-4 h-4"/> {selectedJob.location}</span>
              <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-sm font-medium rounded-full flex items-center gap-1"><DollarSign className="w-4 h-4"/> {selectedJob.salary || 'Not specified'}</span>
              {selectedJob.deadline && (
                <span className="px-3 py-1 bg-amber-50 text-amber-600 text-sm font-medium rounded-full flex items-center gap-1"><Clock className="w-4 h-4"/> Apply by {new Date(selectedJob.deadline).toLocaleDateString()}</span>
              )}
            </div>

            <div className="space-y-6 text-slate-600 dark:text-slate-300">
              <div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">Description / Requirements</h3>
                <p className="leading-relaxed whitespace-pre-wrap text-sm">{selectedJob.description}</p>
              </div>

              {(selectedJob.cgpa || selectedJob.skills) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-slate-50 dark:bg-slate-900/50 p-5 rounded-xl border border-slate-100 dark:border-slate-700">
                  {selectedJob.cgpa && (
                    <div>
                      <h4 className="text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">Min CGPA</h4>
                      <p className="text-lg font-semibold text-slate-800 dark:text-white">{selectedJob.cgpa}</p>
                    </div>
                  )}
                  {selectedJob.skills && (
                    <div>
                      <h4 className="text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">Skills Required</h4>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {selectedJob.skills.split(',').map((skill, idx) => (
                          <span key={idx} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 text-[10px] font-bold uppercase tracking-wide px-2 py-1 rounded-md">{skill.trim()}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {selectedJob.compensationDetails && (
                <div>
                  <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">Detailed Compensation</h3>
                  <p className="leading-relaxed whitespace-pre-wrap text-sm bg-emerald-50/50 dark:bg-emerald-900/10 p-4 rounded-xl border border-emerald-100 dark:border-emerald-800/30 text-emerald-800 dark:text-emerald-300">{selectedJob.compensationDetails}</p>
                </div>
              )}

              {selectedJob.material && (
                <div>
                   <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-3">Supporting Material</h3>
                   <a href={`http://localhost:5000${selectedJob.material}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-5 py-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold rounded-xl transition-colors">
                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                     View Attached Document
                   </a>
                </div>
              )}
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-700 flex flex-col sm:flex-row gap-4">
              <button onClick={() => setSelectedJob(null)} className="px-6 py-3 text-slate-600 dark:text-slate-300 font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors">Close</button>
              <button
                onClick={() => {
                  applyForJob(selectedJob._id);
                  setSelectedJob(null);
                }}
                disabled={myApplications.includes(selectedJob._id)}
                className={`flex-grow py-3 rounded-xl font-bold transition-all ${
                  myApplications.includes(selectedJob._id)
                    ? 'bg-emerald-50 text-emerald-600 border border-emerald-200 cursor-not-allowed flex justify-center items-center gap-2'
                    : 'bg-primary-600 text-white hover:bg-primary-700 hover:shadow-lg hover:shadow-primary-500/30'
                }`}
              >
                {myApplications.includes(selectedJob._id) ? <><CheckCircle className="w-5 h-5"/> Applied</> : 'Apply for this Job'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default StudentDashboard;
