import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  HelpCircle,
  FileCheck,
  PlayCircle,
  Users,
  Plus,
  Copy,
  Check,
  ExternalLink,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import api from '../services/api';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalQuestions: 0,
    totalExams: 0,
    activeExams: 0,
    totalAttempts: 0,
  });
  const [recentExams, setRecentExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedToken, setCopiedToken] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [questionsRes, examsRes] = await Promise.all([
        api.get('/questions?limit=1'),
        api.get('/exams?limit=5'),
      ]);

      const qTotal = questionsRes.data.pagination?.total || 0;
      const examsList = examsRes.data.data || [];
      const eTotal = examsRes.data.pagination?.total || 0;

      const activeCount = examsList.filter((e) => e.status === 'Active').length;
      let totalAtt = 0;
      examsList.forEach((e) => {
        totalAtt += e.attemptCount || 0;
      });

      setStats({
        totalQuestions: qTotal,
        totalExams: eTotal,
        activeExams: activeCount,
        totalAttempts: totalAtt,
      });

      setRecentExams(examsList);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyExamLink = (token) => {
    const url = `${window.location.origin}/exam/${token}`;
    navigator.clipboard.writeText(url);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(''), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner with Subtle ForestWaala Background Watermark Logo */}
      <div className="bg-gradient-to-r from-slate-950 via-brand-950 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-slate-800">
        {/* Subtle Watermark Logo Background */}
        <img
          src="/forestwallah.jpg"
          alt="ForestWaala Watermark Logo"
          className="absolute -right-6 -bottom-10 sm:right-4 sm:-bottom-8 w-60 h-60 sm:w-72 sm:h-72 rounded-full opacity-15 pointer-events-none object-cover border-4 border-brand-500/20 shadow-2xl"
        />
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 bg-brand-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-extrabold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>SarkariMitra — Powered by ForestWaala</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white drop-shadow-sm">
            Government Exam Portal Overview
          </h2>
          <p className="text-slate-200 text-xs sm:text-sm mt-2 leading-relaxed font-medium">
            Manage your question bank, configure mock competitive tests, share secure token-based exam links, and evaluate student test performances.
          </p>

          <div className="flex flex-wrap gap-3 mt-5">
            <Link
              to="/admin/exams/create"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Exam</span>
            </Link>
            <Link
              to="/admin/questions"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-800/90 hover:bg-slate-700 text-slate-200 font-semibold text-xs sm:text-sm rounded-xl border border-slate-700 transition-all backdrop-blur-xs"
            >
              <HelpCircle className="w-4 h-4" />
              <span>Manage Question Bank</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Question Bank</span>
            <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
              <HelpCircle className="w-5 h-5" />
            </div>
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-bold text-slate-900">{loading ? '...' : stats.totalQuestions}</p>
            <p className="text-xs text-slate-500 mt-0.5">Total MCQs Available</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Exams Created</span>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <FileCheck className="w-5 h-5" />
            </div>
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-bold text-slate-900">{loading ? '...' : stats.totalExams}</p>
            <p className="text-xs text-slate-500 mt-0.5">Mock Test Sets</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Exams</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <PlayCircle className="w-5 h-5" />
            </div>
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-bold text-slate-900">{loading ? '...' : stats.activeExams}</p>
            <p className="text-xs text-slate-500 mt-0.5">Currently Live</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Student Attempts</span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-bold text-slate-900">{loading ? '...' : stats.totalAttempts}</p>
            <p className="text-xs text-slate-500 mt-0.5">Submissions Recorded</p>
          </div>
        </div>
      </div>

      {/* Recent Exams Section */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Recent Exams</h3>
            <p className="text-xs text-slate-500">Quick view of created exams and live links</p>
          </div>
          <Link
            to="/admin/exams"
            className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1"
          >
            <span>View All</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="py-8 text-center text-slate-400 text-sm">Loading exams...</div>
        ) : recentExams.length === 0 ? (
          <div className="py-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
            <FileCheck className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">No exams created yet</p>
            <p className="text-xs text-slate-500 mb-3">Create your first mock test and select questions from the question bank.</p>
            <Link
              to="/admin/exams/create"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-brand-600 text-white rounded-lg text-xs font-medium"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Exam</span>
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {recentExams.map((exam) => (
              <div key={exam.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-slate-800 text-sm truncate">{exam.title}</h4>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                        exam.status === 'Active'
                          ? 'bg-emerald-100 text-emerald-800'
                          : exam.status === 'Upcoming'
                          ? 'bg-blue-100 text-blue-800'
                          : exam.status === 'Expired'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {exam.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    {exam.questionCount} Questions • {exam.durationMinutes} Mins • {exam.attemptCount} Attempts
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => copyExamLink(exam.publicToken)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition-colors"
                  >
                    {copiedToken === exam.publicToken ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-slate-500" />
                        <span>Copy Link</span>
                      </>
                    )}
                  </button>

                  <Link
                    to={`/admin/exams/${exam.id}/results`}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-brand-50 hover:bg-brand-100 text-brand-700 rounded-lg text-xs font-medium transition-colors"
                  >
                    <span>Results</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
