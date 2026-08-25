import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  HelpCircle,
  Clock,
  ArrowRight,
  Search,
  Sparkles,
  Send,
  Youtube,
  BookOpen,
  CheckCircle2,
  Share2,
  Copy,
  Check,
} from 'lucide-react';
import api from '../services/api';

const YOUTUBE_URL = 'https://www.youtube.com/@ForestWaala';
const TELEGRAM_URL = 'https://t.me/Forestwaala';

const StudentPracticePortal = () => {
  const navigate = useNavigate();

  const [exams, setExams] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    fetchPracticeExams();
  }, [search]);

  const fetchPracticeExams = async () => {
    setLoading(true);
    try {
      const res = await api.get('/public/exams/practice/list', {
        params: { search },
      });
      if (res.data.success) {
        setExams(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load practice exams:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyPortalLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between">
      {/* Background Glowing Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-0 right-1/4 w-96 h-96 rounded-full bg-brand-500/10 blur-3xl"></div>
        <div className="absolute bottom-0 left-1/4 w-96 h-96 rounded-full bg-amber-500/10 blur-3xl"></div>
      </div>

      <div className="relative z-10">
        {/* Header Navigation */}
        <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
          <div className="max-w-5xl mx-auto px-4 py-3.5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src="/forestwallah.jpg"
                alt="ForestWaala Logo"
                className="w-10 h-10 rounded-full border-2 border-brand-400 object-cover shadow-lg"
              />
              <div>
                <div className="font-extrabold text-base sm:text-lg tracking-tight flex items-center gap-1.5">
                  <span className="text-white">સરકારી</span>
                  <span className="text-brand-400">मित्र</span>
                </div>
                <div className="text-[10px] text-amber-300 font-extrabold flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  <span>Powered by ForestWaala</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyPortalLink}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 rounded-xl text-xs font-bold transition-all"
                title="Copy Practice Portal Link to Share"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5 text-brand-400" />}
                <span>{copiedLink ? 'Link Copied!' : 'Share Portal'}</span>
              </button>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <main className="max-w-5xl mx-auto px-4 py-8 space-y-8">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-brand-500/10 text-brand-400 border border-brand-500/20 text-xs font-extrabold uppercase tracking-wider">
              <BookOpen className="w-4 h-4" />
              <span>Official Student Practice Portal</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-snug">
              સ્પર્ધાત્મક પરીક્ષા ઓનલાઇન પ્રેક્ટિસ મોક ટેસ્ટ
            </h1>

            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed font-medium">
              જો તમે સમયસર પરીક્ષા આપી શક્યા નથી, તો અહીંથી મંજૂર થયેલ તમામ મોક ટેસ્ટ અનલિમિટેડ વખત પ્રેક્ટિસ કરી શકો છો.
            </p>

            {/* Telegram & YouTube Quick Join Box */}
            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              <a
                href={TELEGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-xs font-bold shadow-md shadow-sky-500/20 transition-all"
              >
                <Send className="w-4 h-4" />
                <span>Join Telegram for PDF Leaderboards</span>
              </a>

              <a
                href={YOUTUBE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-md shadow-rose-600/20 transition-all"
              >
                <Youtube className="w-4 h-4" />
                <span>Subscribe on YouTube</span>
              </a>
            </div>
          </div>

          {/* Search Bar */}
          <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 shadow-xl max-w-xl mx-auto">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search practice exams by name..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          {/* Exam Grid */}
          {loading ? (
            <div className="py-16 text-center text-slate-400 text-sm space-y-3">
              <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <span>Loading practice tests...</span>
            </div>
          ) : exams.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center space-y-3 max-w-md mx-auto">
              <BookOpen className="w-10 h-10 text-slate-600 mx-auto" />
              <h3 className="font-bold text-slate-300 text-sm">No Practice Exams Available</h3>
              <p className="text-xs text-slate-500">
                New practice tests will be published soon by the administrator. Check back shortly!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {exams.map((exam) => (
                <div
                  key={exam.id}
                  className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-3xl p-6 space-y-4 shadow-xl transition-all flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                          exam.statusBadge === 'LIVE_NOW'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : exam.statusBadge === 'UPCOMING'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-brand-500/20 text-brand-300 border border-brand-500/30'
                        }`}
                      >
                        {exam.statusBadge === 'LIVE_NOW'
                          ? '🟢 LIVE EXAM'
                          : exam.statusBadge === 'UPCOMING'
                          ? '⏳ UPCOMING'
                          : '📚 PRACTICE ARCHIVE'}
                      </span>

                      <span className="text-[11px] text-slate-400 font-semibold">
                        {exam.totalAttempts} Attempts
                      </span>
                    </div>

                    <h3 className="font-extrabold text-white text-base sm:text-lg leading-snug">
                      {exam.title}
                    </h3>

                    {exam.description && (
                      <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed font-normal">
                        {exam.description}
                      </p>
                    )}
                  </div>

                  <div className="space-y-4 pt-2 border-t border-slate-800/80">
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 flex items-center gap-2">
                        <HelpCircle className="w-4 h-4 text-brand-400 flex-shrink-0" />
                        <div>
                          <span className="text-[10px] text-slate-500 font-bold block">Questions</span>
                          <span className="font-bold text-slate-200">{exam.questionCount} MCQs</span>
                        </div>
                      </div>

                      <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 flex items-center gap-2">
                        <Clock className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                        <div>
                          <span className="text-[10px] text-slate-500 font-bold block">Duration</span>
                          <span className="font-bold text-slate-200">{exam.durationMinutes} Mins</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => navigate(`/exam/${exam.publicToken}?practice=true`)}
                      className="w-full py-3 bg-brand-600 hover:bg-brand-500 text-white rounded-2xl text-xs font-extrabold shadow-md shadow-brand-600/30 transition-all flex items-center justify-center gap-2"
                    >
                      <span>Start Practice Test</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-6 text-center text-xs text-slate-500 relative z-10">
        <p>SarkariMitra — Powered by ForestWaala Competitive Exam Portal</p>
      </footer>
    </div>
  );
};

export default StudentPracticePortal;
