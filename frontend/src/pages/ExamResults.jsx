import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Users,
  Trophy,
  BarChart3,
  Search,
  ExternalLink,
  ChevronRight,
  UserCheck,
} from 'lucide-react';
import api from '../services/api';

const ExamResults = () => {
  const { id } = useParams();

  const [exam, setExam] = useState(null);
  const [stats, setStats] = useState({ totalAttempts: 0, averageScore: 0, highestScore: 0 });
  const [attempts, setAttempts] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResults();
  }, [id, search]);

  const fetchResults = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/exams/${id}/results`, {
        params: { search },
      });

      if (res.data.success) {
        setExam(res.data.data.exam);
        setStats(res.data.data.stats);
        setAttempts(res.data.data.attempts);
      }
    } catch (err) {
      console.error('Failed to load exam results:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Navigation Bar */}
      <div className="flex items-center gap-3">
        <Link
          to="/admin/exams"
          className="p-2 text-slate-500 hover:text-slate-800 bg-white border border-slate-200 rounded-xl hover:bg-slate-50"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            {exam ? exam.title : 'Exam Results'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">Student evaluation leaderboard & performance</p>
        </div>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center flex-shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Attempts</span>
            <p className="text-2xl font-bold text-slate-900">{loading ? '...' : stats.totalAttempts}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Average Score</span>
            <p className="text-2xl font-bold text-slate-900">{loading ? '...' : stats.averageScore}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Highest Score</span>
            <p className="text-2xl font-bold text-slate-900">{loading ? '...' : stats.highestScore}</p>
          </div>
        </div>
      </div>

      {/* Search Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search candidate name..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white"
          />
        </div>
      </div>

      {/* Attempts Leaderboard Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-12 text-center text-slate-400 text-sm">Loading exam results...</div>
        ) : attempts.length === 0 ? (
          <div className="py-12 text-center p-6 space-y-2">
            <UserCheck className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="font-semibold text-slate-700 text-sm">No attempts recorded yet</p>
            <p className="text-xs text-slate-400">Share the exam link with students to collect attempts.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200 text-[11px]">
                <tr>
                  <th className="px-6 py-3.5 text-center w-16">Rank</th>
                  <th className="px-6 py-3.5">Student Name</th>
                  <th className="px-4 py-3.5 text-center">Score</th>
                  <th className="px-4 py-3.5 text-center">Percentage</th>
                  <th className="px-4 py-3.5">Submitted Date</th>
                  <th className="px-6 py-3.5 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {attempts.map((att) => (
                  <tr key={att.attemptId} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 text-center font-bold">
                      {att.rank === 1 ? (
                        <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-800 text-xs flex items-center justify-center mx-auto">
                          🥇
                        </span>
                      ) : att.rank === 2 ? (
                        <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-800 text-xs flex items-center justify-center mx-auto">
                          🥈
                        </span>
                      ) : att.rank === 3 ? (
                        <span className="w-6 h-6 rounded-full bg-amber-700/10 text-amber-900 text-xs flex items-center justify-center mx-auto">
                          🥉
                        </span>
                      ) : (
                        <span className="text-slate-500">#{att.rank}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-800">{att.studentName}</td>
                    <td className="px-4 py-4 text-center font-bold text-slate-900">
                      {att.score} / {att.totalQuestions}
                    </td>
                    <td className="px-4 py-4 text-center font-bold">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs ${
                          att.percentage >= 80
                            ? 'bg-emerald-100 text-emerald-800'
                            : att.percentage >= 50
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {att.percentage}%
                      </span>
                    </td>
                    <td className="px-4 py-4 text-slate-500 text-xs whitespace-nowrap">
                      {att.submittedAt
                        ? new Date(att.submittedAt).toLocaleString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : 'In Progress'}
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <Link
                        to={`/admin/exams/${id}/attempts/${att.attemptId}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold"
                      >
                        <span>View Answers</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExamResults;
