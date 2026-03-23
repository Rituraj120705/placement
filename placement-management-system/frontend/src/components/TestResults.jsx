import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { toast } from 'react-toastify';
import { X, Trophy, Users, TrendingUp, CheckCircle2, XCircle } from 'lucide-react';

const TestResults = ({ testId, jobTitle, onClose }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data: res } = await api.get(`/tests/${testId}/results`);
        setData(res);
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to load results');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [testId]);

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center px-7 py-5 border-b border-slate-100 dark:border-slate-700 shrink-0">
          <div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">Test Results</h2>
            <p className="text-sm text-slate-500 mt-0.5">{jobTitle}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <div className="overflow-y-auto flex-grow p-7 custom-scrollbar">
          {loading ? (
            <div className="flex items-center justify-center h-40">
              <div className="animate-spin w-10 h-10 rounded-full border-4 border-indigo-500 border-t-transparent"></div>
            </div>
          ) : !data ? (
            <p className="text-center text-slate-500 py-10">No results data available.</p>
          ) : (
            <>
              {/* Stats summary */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                <div className="bg-slate-50 dark:bg-slate-700 rounded-2xl p-4 text-center">
                  <Users className="w-6 h-6 text-indigo-500 mx-auto mb-2" />
                  <p className="text-2xl font-black text-slate-800 dark:text-white">{data.stats.total}</p>
                  <p className="text-xs text-slate-500 mt-1">Attempted</p>
                </div>
                <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl p-4 text-center">
                  <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-2" />
                  <p className="text-2xl font-black text-emerald-600">{data.stats.passed}</p>
                  <p className="text-xs text-slate-500 mt-1">Cleared</p>
                </div>
                <div className="bg-red-50 dark:bg-red-900/20 rounded-2xl p-4 text-center">
                  <XCircle className="w-6 h-6 text-red-500 mx-auto mb-2" />
                  <p className="text-2xl font-black text-red-500">{data.stats.failed}</p>
                  <p className="text-xs text-slate-500 mt-1">Failed</p>
                </div>
                <div className="bg-amber-50 dark:bg-amber-900/20 rounded-2xl p-4 text-center">
                  <TrendingUp className="w-6 h-6 text-amber-500 mx-auto mb-2" />
                  <p className="text-2xl font-black text-amber-600">{data.stats.avgScore}%</p>
                  <p className="text-xs text-slate-500 mt-1">Avg Score</p>
                </div>
              </div>

              {/* Test info */}
              <div className="flex items-center gap-2 text-sm text-slate-500 mb-5">
                <Trophy className="w-4 h-4 text-amber-500" />
                <span>Passing threshold: <strong className="text-slate-700 dark:text-white">{data.test.passingPercentage}%</strong></span>
                <span className="text-slate-300 dark:text-slate-600">|</span>
                <span>Ranked by score (highest first)</span>
              </div>

              {/* Results table */}
              {data.results.length === 0 ? (
                <div className="text-center py-16 text-slate-500">
                  <Users className="w-12 h-12 mx-auto mb-3 text-slate-400" />
                  <p className="font-medium">No students have taken the test yet.</p>
                  <p className="text-sm mt-1">Share the test link with applicants to get started.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                        <th className="px-4 py-3 text-left font-semibold text-slate-600 dark:text-slate-300 rounded-l-xl">#</th>
                        <th className="px-4 py-3 text-left font-semibold text-slate-600 dark:text-slate-300">Student</th>
                        <th className="px-4 py-3 text-left font-semibold text-slate-600 dark:text-slate-300">Score</th>
                        <th className="px-4 py-3 text-left font-semibold text-slate-600 dark:text-slate-300">%</th>
                        <th className="px-4 py-3 text-left font-semibold text-slate-600 dark:text-slate-300">Status</th>
                        <th className="px-4 py-3 text-left font-semibold text-slate-600 dark:text-slate-300 rounded-r-xl">Submitted</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                      {data.results.map((r, idx) => (
                        <tr key={r._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                          <td className="px-4 py-3 font-bold text-slate-400">{idx + 1}</td>
                          <td className="px-4 py-3">
                            <p className="font-semibold text-slate-800 dark:text-white">{r.student?.name}</p>
                            <p className="text-xs text-slate-400">{r.student?.email}</p>
                            {r.student?.major && (
                              <p className="text-xs text-slate-400">{r.student.major} {r.student.graduationYear ? `(${r.student.graduationYear})` : ''}</p>
                            )}
                          </td>
                          <td className="px-4 py-3 font-bold text-slate-700 dark:text-white">{r.score} / {r.totalMarks}</td>
                          <td className="px-4 py-3">
                            <span className={`font-bold ${r.percentage >= data.test.passingPercentage ? 'text-emerald-600' : 'text-red-500'}`}>
                              {r.percentage}%
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${
                              r.passed
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-red-100 text-red-600'
                            }`}>
                              {r.passed ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                              {r.passed ? 'Cleared' : 'Failed'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-slate-400 text-xs">
                            {new Date(r.submittedAt).toLocaleDateString('en-IN', {
                              day: 'numeric', month: 'short', year: 'numeric',
                              hour: '2-digit', minute: '2-digit'
                            })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default TestResults;
