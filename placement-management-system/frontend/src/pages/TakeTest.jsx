import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { toast } from 'react-toastify';
import { Clock, CheckCircle2, XCircle, AlertCircle, ChevronLeft, ChevronRight, Send } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';

const TakeTest = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const user = useAuthStore(state => state.user);

  const [test, setTest] = useState(null);
  const [answers, setAnswers] = useState({});
  const [currentQ, setCurrentQ] = useState(0);
  const [timeLeft, setTimeLeft] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [testStarted, setTestStarted] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    const fetchTest = async () => {
      try {
        const { data } = await api.get(`/tests/take/${token}`);
        setTest(data);
        setTimeLeft(data.duration * 60);
      } catch (err) {
        toast.error(err.response?.data?.message || 'Invalid or expired test link');
      } finally {
        setLoading(false);
      }
    };
    fetchTest();
  }, [token]);

  const handleSubmit = useCallback(async (auto = false) => {
    if (submitting) return;
    setSubmitting(true);
    clearInterval(timerRef.current);

    const formattedAnswers = Object.entries(answers).map(([qIdx, optIdx]) => ({
      questionIndex: parseInt(qIdx),
      selectedOption: optIdx,
    }));

    try {
      const { data } = await api.post(`/tests/take/${token}/submit`, { answers: formattedAnswers });
      setResult(data);
      if (auto) toast.info('Time up! Test submitted automatically.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed');
      setSubmitting(false);
    }
  }, [answers, token, submitting]);

  useEffect(() => {
    if (!testStarted || timeLeft === null) return;

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleSubmit(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [testStarted, handleSubmit]);

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const answeredCount = Object.keys(answers).length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900">
        <div className="animate-spin w-12 h-12 rounded-full border-4 border-indigo-400 border-t-transparent"></div>
      </div>
    );
  }

  if (!test) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900">
        <div className="text-center text-white">
          <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Invalid Test Link</h2>
          <p className="text-slate-400">This test link is invalid or has expired.</p>
        </div>
      </div>
    );
  }

  // Result screen
  if (result) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 p-4">
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl p-10 max-w-lg w-full text-center">
          <div className={`w-24 h-24 rounded-full mx-auto flex items-center justify-center mb-6 ${result.passed ? 'bg-emerald-100' : 'bg-red-100'}`}>
            {result.passed
              ? <CheckCircle2 className="w-12 h-12 text-emerald-600" />
              : <XCircle className="w-12 h-12 text-red-500" />
            }
          </div>
          <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white mb-2">
            {result.passed ? '🎉 You Passed!' : 'Test Completed'}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mb-8">Your result has been submitted successfully.</p>

          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-slate-50 dark:bg-slate-700 rounded-2xl p-4">
              <p className="text-3xl font-black text-indigo-600">{result.score}</p>
              <p className="text-xs text-slate-500 mt-1">Correct</p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-700 rounded-2xl p-4">
              <p className="text-3xl font-black text-slate-700 dark:text-white">{result.totalMarks}</p>
              <p className="text-xs text-slate-500 mt-1">Total</p>
            </div>
            <div className={`rounded-2xl p-4 ${result.passed ? 'bg-emerald-50 dark:bg-emerald-900/30' : 'bg-red-50 dark:bg-red-900/30'}`}>
              <p className={`text-3xl font-black ${result.passed ? 'text-emerald-600' : 'text-red-500'}`}>{result.percentage}%</p>
              <p className="text-xs text-slate-500 mt-1">Score</p>
            </div>
          </div>

          <p className="text-sm text-slate-500 dark:text-slate-400">
            Passing threshold: <strong>{result.passingPercentage}%</strong>
          </p>
          <p className="text-xs text-slate-400 mt-2">
            Results are visible to the company/admin. You'll be notified about next steps.
          </p>
        </div>
      </div>
    );
  }

  // Instructions screen (before starting)
  if (!testStarted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 p-4">
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl p-10 max-w-lg w-full">
          <div className="w-16 h-16 rounded-2xl bg-indigo-100 flex items-center justify-center mb-6">
            <AlertCircle className="w-8 h-8 text-indigo-600" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white mb-1">{test.title}</h1>
          <p className="text-slate-500 text-sm mb-6">
            {test.job?.title} — {test.createdBy?.companyName || test.createdBy?.name}
          </p>

          <div className="bg-slate-50 dark:bg-slate-700/50 rounded-2xl p-5 mb-7 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Total Questions</span>
              <span className="font-bold text-slate-800 dark:text-white">{test.totalQuestions}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Duration</span>
              <span className="font-bold text-slate-800 dark:text-white">{test.duration} minutes</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Passing Score</span>
              <span className="font-bold text-emerald-600">{test.passingPercentage}%</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Marks per question</span>
              <span className="font-bold text-slate-800 dark:text-white">1 mark</span>
            </div>
          </div>

          <ul className="text-sm text-slate-600 dark:text-slate-300 space-y-2 mb-8 list-disc list-inside">
            <li>Once started, the timer <strong>cannot be paused</strong>.</li>
            <li>The test will auto-submit when time runs out.</li>
            <li>Each question has only one correct answer.</li>
            <li>You can navigate between questions freely.</li>
          </ul>

          {!user ? (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4 text-sm text-amber-700">
              ⚠️ You must <a href="/login" className="font-bold underline">log in</a> as a student to submit this test.
            </div>
          ) : null}

          <button
            onClick={() => setTestStarted(true)}
            disabled={!user || user.role !== 'student'}
            className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-colors text-lg"
          >
            Start Test
          </button>
          {user && user.role !== 'student' && (
            <p className="text-xs text-center text-red-500 mt-3">Only student accounts can take the test.</p>
          )}
        </div>
      </div>
    );
  }

  // Test-taking screen
  const q = test.questions[currentQ];
  const timerDanger = timeLeft < 60;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 p-4 flex flex-col">
      {/* Header bar */}
      <div className="max-w-3xl mx-auto w-full mb-6">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl px-6 py-3 flex items-center justify-between">
          <div>
            <p className="text-white font-bold truncate max-w-xs">{test.title}</p>
            <p className="text-slate-400 text-xs">{answeredCount} / {test.totalQuestions} answered</p>
          </div>
          <div className={`flex items-center gap-2 px-4 py-2 rounded-xl font-mono font-bold text-lg ${timerDanger ? 'bg-red-500/20 text-red-300 animate-pulse' : 'bg-white/10 text-white'}`}>
            <Clock className="w-5 h-5" />
            {formatTime(timeLeft)}
          </div>
        </div>
      </div>

      {/* Question card */}
      <div className="max-w-3xl mx-auto w-full flex-grow flex flex-col">
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl p-8 flex-grow flex flex-col">
          {/* Progress pills */}
          <div className="flex flex-wrap gap-2 mb-6">
            {test.questions.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentQ(idx)}
                className={`w-9 h-9 rounded-lg text-sm font-bold transition-all ${
                  idx === currentQ
                    ? 'bg-indigo-600 text-white scale-110 shadow-md'
                    : answers[idx] !== undefined
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                }`}
              >
                {idx + 1}
              </button>
            ))}
          </div>

          <div className="flex-grow">
            <p className="text-xs font-semibold text-indigo-500 uppercase tracking-widest mb-3">
              Question {currentQ + 1} of {test.totalQuestions}
            </p>
            <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-6 leading-relaxed">{q.questionText}</h2>

            <div className="space-y-3">
              {q.options.map((opt, optIdx) => {
                const selected = answers[currentQ] === optIdx;
                return (
                  <button
                    key={optIdx}
                    onClick={() => setAnswers(prev => ({ ...prev, [currentQ]: optIdx }))}
                    className={`w-full text-left px-5 py-4 rounded-xl border-2 font-medium transition-all ${
                      selected
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                        : 'border-slate-200 dark:border-slate-600 hover:border-indigo-300 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200'
                    }`}
                  >
                    <span className={`inline-flex w-7 h-7 rounded-full items-center justify-center text-xs font-bold mr-3 ${
                      selected ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-600 text-slate-500 dark:text-slate-300'
                    }`}>
                      {String.fromCharCode(65 + optIdx)}
                    </span>
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center mt-8 pt-6 border-t border-slate-100 dark:border-slate-700">
            <button
              onClick={() => setCurrentQ(prev => Math.max(0, prev - 1))}
              disabled={currentQ === 0}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-semibold disabled:opacity-40 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" /> Previous
            </button>

            {currentQ < test.totalQuestions - 1 ? (
              <button
                onClick={() => setCurrentQ(prev => Math.min(test.totalQuestions - 1, prev + 1))}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-colors"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => handleSubmit(false)}
                disabled={submitting}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold transition-colors"
              >
                <Send className="w-4 h-4" />
                {submitting ? 'Submitting...' : `Submit Test (${answeredCount}/${test.totalQuestions})`}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TakeTest;
