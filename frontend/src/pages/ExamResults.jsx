import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Users,
  Trophy,
  BarChart3,
  Search,
  ChevronRight,
  UserCheck,
  Download,
  Share2,
  Send,
  Youtube,
  Sparkles,
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import api from '../services/api';

const YOUTUBE_URL = 'https://www.youtube.com/@ForestWaala';
const TELEGRAM_URL = 'https://t.me/Forestwaala';

const ExamResults = () => {
  const { id } = useParams();

  const [exam, setExam] = useState(null);
  const [stats, setStats] = useState({ totalAttempts: 0, averageScore: 0, highestScore: 0 });
  const [attempts, setAttempts] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [generatingPDF, setGeneratingPDF] = useState(false);

  // Hidden container ref for rendering high-res Gujarati PDF report
  const pdfReportRef = useRef(null);

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

  // Generate jsPDF instance from html2canvas screenshot (Full Unicode & Gujarati Support)
  const generatePDFInstance = async () => {
    if (!pdfReportRef.current) throw new Error('Report element not ready');

    // Capture the hidden PDF element with high resolution (scale 2)
    const canvas = await html2canvas(pdfReportRef.current, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      logging: false,
      backgroundColor: '#ffffff',
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;

    // Calculate height maintaining aspect ratio
    const imgHeight = (canvasHeight * pdfWidth) / canvasWidth;
    let heightLeft = imgHeight;
    let position = 0;

    // Add first page
    pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, imgHeight);
    heightLeft -= pdfHeight;

    // Multi-page handling if content exceeds 1 page
    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, imgHeight);
      heightLeft -= pdfHeight;
    }

    return pdf;
  };

  const handleDownloadPDF = async () => {
    if (attempts.length === 0) return;
    setGeneratingPDF(true);
    try {
      const doc = await generatePDFInstance();
      const filename = `${exam ? exam.title.replace(/[^a-zA-Z0-9\u0A80-\u0AFF]/g, '_') : 'Exam'}_Leaderboard.pdf`;
      doc.save(filename);
    } catch (err) {
      console.error('Failed to generate PDF:', err);
      alert('Failed to generate PDF leaderboard. Please try again.');
    } finally {
      setGeneratingPDF(false);
    }
  };

  const handleSharePDF = async () => {
    if (attempts.length === 0) return;
    setGeneratingPDF(true);
    try {
      const doc = await generatePDFInstance();
      const pdfBlob = doc.output('blob');
      const filename = `${exam ? exam.title.replace(/[^a-zA-Z0-9\u0A80-\u0AFF]/g, '_') : 'Exam'}_Leaderboard.pdf`;
      const file = new File([pdfBlob], filename, { type: 'application/pdf' });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: exam ? exam.title : 'Exam Results',
          text: `Exam Leaderboard Results for ${exam ? exam.title : 'Exam'} - Powered by ForestWaala`,
        });
      } else {
        doc.save(filename);
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error('Share error:', err);
        handleDownloadPDF();
      }
    } finally {
      setGeneratingPDF(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Navigation & Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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

        {/* Export PDF & Share Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadPDF}
            disabled={generatingPDF || attempts.length === 0}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md shadow-brand-600/30 transition-all disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>{generatingPDF ? 'Generating PDF...' : 'Download Results PDF'}</span>
          </button>

          <button
            onClick={handleSharePDF}
            disabled={generatingPDF || attempts.length === 0}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-bold text-xs sm:text-sm rounded-xl transition-all disabled:opacity-50"
            title="Share Result PDF"
          >
            <Share2 className="w-4 h-4" />
            <span className="hidden sm:inline">Share</span>
          </button>
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

      {/* ================================================================ */}
      {/* HIDDEN PRINTABLE CONTAINER FOR HIGH-RES GUJARATI PDF GENERATION  */}
      {/* ================================================================ */}
      <div className="absolute top-[-9999px] left-[-9999px] pointer-events-none">
        <div
          ref={pdfReportRef}
          className="w-[800px] bg-white text-slate-900 font-sans p-8 space-y-6"
          style={{ fontFamily: "'Inter', system-ui, -apple-system, sans-serif" }}
        >
          {/* Header Banner with ForestWaala Circular Logo & Title */}
          <div className="bg-slate-950 text-white p-6 rounded-2xl shadow-md border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img
                src="/forestwallah.jpg"
                alt="ForestWaala Logo"
                className="w-14 h-14 rounded-full border-2 border-brand-400 shadow-lg object-cover"
              />
              <div>
                <div className="text-2xl font-black tracking-tight flex items-center gap-2">
                  <span className="text-white">સરકારી</span>
                  <span className="text-brand-400">मित्र</span>
                </div>
                <div className="inline-flex items-center gap-1 text-xs font-extrabold text-amber-300">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Powered by ForestWaala</span>
                </div>
              </div>
            </div>

            <div className="text-right space-y-0.5">
              <span className="px-3 py-1 bg-brand-500/20 text-brand-300 border border-brand-500/30 rounded-lg text-xs font-bold uppercase tracking-wider block">
                Official Leaderboard
              </span>
              <span className="text-[11px] text-slate-400">
                Generated: {new Date().toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>

          {/* Exam Title & Overview */}
          <div className="border-b border-slate-200 pb-4 space-y-1">
            <h1 className="text-xl font-black text-slate-900 leading-snug">
              {exam ? exam.title : 'Exam Results'}
            </h1>
            {exam?.description && (
              <p className="text-xs text-slate-500 leading-relaxed">{exam.description}</p>
            )}
          </div>

          {/* Aggregated Stats Metrics Bar */}
          <div className="grid grid-cols-3 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200/80 text-center">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Total Candidates</span>
              <span className="text-xl font-black text-slate-900">{stats.totalAttempts}</span>
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Average Score</span>
              <span className="text-xl font-black text-brand-700">{stats.averageScore}</span>
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Highest Score</span>
              <span className="text-xl font-black text-emerald-700">{stats.highestScore}</span>
            </div>
          </div>

          {/* ForestWaala Community Announcement Card */}
          <div className="bg-sky-50 border border-sky-200 rounded-2xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-sky-900 font-extrabold text-xs uppercase tracking-wider">
              <Send className="w-4 h-4 text-sky-600" />
              <span>Exam Powered by ForestWaala</span>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed font-medium">
              For more competitive mock exams, study materials & full answer keys, join our official Telegram and YouTube channels:
            </p>
            <div className="flex items-center gap-4 text-xs font-bold text-sky-700 pt-0.5">
              <span>✈️ Telegram: https://t.me/Forestwaala</span>
              <span>🔴 YouTube: https://www.youtube.com/@ForestWaala</span>
            </div>
          </div>

          {/* Leaderboard Table in PDF */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900 text-white uppercase tracking-wider font-extrabold text-[11px]">
                <tr>
                  <th className="p-3 text-center w-14">Rank</th>
                  <th className="p-3">Candidate Name</th>
                  <th className="p-3 text-center">Score</th>
                  <th className="p-3 text-center">Percentage</th>
                  <th className="p-3">Submitted Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {attempts.map((att) => (
                  <tr key={att.attemptId} className="even:bg-slate-50/60">
                    <td className="p-3 text-center font-black">
                      {att.rank === 1 ? '🥇 #1' : att.rank === 2 ? '🥈 #2' : att.rank === 3 ? '🥉 #3' : `#${att.rank}`}
                    </td>
                    <td className="p-3 font-bold text-slate-900">{att.studentName}</td>
                    <td className="p-3 text-center font-bold text-slate-800">
                      {att.score} / {att.totalQuestions}
                    </td>
                    <td className="p-3 text-center font-bold">
                      <span className="px-2.5 py-0.5 rounded-full text-xs bg-slate-100 text-slate-800 border border-slate-200">
                        {att.percentage}%
                      </span>
                    </td>
                    <td className="p-3 text-slate-500 text-[11px]">
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer inside PDF */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-400 font-medium">
            <span>SarkariMitra — Powered by ForestWaala</span>
            <span>Telegram: https://t.me/Forestwaala • YouTube: https://www.youtube.com/@ForestWaala</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExamResults;
