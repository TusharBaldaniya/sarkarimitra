import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { GraduationCap, Clock, HelpCircle, Calendar, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import api from '../services/api';

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
    } fontFinally: {
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
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      {/* Background Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-1/4 w-80 h-80 rounded-full bg-brand-500/10 blur-3xl"></div>
        <div className="absolute bottom-0 left-1/4 w-80 h-80 rounded-full bg-emerald-500/10 blur-3xl"></div>
      </div>

      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden z-10">
        {/* Top Header */}
        <div className="bg-slate-950 p-6 text-center border-b border-slate-800">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-emerald-500 flex items-center justify-center text-white mx-auto mb-3 shadow-lg shadow-brand-500/20">
            <GraduationCap className="w-7 h-7" />
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center justify-center gap-1.5">
            <span className="text-white">સરકારી</span>
            <span className="text-brand-400">मित्र</span>
            <span className="text-slate-300 font-normal">Exam Portal</span>
          </h1>
          <p className="text-slate-400 text-xs mt-1">Government Competitive Mock Examination</p>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 space-y-6">
          {loading ? (
            <div className="py-12 text-center text-slate-400 text-sm">
              <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
              <span>Validating exam token link...</span>
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
                <h2 className="text-lg font-extrabold text-slate-900 text-center leading-snug">
                  {examInfo.title}
                </h2>
                {examInfo.description && (
                  <p className="text-xs text-slate-500 text-center">{examInfo.description}</p>
                )}

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 text-center">
                    <HelpCircle className="w-4 h-4 text-brand-600 mx-auto mb-1" />
                    <span className="text-[11px] text-slate-400 font-semibold uppercase block">Questions</span>
                    <span className="font-bold text-slate-800 text-sm">{examInfo.questionCount} Questions</span>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 text-center">
                    <Clock className="w-4 h-4 text-emerald-600 mx-auto mb-1" />
                    <span className="text-[11px] text-slate-400 font-semibold uppercase block">Duration</span>
                    <span className="font-bold text-slate-800 text-sm">{examInfo.durationMinutes} Minutes</span>
                  </div>
                </div>
              </div>

              {/* Student Name Form */}
              <form onSubmit={handleNameSubmit} className="space-y-4 pt-2 border-t border-slate-100">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">
                    Enter Your Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    placeholder=""
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
            </>
          ) : (
            /* Instructions Screen */
            <div className="space-y-5">
              <div className="text-center space-y-1">
                <h3 className="text-lg font-bold text-slate-900">Exam Instructions</h3>
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
                  className="flex-1 py-3 bg-slate-100 text-slate-700 font-semibold rounded-2xl text-xs"
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
