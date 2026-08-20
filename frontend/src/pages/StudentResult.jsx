import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { CheckCircle2, XCircle, MinusCircle, Eye, EyeOff, Award, Sparkles, Youtube, Send } from 'lucide-react';

const YOUTUBE_URL = 'https://www.youtube.com/@ForestWaala';
const TELEGRAM_URL = 'https://t.me/Forestwaala';

const StudentResult = () => {
  const { token } = useParams();

  const [result, setResult] = useState(null);
  const [showAnswers, setShowAnswers] = useState(false);

  useEffect(() => {
    const rawResult = sessionStorage.getItem(`exam_result_${token}`);
    if (rawResult) {
      try {
        setResult(JSON.parse(rawResult));
      } catch (e) {
        console.error('Invalid result session data');
      }
    }
  }, [token]);

  if (!result) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center space-y-4 shadow-2xl">
          <Award className="w-12 h-12 text-brand-600 mx-auto" />
          <h2 className="text-lg font-bold text-slate-800">Result Session Expired</h2>
          <p className="text-xs text-slate-500">Your exam result was recorded on the server.</p>
        </div>
      </div>
    );
  }

  const canShowAnswerDetails = result.showAnswersToStudent && Array.isArray(result.questions) && result.questions.length > 0;

  const getOptionText = (questionObj, optionLetter) => {
    if (!questionObj || !optionLetter) return '';
    const key = `option${optionLetter.toUpperCase()}`;
    return questionObj[key] || '';
  };

  return (
    <div className="min-h-screen bg-slate-950 p-4 sm:p-6 lg:p-8 flex justify-center">
      <div className="w-full max-w-2xl space-y-6 my-auto">
        {/* Top Celebratory Header with ForestWaala Logo */}
        <div className="bg-gradient-to-tr from-slate-950 via-brand-950 to-slate-950 rounded-3xl p-6 sm:p-8 text-center text-white border border-slate-800 shadow-2xl relative overflow-hidden space-y-3">
          <div className="absolute top-0 right-0 translate-x-8 -translate-y-8 w-48 h-48 rounded-full bg-emerald-500/20 blur-3xl pointer-events-none"></div>

          <div className="relative inline-block">
            <img
              src="/forestwallah.jpg"
              alt="ForestWaala Logo"
              className="w-20 h-20 rounded-full border-4 border-slate-900 shadow-2xl object-cover mx-auto ring-2 ring-amber-400"
            />
            <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center font-bold shadow-lg">
              🏆
            </div>
          </div>

          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Powered by ForestWaala</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">{result.examTitle}</h1>
            <p className="text-slate-300 text-xs sm:text-sm">
              Candidate: <strong className="text-white">{result.studentName}</strong>
            </p>
          </div>
        </div>

        {/* Result Score Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-100 space-y-6">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Final Test Score</span>
            <div className="flex items-center justify-center gap-3">
              <span className="text-4xl sm:text-5xl font-black text-slate-900">
                {result.score} <span className="text-slate-300 text-2xl font-bold">/ {result.totalQuestions}</span>
              </span>
              <span className="px-4 py-1.5 bg-brand-50 border border-brand-200 text-brand-700 font-black text-2xl rounded-2xl">
                {result.percentage}%
              </span>
            </div>
          </div>

          {/* Metric Stats Counters */}
          <div className="grid grid-cols-3 gap-3 text-center text-xs">
            <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100">
              <span className="text-emerald-700 font-semibold block uppercase">Correct</span>
              <span className="text-xl sm:text-2xl font-black text-emerald-800">{result.correctAnswers}</span>
            </div>
            <div className="bg-rose-50 p-4 rounded-2xl border border-rose-100">
              <span className="text-rose-700 font-semibold block uppercase">Wrong</span>
              <span className="text-xl sm:text-2xl font-black text-rose-800">{result.wrongAnswers}</span>
            </div>
            <div className="bg-slate-100 p-4 rounded-2xl border border-slate-200">
              <span className="text-slate-600 font-semibold block uppercase">Unanswered</span>
              <span className="text-xl sm:text-2xl font-black text-slate-800">{result.unanswered}</span>
            </div>
          </div>

          {/* ForestWaala Social Community Join Cards */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-2.5 text-center">
            <p className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
              {canShowAnswerDetails ? 'Stay Prepared with ForestWaala Official Channels' : '📢 PDF Leaderboard & Answer Key Announcement'}
            </p>

            {!canShowAnswerDetails && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 leading-relaxed font-medium">
                The detailed answer key & PDF leaderboard will be released on our official Telegram channel! Join below to download your result PDF.
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              <a
                href={TELEGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 py-3 px-4 bg-sky-500 hover:bg-sky-600 text-white rounded-2xl text-xs font-extrabold shadow-md shadow-sky-500/20 transition-all"
              >
                <Send className="w-4 h-4" />
                <span>Join Telegram for Results PDF</span>
              </a>

              <a
                href={YOUTUBE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 py-3 px-4 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl text-xs font-extrabold shadow-md shadow-rose-600/20 transition-all"
              >
                <Youtube className="w-4 h-4" />
                <span>Subscribe on YouTube</span>
              </a>
            </div>
          </div>

          {/* Toggle Answer Details (Only if showAnswersToStudent is enabled) */}
          {canShowAnswerDetails && (
            <>
              <button
                onClick={() => setShowAnswers(!showAnswers)}
                className="w-full py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-2xl text-xs flex items-center justify-center gap-2 transition-all"
              >
                {showAnswers ? (
                  <>
                    <EyeOff className="w-4 h-4" />
                    <span>Hide Question Answers</span>
                  </>
                ) : (
                  <>
                    <Eye className="w-4 h-4 text-brand-600" />
                    <span>View Detailed Answers & Explanations</span>
                  </>
                )}
              </button>

              {/* Detailed Answer Key & Options */}
              {showAnswers && (
                <div className="space-y-4 pt-4 border-t border-slate-100">
                  <h3 className="font-extrabold text-slate-900 text-sm uppercase tracking-wider">
                    Question Review & Answer Key
                  </h3>

                  <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
                    {result.questions.map((q, idx) => {
                      const isUnans = !q.selectedAnswer;
                      const selectedVal = getOptionText(q, q.selectedAnswer);
                      const correctVal = getOptionText(q, q.correctAnswer);

                      return (
                        <div
                          key={q.questionId || idx}
                          className={`p-4 rounded-2xl border text-xs space-y-3 ${q.isCorrect
                              ? 'border-emerald-200 bg-emerald-50/20'
                              : isUnans
                                ? 'border-slate-200 bg-slate-50/50'
                                : 'border-rose-200 bg-rose-50/20'
                            }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className="font-extrabold text-slate-900 text-sm leading-snug">
                              Q{idx + 1}. {q.questionText}
                            </span>

                            {q.isCorrect ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold flex-shrink-0">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Correct (+1)</span>
                              </span>
                            ) : isUnans ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[11px] font-bold flex-shrink-0">
                                <MinusCircle className="w-3.5 h-3.5" />
                                <span>Unanswered</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[11px] font-bold flex-shrink-0">
                                <XCircle className="w-3.5 h-3.5" />
                                <span>Incorrect</span>
                              </span>
                            )}
                          </div>

                          {/* Options Breakdown Grid */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-xs">
                            {['A', 'B', 'C', 'D'].map((opt) => {
                              const optionKey = `option${opt}`;
                              const optionTextVal = q[optionKey];
                              const isStudentChoice = q.selectedAnswer === opt;
                              const isCorrectChoice = q.correctAnswer === opt;

                              let style = 'bg-white border-slate-200 text-slate-700';
                              if (isCorrectChoice) {
                                style = 'bg-emerald-100/80 border-emerald-400 text-emerald-950 font-bold ring-1 ring-emerald-400/40';
                              } else if (isStudentChoice && !isCorrectChoice) {
                                style = 'bg-rose-100/80 border-rose-400 text-rose-950 font-bold ring-1 ring-rose-400/40';
                              }

                              return (
                                <div key={opt} className={`p-2.5 rounded-xl border ${style} flex items-start justify-between gap-2`}>
                                  <div>
                                    <strong className="mr-1">({opt})</strong> {optionTextVal}
                                  </div>
                                  <span className="text-[10px] uppercase font-extrabold flex-shrink-0 tracking-wider">
                                    {isStudentChoice && isCorrectChoice && '✓ Your Choice'}
                                    {isStudentChoice && !isCorrectChoice && '✗ Your Choice'}
                                    {!isStudentChoice && isCorrectChoice && '✓ Correct Answer'}
                                  </span>
                                </div>
                              );
                            })}
                          </div>

                          {/* Summary Answer Values Box */}
                          {/* <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11.5px] pt-1">
                            <div
                              className={`p-2.5 rounded-xl border ${
                                q.isCorrect
                                  ? 'bg-emerald-50 border-emerald-200'
                                  : isUnans
                                  ? 'bg-slate-50 border-slate-200'
                                  : 'bg-rose-50 border-rose-200'
                              }`}
                            >
                              <span className="text-slate-400 font-semibold block uppercase text-[10px]">Your Answer</span>
                              <span
                                className={`font-extrabold ${
                                  q.isCorrect ? 'text-emerald-800' : isUnans ? 'text-slate-500' : 'text-rose-800'
                                }`}
                              >
                                {q.selectedAnswer
                                  ? `Option ${q.selectedAnswer}: ${selectedVal}`
                                  : 'None (Unanswered)'}
                              </span>
                            </div>

                            <div className="p-2.5 rounded-xl border bg-emerald-50 border-emerald-200">
                              <span className="text-slate-400 font-semibold block uppercase text-[10px]">Correct Answer</span>
                              <span className="font-extrabold text-emerald-900">
                                Option {q.correctAnswer}: {correctVal}
                              </span>
                            </div>
                          </div> */}

                          {q.explanation && (
                            <div className="p-3 bg-slate-100 rounded-xl text-slate-700 text-[11px] border border-slate-200">
                              <strong className="text-slate-900">Explanation: </strong> {q.explanation}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentResult;
