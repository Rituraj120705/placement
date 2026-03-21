import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, User, BriefcaseBusiness, TrendingUp, CheckCircle, Sparkles } from 'lucide-react';
import api from '../api/axios';
import { useAuthStore } from '../store/useAuthStore';

const Home = () => {
  const [jobs, setJobs] = useState([]);
  const { isAuthenticated, user } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await api.get('/jobs');
        // Show up to 3 most recent open jobs
        setJobs(res.data.filter(j => j.status === 'open').slice(0, 3));
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
      <section className="py-24 bg-slate-50 px-6 w-full flex justify-center mt-[-40px] z-20">
        <div className="max-w-7xl w-full">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight mb-6">Recent Openings</h2>
            <p className="text-slate-500 max-w-2xl mx-auto text-xl font-light">Explore some of the latest opportunities posted by top companies. Anyone can view these, but you must be a registered student to apply.</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {jobs.length > 0 ? jobs.map(job => (
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
                  </div>
                </div>
                <button 
                  onClick={handleApplyClick}
                  className="w-full mt-auto py-3 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition-colors shadow-md hover:shadow-lg"
                >
                  Apply Now
                </button>
              </div>
            )) : (
              <div className="col-span-1 md:col-span-2 lg:col-span-3 text-center py-12">
                <p className="text-slate-500 text-lg">No open positions available right now. Check back soon!</p>
              </div>
            )}
          </div>
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
    </div>
  );
};

export default Home;
