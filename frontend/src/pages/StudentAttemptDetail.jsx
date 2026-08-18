import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, XCircle, MinusCircle, User } from 'lucide-react';
import api from '../services/api';

const StudentAttemptDetail = () => {
  const { id, attemptId } = useParams();

  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAttemptDetails();
  }, [id, attemptId]);

  const fetchAttemptDetails = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/exams/${id}/attempts/${attemptId}`);
      if (res.data.success) {
        setDetails(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load attempt details:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Navigation */}
      <div className="flex items-center gap-3">
        <Link
          to={`/admin/exams/${id}/results`}
          className="p-2 text-slate-500 hover:text-slate-800 bg-white border border-slate-200 rounded-xl hover:bg-slate-50"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Student Answer Paper
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">Individual answer verification and metrics</p>
        </div>
      </div>

      {loading ? (
        <div className="py-16 text-center text-slate-400 text-sm">Loading student submission...</div>
      ) : !details ? (
        <div className="py-12 text-center text-rose-600 text-sm font-semibold">Attempt record not found.</div>
      ) : (
        <>
          {/* Candidate Overview Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center font-bold text-lg">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-lg">{details.studentName}</h3>
                  <p className="text-xs text-slate-500">Exam: {details.examTitle}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className="text-xs text-slate-400 font-semibold block uppercase">Score</span>
                  <span className="text-2xl font-black text-brand-600">
                    {details.score} / {details.totalQuestions}
                  </span>
                </div>
                <div className="px-3 py-1 bg-brand-50 border border-brand-200 text-brand-700 font-extrabold text-lg rounded-xl">
                  {details.percentage}%
                </div>
              </div>
            </div>

            {/* Performance Stats Counters */}
            <div className="grid grid-cols-3 gap-3 text-center text-xs">
              <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-100">
                <span className="text-emerald-700 font-medium block">Correct</span>
                <span className="text-lg font-bold text-emerald-800">{details.correctCount}</span>
              </div>
              <div className="bg-rose-50 p-3 rounded-xl border border-rose-100">
                <span className="text-rose-700 font-medium block">Wrong</span>
                <span className="text-lg font-bold text-rose-800">{details.wrongCount}</span>
              </div>
              <div className="bg-slate-100 p-3 rounded-xl border border-slate-200">
                <span className="text-slate-600 font-medium block">Unanswered</span>
                <span className="text-lg font-bold text-slate-800">{details.unansweredCount}</span>
              </div>
            </div>
          </div>

          {/* Question Breakdown List */}
          <div className="space-y-4">
            <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider">
              Detailed Question Answers
            </h3>

            {details.questions.map((q, idx) => {
              const isUnanswered = !q.selectedAnswer;
              return (
                <div
                  key={q.questionId}
                  className={`p-5 rounded-2xl bg-white border transition-colors space-y-3 ${
                    q.isCorrect
                      ? 'border-emerald-200 bg-emerald-50/20'
                      : isUnanswered
                      ? 'border-slate-200'
                      : 'border-rose-200 bg-rose-50/20'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="font-bold text-slate-800 text-sm">
                      Q{idx + 1}. {q.questionText}
                    </span>

                    {q.isCorrect ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold flex-shrink-0">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Correct (+1)</span>
                      </span>
                    ) : isUnanswered ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-bold flex-shrink-0">
                        <MinusCircle className="w-3.5 h-3.5" />
                        <span>Unanswered (0)</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 text-xs font-bold flex-shrink-0">
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Incorrect (0)</span>
                      </span>
                    )}
                  </div>

                  {/* Options List */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {['A', 'B', 'C', 'D'].map((opt) => {
                      const optionKey = `option${opt}`;
                      const isStudentChoice = q.selectedAnswer === opt;
                      const isCorrectChoice = q.correctAnswer === opt;

                      let style = 'bg-slate-50 border-slate-200 text-slate-700';
                      if (isCorrectChoice) {
                        style = 'bg-emerald-100 border-emerald-300 text-emerald-900 font-bold';
                      } else if (isStudentChoice && !isCorrectChoice) {
                        style = 'bg-rose-100 border-rose-300 text-rose-900 font-bold';
                      }

                      return (
                        <div key={opt} className={`p-2.5 rounded-xl border ${style} flex items-center justify-between`}>
                          <span>
                            <strong>{opt}.</strong> {q[optionKey]}
                          </span>
                          <span className="text-[10px] uppercase font-bold tracking-wider">
                            {isStudentChoice && isCorrectChoice && '✓ Student Pick'}
                            {isStudentChoice && !isCorrectChoice && '✗ Student Pick'}
                            {!isStudentChoice && isCorrectChoice && '✓ Correct'}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {q.explanation && (
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600">
                      <strong className="text-slate-800 block mb-0.5">Explanation:</strong>
                      {q.explanation}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default StudentAttemptDetail;
