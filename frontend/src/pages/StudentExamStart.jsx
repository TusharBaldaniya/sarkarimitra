import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, HelpCircle, ArrowRight, AlertCircle, CheckCircle2, Youtube, Send, Sparkles } from 'lucide-react';
import api from '../services/api';

const YOUTUBE_URL = 'https://www.youtube.com/@ForestWaala';
const TELEGRAM_URL = 'https://t.me/Forestwaala';

const StudentExamStart = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [examInfo, setExamInfo] = useState(null);
  const [studentName, setStudentName] = useState('');
  const [showInstructions, setShowInstructions] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    fetchExamInfo();
  }, [token]);

  const fetchExamInfo = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get(`/public/exams/${token}`);
      if (res.data.success) {
        setExamInfo(res.data.data);
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid or expired exam token link.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleNameSubmit = (e) => {
    e.preventDefault();
    if (!studentName.trim() || studentName.trim().length < 2) {
      alert('Please enter your full name (at least 2 characters).');
      return;
    }
    setShowInstructions(true);
  };

  const handleStartExam = async () => {
    setStarting(true);
    try {
      const res = await api.post(`/public/exams/${token}/start`, {
        studentName: studentName.trim(),
      });

      if (res.data.success) {
        // Store attempt payload in sessionStorage for exam session
        sessionStorage.setItem(`exam_session_${token}`, JSON.stringify(res.data.data));
        navigate(`/exam/${token}/test`);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to start exam session.');
    } finally {
      setStarting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 sm:p-6">
      {/* Background Glowing Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-1/4 w-96 h-96 rounded-full bg-brand-500/10 blur-3xl"></div>
        <div className="absolute bottom-0 left-1/4 w-96 h-96 rounded-full bg-amber-500/10 blur-3xl"></div>
      </div>

      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden z-10 my-6">
        {/* ForestWaala Header & Banner */}
        <div className="bg-slate-950 text-center border-b border-slate-800 relative">
          <div className="h-28 overflow-hidden relative">
            <img
              src="/forestwallah-banner.png"
              alt="ForestWaala Banner"
              className="w-full h-full object-cover opacity-80"
              onError={(e) => {
                // Fallback to logo if banner fails to load
                e.target.style.display = 'none';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent"></div>
          </div>

          <div className="px-6 pb-6 pt-0 -mt-10 relative z-10">
            <img
              src="/forestwallah.jpg"
              alt="ForestWaala Logo"
              className="w-20 h-20 rounded-full border-4 border-slate-950 shadow-2xl object-cover mx-auto ring-2 ring-brand-500"
            />
            
            <div className="mt-3 space-y-1">
              <h1 className="text-2xl font-black text-white tracking-tight flex items-center justify-center gap-2">
                <span className="text-white">સરકારી</span>
                <span className="text-brand-400">मित्र</span>
              </h1>
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-extrabold tracking-wide">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Powered by ForestWaala</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 space-y-6">
          {loading ? (
            <div className="py-12 text-center text-slate-400 text-sm">
              <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
              <span>Validating exam link...</span>
            </div>
          ) : error ? (
            <div className="py-8 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-base">Exam Unavailable</h3>
                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">{error}</p>
              </div>
            </div>
          ) : !showInstructions ? (
            <>
              {/* Exam Metadata Info Box */}
              <div className="space-y-3">
                <h2 className="text-lg font-black text-slate-900 text-center leading-snug">
                  {examInfo.title}
                </h2>
                {examInfo.description && (
                  <p className="text-xs text-slate-500 text-center leading-relaxed">{examInfo.description}</p>
                )}

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 text-center">
                    <HelpCircle className="w-4 h-4 text-brand-600 mx-auto mb-1" />
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Questions</span>
                    <span className="font-extrabold text-slate-800 text-sm">{examInfo.questionCount} Questions</span>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 text-center">
                    <Clock className="w-4 h-4 text-emerald-600 mx-auto mb-1" />
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Duration</span>
                    <span className="font-extrabold text-slate-800 text-sm">{examInfo.durationMinutes} Minutes</span>
                  </div>
                </div>
              </div>

              {/* Student Name Form */}
              <form onSubmit={handleNameSubmit} className="space-y-4 pt-2 border-t border-slate-100">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                    Enter Candidate Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    placeholder="Enter your full name"
                    required
                    minLength={2}
                    maxLength={100}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all font-medium"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 bg-brand-600 hover:bg-brand-700 active:bg-brand-800 text-white rounded-2xl font-bold text-sm shadow-lg shadow-brand-600/30 transition-all flex items-center justify-center gap-2"
                >
                  <span>Proceed to Test</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              {/* Social Channels Join Section */}
              <div className="pt-4 border-t border-slate-100 text-center space-y-2.5">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Join ForestWaala Official Community
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <a
                    href={TELEGRAM_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-1.5 py-2 px-3 bg-sky-50 hover:bg-sky-100 text-sky-700 rounded-xl text-xs font-bold transition-colors border border-sky-100"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Telegram</span>
                  </a>
                  <a
                    href={YOUTUBE_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-1.5 py-2 px-3 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold transition-colors border border-rose-100"
                  >
                    <Youtube className="w-3.5 h-3.5" />
                    <span>YouTube</span>
                  </a>
                </div>
              </div>
            </>
          ) : (
            /* Instructions Screen */
            <div className="space-y-5">
              <div className="text-center space-y-1">
                <h3 className="text-lg font-black text-slate-900">Exam Instructions</h3>
                <p className="text-xs text-slate-500">Candidate: <strong className="text-slate-800">{studentName}</strong></p>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs text-slate-700 space-y-2.5">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span><strong>Total Questions:</strong> {examInfo.questionCount} MCQs</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span><strong>Time Limit:</strong> {examInfo.durationMinutes} Minutes strictly</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span><strong>Marking Scheme:</strong> +1 mark for each correct answer. No negative marking.</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span><strong>Auto-Submit:</strong> Test will automatically submit when the timer expires.</span>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => setShowInstructions(false)}
                  className="flex-1 py-3 bg-slate-100 text-slate-700 font-bold rounded-2xl text-xs"
                >
                  Back
                </button>
                <button
                  onClick={handleStartExam}
                  disabled={starting}
                  className="flex-2 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl text-xs shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  {starting ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <span>Start Exam Now</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentExamStart;
