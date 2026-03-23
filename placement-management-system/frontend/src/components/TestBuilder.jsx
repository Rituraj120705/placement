import React, { useState } from 'react';
import api from '../api/axios';
import { toast } from 'react-toastify';
import { PlusCircle, Trash2, X, ChevronDown, ChevronUp, Clock, Link2 } from 'lucide-react';

const emptyQuestion = () => ({
  questionText: '',
  options: ['', '', '', ''],
  correctAnswer: 0,
});

const TestBuilder = ({ jobId, jobTitle, onClose }) => {
  const [title, setTitle] = useState(`${jobTitle} — Aptitude Test`);
  const [duration, setDuration] = useState(30);
  const [passingPercentage, setPassingPercentage] = useState(60);
  const [questions, setQuestions] = useState([emptyQuestion()]);
  const [loading, setLoading] = useState(false);
  const [generatedLink, setGeneratedLink] = useState(null);
  const [expandedQ, setExpandedQ] = useState(0);

  const addQuestion = () => {
    setQuestions(prev => [...prev, emptyQuestion()]);
    setExpandedQ(questions.length); // auto-expand new question
  };

  const removeQuestion = (idx) => {
    if (questions.length === 1) return toast.error('Need at least one question');
    setQuestions(prev => prev.filter((_, i) => i !== idx));
    setExpandedQ(Math.max(0, expandedQ - 1));
  };

  const updateQuestion = (idx, field, value) => {
    setQuestions(prev => prev.map((q, i) => i === idx ? { ...q, [field]: value } : q));
  };

  const updateOption = (qIdx, optIdx, value) => {
    setQuestions(prev => prev.map((q, i) => {
      if (i !== qIdx) return q;
      const opts = [...q.options];
      opts[optIdx] = value;
      return { ...q, options: opts };
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.questionText.trim()) return toast.error(`Question ${i + 1}: text is required`);
      if (q.options.some(o => !o.trim())) return toast.error(`Question ${i + 1}: all 4 options are required`);
    }

    setLoading(true);
    try {
      const { data } = await api.post('/tests', {
        title,
        jobId,
        duration: Number(duration),
        passingPercentage: Number(passingPercentage),
        questions,
      });
      toast.success('Test created successfully!');
      const link = `${window.location.origin}/test/${data.accessToken}`;
      setGeneratedLink(link);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create test');
    } finally {
      setLoading(false);
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(generatedLink);
    toast.success('Test link copied to clipboard!');
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center px-7 py-5 border-b border-slate-100 dark:border-slate-700 shrink-0">
          <div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">Create Assessment Test</h2>
            <p className="text-sm text-slate-500 mt-0.5">for: <span className="font-semibold text-indigo-600">{jobTitle}</span></p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* If link generated, show it */}
        {generatedLink ? (
          <div className="flex-grow overflow-y-auto p-7">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Link2 className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Test Created!</h3>
              <p className="text-slate-500 text-sm">Share this link with students. They can use it to take the test.</p>
            </div>
            <div className="flex gap-2 mb-6">
              <input
                readOnly
                value={generatedLink}
                className="flex-grow px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm text-slate-700 dark:text-white font-mono"
              />
              <button onClick={copyLink} className="px-5 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors text-sm whitespace-nowrap">
                Copy Link
              </button>
            </div>
            <p className="text-xs text-slate-400 text-center mb-6">
              You can also send this link directly to students from the "Manage Applicants" panel.
            </p>
            <button onClick={onClose} className="w-full py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-white font-semibold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col flex-grow overflow-hidden">
            <div className="overflow-y-auto flex-grow p-7 space-y-6 custom-scrollbar">
              {/* Test settings */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-3">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Test Title</label>
                  <input
                    required
                    type="text"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-white dark:bg-slate-700 dark:text-white text-sm"
                    placeholder="e.g. Frontend Developer — Aptitude Test"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    <Clock className="inline w-4 h-4 mr-1" />Duration (min)
                  </label>
                  <input
                    required
                    type="number"
                    min="5"
                    max="180"
                    value={duration}
                    onChange={e => setDuration(e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-white dark:bg-slate-700 dark:text-white text-sm"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Passing Percentage (%)</label>
                  <input
                    required
                    type="number"
                    min="1"
                    max="100"
                    value={passingPercentage}
                    onChange={e => setPassingPercentage(e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-white dark:bg-slate-700 dark:text-white text-sm"
                  />
                </div>
              </div>

              {/* Questions */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-slate-800 dark:text-white">Questions <span className="text-indigo-500 font-extrabold">({questions.length})</span></h3>
                  <button type="button" onClick={addQuestion} className="flex items-center gap-1.5 text-sm font-semibold text-indigo-600 hover:text-indigo-700">
                    <PlusCircle className="w-4 h-4" /> Add Question
                  </button>
                </div>

                <div className="space-y-3">
                  {questions.map((q, qIdx) => (
                    <div key={qIdx} className="border border-slate-200 dark:border-slate-600 rounded-xl overflow-hidden">
                      {/* Question header */}
                      <div
                        className="flex items-center justify-between px-4 py-3 bg-slate-50 dark:bg-slate-700/50 cursor-pointer"
                        onClick={() => setExpandedQ(expandedQ === qIdx ? null : qIdx)}
                      >
                        <span className="font-semibold text-sm text-slate-700 dark:text-white">
                          Q{qIdx + 1}: {q.questionText ? q.questionText.substring(0, 50) + (q.questionText.length > 50 ? '...' : '') : <span className="text-slate-400 italic">No text yet</span>}
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={e => { e.stopPropagation(); removeQuestion(qIdx); }}
                            className="p-1 hover:text-red-500 text-slate-400 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          {expandedQ === qIdx ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                        </div>
                      </div>

                      {/* Question body */}
                      {expandedQ === qIdx && (
                        <div className="p-4 space-y-4">
                          <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1">Question Text *</label>
                            <textarea
                              required
                              rows={2}
                              value={q.questionText}
                              onChange={e => updateQuestion(qIdx, 'questionText', e.target.value)}
                              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none resize-none text-sm bg-white dark:bg-slate-700 dark:text-white"
                              placeholder="Enter the question..."
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-slate-500 mb-2">Options — click ✓ to set correct answer</label>
                            <div className="space-y-2">
                              {q.options.map((opt, optIdx) => (
                                <div key={optIdx} className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => updateQuestion(qIdx, 'correctAnswer', optIdx)}
                                    className={`shrink-0 w-7 h-7 rounded-full border-2 font-bold text-xs transition-all ${
                                      q.correctAnswer === optIdx
                                        ? 'bg-emerald-500 border-emerald-500 text-white'
                                        : 'border-slate-300 dark:border-slate-500 text-slate-400 hover:border-emerald-400'
                                    }`}
                                    title="Set as correct answer"
                                  >
                                    {String.fromCharCode(65 + optIdx)}
                                  </button>
                                  <input
                                    required
                                    type="text"
                                    value={opt}
                                    onChange={e => updateOption(qIdx, optIdx, e.target.value)}
                                    className="flex-grow px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm bg-white dark:bg-slate-700 dark:text-white"
                                    placeholder={`Option ${String.fromCharCode(65 + optIdx)}`}
                                  />
                                </div>
                              ))}
                            </div>
                            <p className="text-xs text-slate-400 mt-1.5">
                              Correct answer: <strong className="text-emerald-600">Option {String.fromCharCode(65 + q.correctAnswer)}</strong>
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-7 py-5 border-t border-slate-100 dark:border-slate-700 flex justify-end gap-3 shrink-0">
              <button type="button" onClick={onClose} className="px-5 py-2.5 text-slate-600 dark:text-slate-300 font-semibold hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors">
                Cancel
              </button>
              <button type="submit" disabled={loading} className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-bold rounded-xl transition-colors">
                {loading ? 'Creating...' : `Create Test (${questions.length} Q)`}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default TestBuilder;
