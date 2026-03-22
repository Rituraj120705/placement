import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, User, BriefcaseBusiness, TrendingUp, CheckCircle, Sparkles, Clock, MapPin, DollarSign } from 'lucide-react';
import api from '../api/axios';
import { useAuthStore } from '../store/useAuthStore';

const Home = () => {
  const [jobs, setJobs] = useState([]);
  const [visibleJobsCount, setVisibleJobsCount] = useState(3);
  const [selectedJob, setSelectedJob] = useState(null);
  const { isAuthenticated, user } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await api.get('/jobs');
        const activeJobs = res.data.filter(j => {
          if (j.status !== 'open') return false;
          if (!j.deadline) return true; // fallback if deadline missing
          const deadline = new Date(j.deadline);
          deadline.setHours(23, 59, 59, 999);
          return deadline >= new Date();
        });
        setJobs(activeJobs);
      } catch (error) {
        console.error("Failed to fetch jobs", error);
      }
    };
    fetchJobs();
  }, []);

  const handleApplyClick = () => {
    if (!isAuthenticated) {
      navigate('/login');
    } else if (user?.role === 'student') {
      navigate('/student/dashboard');
    } else {
      navigate(`/${user.role}/dashboard`);
    }
  };

  return (
    <div className="w-full flex-grow flex flex-col items-center">
      {/* Hero Section */}
      <section className="relative w-full bg-slate-50 pt-32 pb-40 px-6 overflow-hidden flex flex-col items-center justify-center min-h-[90vh]">
        {/* Decorative Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary-100/40 via-slate-50 to-white"></div>
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float" style={{ animationDelay: '0s' }}></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-primary-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute -bottom-8 left-1/3 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float" style={{ animationDelay: '4s' }}></div>

        <div className="max-w-5xl mx-auto text-center z-10 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white dark:bg-slate-800 border border-slate-200 shadow-[0_2px_15px_rgb(0,0,0,0.04)] text-sm font-semibold text-slate-700 dark:text-slate-200 mb-8 hover:shadow-md transition-shadow cursor-default">
            <Sparkles className="w-4 h-4 text-primary-500" />
            <span>The New Standard in Campus Placements</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 tracking-tight mb-8 leading-[1.15]">
            Elevate Your Career with <br className="hidden md:block"/>
            <span className="bg-gradient-to-r from-primary-600 to-indigo-600 bg-clip-text text-transparent">Placement Analytics</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 mb-12 max-w-3xl mx-auto leading-relaxed font-light">
            A seamless, beautifully designed platform bridging the gap between top-tier students and world-class companies. 
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-5">
            <Link to="/register" className="group relative inline-flex items-center justify-center px-8 py-4 font-bold text-white transition-all duration-200 bg-primary-600 font-pj rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 hover:bg-primary-700 hover:-translate-y-1 shadow-[0_10px_40px_rgba(37,99,235,0.4)]">
              Get Started Now <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link to="/login" className="inline-flex items-center justify-center px-8 py-4 font-bold text-slate-700 dark:text-slate-200 transition-all duration-200 bg-white dark:bg-slate-800/80 backdrop-blur-md border border-slate-200 rounded-xl hover:bg-white dark:bg-slate-800 hover:-translate-y-1 shadow-sm hover:shadow-md">
              Log in to Account
            </Link>
          </div>

          <div className="mt-16 flex flex-wrap items-center justify-center gap-6 md:gap-10 text-slate-600 dark:text-slate-300 text-sm md:text-base font-medium">
            <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800/50 rounded-lg backdrop-blur-sm"><CheckCircle className="w-5 h-5 text-emerald-500" /> Free for Students</div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800/50 rounded-lg backdrop-blur-sm"><CheckCircle className="w-5 h-5 text-emerald-500" /> Real-time Tracking</div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800/50 rounded-lg backdrop-blur-sm"><CheckCircle className="w-5 h-5 text-emerald-500" /> Premium Companies</div>
          </div>
        </div>
      </section>

      {/* Recent Jobs Section */}
      <section id="recent-openings" className="py-24 bg-slate-50 px-6 w-full flex justify-center mt-[-40px] z-20">
        <div className="max-w-7xl w-full">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight mb-6">Recent Openings</h2>
            <p className="text-slate-500 max-w-2xl mx-auto text-xl font-light">Explore some of the latest opportunities posted by top companies. Anyone can view these, but you must be a registered student to apply.</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {jobs.length > 0 ? jobs.slice(0, visibleJobsCount).map(job => (
              <div key={job._id} className="bg-white dark:bg-slate-800 rounded-[2rem] p-8 border border-slate-100 dark:border-slate-700 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_50px_rgb(0,0,0,0.1)] transition-all duration-300 hover:-translate-y-2 flex flex-col h-full">
                <div className="flex-grow">
                  <div className="inline-block px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-xs font-bold mb-4 uppercase tracking-wider">{job.type}</div>
                  <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">{job.title}</h3>
                  <p className="text-primary-600 font-medium mb-4">{job.company?.companyName || 'Top Company'}</p>
                  <div className="text-slate-500 text-sm mb-6 flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-slate-300"></span> {job.location}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-slate-300"></span> ${job.salary ? job.salary.toLocaleString() : 'Negotiable'}
                    </div>
                    {job.deadline && (
                      <div className="flex items-center gap-2 mt-2 font-medium px-3 py-1.5 rounded-lg w-max text-amber-600 bg-amber-50">
                        <Clock className="w-4 h-4" /> Apply by {new Date(job.deadline).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedJob(job)}
                  className="w-full mt-auto py-3 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition-colors shadow-md hover:shadow-lg"
                >
                  View Details
                </button>
              </div>
            )) : (
              <div className="col-span-1 md:col-span-2 lg:col-span-3 text-center py-12">
                <p className="text-slate-500 text-lg">No open positions available right now. Check back soon!</p>
              </div>
            )}
          </div>

          {jobs.length > 3 && (
            <div className="mt-14 text-center">
              {visibleJobsCount < jobs.length ? (
                <button 
                  onClick={() => setVisibleJobsCount(jobs.length)} 
                  className="bg-white dark:bg-slate-800 text-primary-600 dark:text-primary-400 border-2 border-primary-100 dark:border-primary-900/50 hover:border-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 py-3 px-8 rounded-xl font-bold transition-all duration-300 group inline-flex items-center gap-3 shadow-sm hover:shadow-md"
                >
                  See More Openings
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              ) : (
                <button 
                  onClick={() => {
                    setVisibleJobsCount(3);
                    window.scrollTo({ top: document.getElementById('recent-openings')?.offsetTop || 0, behavior: 'smooth' });
                  }} 
                  className="bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-2 border-slate-200 dark:border-slate-700 hover:border-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 py-3 px-8 rounded-xl font-bold transition-all duration-300 group inline-flex items-center gap-3 shadow-sm hover:shadow-md"
                >
                  See Less
                  <ArrowRight className="w-5 h-5 group-hover:-translate-x-1 transition-transform rotate-180" />
                </button>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-32 bg-white dark:bg-slate-800 px-6 w-full flex justify-center border-t border-slate-100 dark:border-slate-700">
        <div className="max-w-7xl w-full">
          <div className="text-center mb-20 animate-fade-in-up">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight mb-6">Designed for Everyone</h2>
            <p className="text-slate-500 max-w-2xl mx-auto text-xl font-light">Whether you're looking for your dream job, or looking to hire the next generation of talent, we have a tailored experience for you.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="group p-10 rounded-[2rem] bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_50px_rgb(0,0,0,0.1)] transition-all duration-300 hover:-translate-y-2 cursor-default relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-bl-[100px] -z-10 group-hover:scale-110 transition-transform duration-500"></div>
              <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300 group-hover:bg-indigo-600 group-hover:text-white shadow-sm">
                <User className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-4">For Students</h3>
              <p className="text-slate-500 leading-relaxed text-lg font-light">Build a stunning professional profile, discover matching roles, apply instantly, and watch your application progress in real-time through an intuitive dashboard.</p>
            </div>

            <div className="group p-10 rounded-[2rem] bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_50px_rgb(0,0,0,0.1)] transition-all duration-300 hover:-translate-y-2 cursor-default relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-bl-[100px] -z-10 group-hover:scale-110 transition-transform duration-500"></div>
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300 group-hover:bg-emerald-600 group-hover:text-white shadow-sm">
                <BriefcaseBusiness className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-4">For Companies</h3>
              <p className="text-slate-500 leading-relaxed text-lg font-light">Create gorgeous job postings, view rich student profiles, and manage applicants effortlessly. Shortlist the absolute best candidates with a single click.</p>
            </div>

            <div className="group p-10 rounded-[2rem] bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_50px_rgb(0,0,0,0.1)] transition-all duration-300 hover:-translate-y-2 cursor-default relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50 rounded-bl-[100px] -z-10 group-hover:scale-110 transition-transform duration-500"></div>
              <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300 group-hover:bg-amber-500 group-hover:text-white shadow-sm">
                <TrendingUp className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-4">For Admins</h3>
              <p className="text-slate-500 leading-relaxed text-lg font-light">Maintain total control over the campus placement drive. Access beautiful analytics, oversee active jobs, and enforce role-based access universally.</p>
            </div>
          </div>
        </div>
      </section>

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
                  setSelectedJob(null);
                  handleApplyClick();
                }}
                className="flex-grow py-3 rounded-xl font-bold transition-all bg-slate-900 text-white hover:bg-slate-800 shadow-md hover:shadow-lg"
              >
                Apply Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default Home;
