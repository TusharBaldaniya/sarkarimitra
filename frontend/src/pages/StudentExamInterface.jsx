import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Clock,
  ChevronLeft,
  ChevronRight,
  Grid,
  Send,
  X,
  AlertTriangle,
  RotateCcw,
  CheckCircle,
} from 'lucide-react';
import api from '../services/api';

const StudentExamInterface = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [sessionData, setSessionData] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(null);
  const [showPalette, setShowPalette] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const timerRef = useRef(null);

  useEffect(() => {
    const rawSession = sessionStorage.getItem(`exam_session_${token}`);
    if (!rawSession) {
      navigate(`/exam/${token}`);
      return;
    }

    try {
      const data = JSON.parse(rawSession);
      setSessionData(data);

      // Restore stored local draft answers if any
      const savedDraft = localStorage.getItem(`draft_answers_${data.attemptId}`);
      if (savedDraft) {
        setSelectedAnswers(JSON.parse(savedDraft));
      }

      // Calculate initial time left in seconds
      const startTime = new Date(data.startedAt).getTime();
      const endTime = startTime + data.durationMinutes * 60 * 1000;
      const now = new Date().getTime();
      const secondsRemaining = Math.max(0, Math.floor((endTime - now) / 1000));
      setTimeLeft(secondsRemaining);
    } catch (err) {
      navigate(`/exam/${token}`);
    }
  }, [token]);

  // Live Timer Countdown Hook
  useEffect(() => {
    if (timeLeft === null) return;

    if (timeLeft <= 0) {
      // Auto-submit on timer expiry
      handleFinalSubmit(true);
      return;
    }

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleFinalSubmit(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [timeLeft]);

  const formatTimer = (seconds) => {
    if (seconds === null || seconds < 0) return '00:00';
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    const pad = (n) => (n < 10 ? `0${n}` : n);
    if (hrs > 0) {
      return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
    }
    return `${pad(mins)}:${pad(secs)}`;
  };

  const handleSelectOption = (qId, optionKey) => {
    const updated = { ...selectedAnswers, [qId]: optionKey };
    setSelectedAnswers(updated);
    if (sessionData?.attemptId) {
      localStorage.setItem(`draft_answers_${sessionData.attemptId}`, JSON.stringify(updated));
    }
  };

  const handleClearAnswer = (qId) => {
    const updated = { ...selectedAnswers };
    delete updated[qId];
    setSelectedAnswers(updated);
    if (sessionData?.attemptId) {
      localStorage.setItem(`draft_answers_${sessionData.attemptId}`, JSON.stringify(updated));
    }
  };

  const handleFinalSubmit = async (isAuto = false) => {
    if (submitting) return;
    setSubmitting(true);
    setShowConfirmModal(false);

    try {
      const res = await api.post(`/public/exams/${token}/submit`, {
        attemptId: sessionData.attemptId,
        answers: selectedAnswers,
        isAutoSubmit: isAuto,
      });

      if (res.data.success) {
        // Clear local storage draft
        localStorage.removeItem(`draft_answers_${sessionData.attemptId}`);
        sessionStorage.removeItem(`exam_session_${token}`);
        // Store result for display page
        sessionStorage.setItem(`exam_result_${token}`, JSON.stringify(res.data.data));
        navigate(`/exam/${token}/result`);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit exam.');
      setSubmitting(false);
    }
  };

  if (!sessionData) return null;

  const currentQuestion = sessionData.questions[currentIndex];
  const totalQuestions = sessionData.questions.length;
  const answeredCount = Object.keys(selectedAnswers).length;
  const unansweredCount = totalQuestions - answeredCount;

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-between">
      {/* Sticky Top Header */}
      <header className="bg-slate-900 text-white px-4 py-3 sticky top-0 z-30 shadow-md flex items-center justify-between">
        <div className="min-w-0 pr-2">
          <h1 className="font-bold text-xs sm:text-sm truncate text-slate-100">
            {sessionData.examTitle}
          </h1>
          <p className="text-[11px] text-slate-400">
            Question <span className="text-white font-bold">{currentIndex + 1}</span> of {totalQuestions}
          </p>
        </div>

        {/* Live Timer Display */}
        <div
          className={`flex items-center gap-1.5 px-3 py-1 rounded-xl font-mono font-bold text-xs sm:text-sm ${
            timeLeft !== null && timeLeft <= 300
              ? 'bg-rose-600 text-white animate-pulse'
              : 'bg-slate-800 text-emerald-400 border border-slate-700'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>⏱ {formatTimer(timeLeft)}</span>
        </div>
      </header>

      {/* Main Question Card Container */}
      <main className="flex-1 p-3 sm:p-6 max-w-2xl w-full mx-auto flex flex-col justify-center">
        <div className="bg-white rounded-3xl p-5 sm:p-8 shadow-sm border border-slate-200/80 space-y-6">
          {/* Question Text */}
          <div className="space-y-2">
            <span className="inline-block px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 text-xs font-bold">
              Q{currentIndex + 1} ({currentQuestion.category})
            </span>
            <h2 className="text-base sm:text-lg font-extrabold text-slate-900 leading-snug">
              {currentQuestion.questionText}
            </h2>
          </div>

          {/* Option Touch Buttons */}
          <div className="space-y-3">
            {['A', 'B', 'C', 'D'].map((opt) => {
              const optionKey = `option${opt}`;
              const optionText = currentQuestion[optionKey];
              const isSelected = selectedAnswers[currentQuestion.id] === opt;

              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => handleSelectOption(currentQuestion.id, opt)}
                  className={`w-full p-4 rounded-2xl border text-left transition-all flex items-start gap-3.5 cursor-pointer ${
                    isSelected
                      ? 'border-brand-600 bg-brand-50/80 text-brand-950 shadow-xs ring-2 ring-brand-500/30'
                      : 'border-slate-200 bg-slate-50/70 hover:bg-slate-100/80 text-slate-800'
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5 ${
                      isSelected
                        ? 'bg-brand-600 text-white shadow-xs'
                        : 'bg-white border border-slate-300 text-slate-600'
                    }`}
                  >
                    {opt}
                  </div>
                  <span className="text-xs sm:text-sm font-medium pt-1 leading-relaxed">
                    {optionText}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Clear Selection Button */}
          {selectedAnswers[currentQuestion.id] && (
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => handleClearAnswer(currentQuestion.id)}
                className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-rose-600 font-semibold"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Clear Choice</span>
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Bottom Sticky Action Bar */}
      <footer className="bg-white border-t border-slate-200 p-3 sm:p-4 sticky bottom-0 z-30 shadow-lg">
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button
              disabled={currentIndex === 0}
              onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
              className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl text-xs disabled:opacity-40 flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Previous</span>
            </button>

            <button
              onClick={() => setShowPalette(true)}
              className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-xs font-bold flex items-center gap-1.5"
              title="Question Palette"
            >
              <Grid className="w-4 h-4 text-brand-600" />
              <span className="text-xs font-bold text-slate-800">{answeredCount}/{totalQuestions}</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {currentIndex < totalQuestions - 1 ? (
              <button
                onClick={() => setCurrentIndex((prev) => Math.min(totalQuestions - 1, prev + 1))}
                className="px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-2xl text-xs shadow-sm flex items-center gap-1"
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => setShowConfirmModal(true)}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl text-xs shadow-md shadow-emerald-600/30 flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit Exam</span>
              </button>
            )}

            {currentIndex < totalQuestions - 1 && (
              <button
                onClick={() => setShowConfirmModal(true)}
                className="px-3 py-2.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold rounded-2xl text-xs border border-emerald-200"
              >
                Submit
              </button>
            )}
          </div>
        </div>
      </footer>

      {/* Question Palette Drawer Modal */}
      {showPalette && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl p-5 w-full max-w-lg space-y-4 max-h-[80vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-800 text-base">Question Palette Navigation</h3>
              <button
                onClick={() => setShowPalette(false)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center gap-4 text-xs font-semibold text-slate-600 py-1">
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded-full bg-emerald-500"></span>
                <span>Answered ({answeredCount})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded-full bg-slate-200"></span>
                <span>Unanswered ({unansweredCount})</span>
              </div>
            </div>

            {/* Grid Buttons */}
            <div className="grid grid-cols-5 sm:grid-cols-8 gap-2.5 py-2">
              {sessionData.questions.map((q, idx) => {
                const isAns = Boolean(selectedAnswers[q.id]);
                const isCurr = idx === currentIndex;

                return (
                  <button
                    key={q.id}
                    onClick={() => {
                      setCurrentIndex(idx);
                      setShowPalette(false);
                    }}
                    className={`h-11 rounded-2xl font-extrabold text-xs flex items-center justify-center transition-all ${
                      isCurr
                        ? 'ring-3 ring-brand-500 ring-offset-2 bg-brand-600 text-white'
                        : isAns
                        ? 'bg-emerald-500 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Submit Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl border border-slate-100">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <Send className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h4 className="font-extrabold text-slate-900 text-lg">Submit Exam?</h4>
              <p className="text-xs text-slate-500">
                Are you sure you want to complete and submit your exam?
              </p>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 grid grid-cols-2 text-center text-xs">
              <div>
                <span className="text-slate-400 font-semibold uppercase block">Answered</span>
                <span className="text-base font-extrabold text-emerald-600">{answeredCount}</span>
              </div>
              <div>
                <span className="text-slate-400 font-semibold uppercase block">Unanswered</span>
                <span className="text-base font-extrabold text-slate-500">{unansweredCount}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 py-3 bg-slate-100 text-slate-700 text-xs font-bold rounded-2xl"
              >
                Cancel
              </button>
              <button
                onClick={() => handleFinalSubmit(false)}
                disabled={submitting}
                className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-2xl shadow-md shadow-emerald-600/30 flex items-center justify-center gap-1 disabled:opacity-50"
              >
                {submitting ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <span>Submit Now</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentExamInterface;
