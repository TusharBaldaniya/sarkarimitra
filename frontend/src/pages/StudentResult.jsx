import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Trophy, CheckCircle2, XCircle, MinusCircle, Eye, EyeOff, Award, Sparkles } from 'lucide-react';

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

  const isHighScorer = result.percentage >= 70;

  return (
    <div className="min-h-screen bg-slate-900 p-4 sm:p-6 lg:p-8 flex justify-center">
      <div className="w-full max-w-2xl space-y-6 my-auto">
        {/* Top Celebratory Header */}
        <div className="bg-gradient-to-tr from-slate-950 via-brand-950 to-slate-950 rounded-3xl p-6 sm:p-8 text-center text-white border border-slate-800 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 translate-x-8 -translate-y-8 w-48 h-48 rounded-full bg-emerald-500/20 blur-3xl pointer-events-none"></div>

          <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 mx-auto mb-4 shadow-xl shadow-amber-500/30">
            <Trophy className="w-9 h-9" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Exam Completed Successfully</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">{result.examTitle}</h1>
          <p className="text-slate-300 text-xs sm:text-sm mt-1">
            Candidate: <strong className="text-white">{result.studentName}</strong>
          </p>
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

          {/* Toggle Answer Details */}
          {result.questions && result.questions.length > 0 && (
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
          )}

          {/* Answer Key Details */}
          {showAnswers && (
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <h3 className="font-extrabold text-slate-900 text-sm uppercase tracking-wider">
                Question Review
              </h3>

              <div className="space-y-4 max-h-96 overflow-y-auto pr-1">
                {result.questions.map((q, idx) => {
                  const isUnans = !q.selectedAnswer;
                  return (
                    <div
                      key={q.questionId}
                      className={`p-4 rounded-2xl border text-xs space-y-2.5 ${
                        q.isCorrect
                          ? 'border-emerald-200 bg-emerald-50/20'
                          : isUnans
                          ? 'border-slate-200 bg-slate-50/50'
                          : 'border-rose-200 bg-rose-50/20'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-bold text-slate-800 text-sm">
                          Q{idx + 1}. {q.questionText}
                        </span>

                        {q.isCorrect ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold flex-shrink-0">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Correct</span>
                          </span>
                        ) : isUnans ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[11px] font-bold flex-shrink-0">
                            <MinusCircle className="w-3 h-3" />
                            <span>Unanswered</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[11px] font-bold flex-shrink-0">
                            <XCircle className="w-3 h-3" />
                            <span>Incorrect</span>
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[11px]">
                        <div>
                          <span className="text-slate-400 font-semibold">Your Answer: </span>
                          <span
                            className={`font-bold ${
                              q.isCorrect ? 'text-emerald-700' : isUnans ? 'text-slate-500' : 'text-rose-700'
                            }`}
                          >
                            {q.selectedAnswer ? `Option ${q.selectedAnswer}` : 'None'}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 font-semibold">Correct Answer: </span>
                          <span className="font-bold text-emerald-700">Option {q.correctAnswer}</span>
                        </div>
                      </div>

                      {q.explanation && (
                        <div className="p-2.5 bg-slate-100 rounded-xl text-slate-700 text-[11px]">
                          <strong>Explanation: </strong> {q.explanation}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentResult;
