import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Users,
  Trophy,
  BarChart3,
  Search,
  ChevronRight,
  ChevronLeft,
  UserCheck,
  Download,
  Share2,
  Send,
  Sparkles,
  X,
  FileText,
  Filter,
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

  // UI Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 25;

  // PDF Export Modal & Range Config
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportLimit, setExportLimit] = useState('50'); // '50', '100', 'all'
  const [generatingPDF, setGeneratingPDF] = useState(false);
  const [pdfProgressText, setPdfProgressText] = useState('');

  // Ref for hidden chunk container
  const chunkContainerRef = useRef(null);

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
        setCurrentPage(1);
      }
    } catch (err) {
      console.error('Failed to load exam results:', err);
    } finally {
      setLoading(false);
    }
  };

  // High-Performance Paginated Chunk PDF Generation (< 2 seconds for 500+ candidates)
  const generatePDFInstance = async (selectedLimit) => {
    let targetAttempts = [...attempts];
    if (selectedLimit === '50') {
      targetAttempts = targetAttempts.slice(0, 50);
    } else if (selectedLimit === '100') {
      targetAttempts = targetAttempts.slice(0, 100);
    }

    const chunkSize = 30; // 30 candidates per page chunk for optimal memory & A4 ratio
    const chunks = [];
    for (let i = 0; i < targetAttempts.length; i += chunkSize) {
      chunks.push(targetAttempts.slice(i, i + chunkSize));
    }

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    const containerEl = chunkContainerRef.current;
    if (!containerEl) throw new Error('Chunk template not ready');

    for (let cIdx = 0; cIdx < chunks.length; cIdx++) {
      setPdfProgressText(`Rendering Page ${cIdx + 1} of ${chunks.length}...`);
      const chunkData = chunks[cIdx];

      // Temporarily populate the hidden chunk container DOM
      renderChunkToDOM(containerEl, chunkData, cIdx + 1, chunks.length);

      // Wait a frame for DOM layout
      await new Promise((r) => setTimeout(r, 60));

      const canvas = await html2canvas(containerEl, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: '#ffffff',
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.92);
      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;
      const imgHeight = (canvasHeight * pdfWidth) / canvasWidth;

      if (cIdx > 0) pdf.addPage();
      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, Math.min(pdfHeight, imgHeight));
    }

    return pdf;
  };

  // Render a specific chunk into hidden template node
  const renderChunkToDOM = (container, chunkData, pageNum, totalPages) => {
    const isFirstPage = pageNum === 1;

    container.innerHTML = `
      <div style="width: 800px; padding: 28px; background: #ffffff; color: #0f172a; font-family: 'Inter', system-ui, sans-serif; box-sizing: border-box;">
        <!-- Header Banner with ForestWaala Circular Logo & Title -->
        <div style="background: #0f172a; color: #ffffff; padding: 20px 24px; border-radius: 16px; border: 1px solid #1e293b; display: flex; align-items: center; justify-content: space-between;">
          <div style="display: flex; align-items: center; gap: 16px;">
            <img src="/forestwallah.jpg" style="width: 52px; height: 52px; border-radius: 50%; border: 2px solid #fbbf24; object-fit: cover;" />
            <div>
              <div style="font-size: 22px; font-weight: 900; letter-spacing: -0.5px;">
                <span style="color: #ffffff;">સરકારી</span> <span style="color: #60a5fa;">मित्र</span>
              </div>
              <div style="font-size: 11px; font-weight: 800; color: #fcd34d; margin-top: 2px;">
                Powered by ForestWaala
              </div>
            </div>
          </div>
          <div style="text-align: right;">
            <span style="background: rgba(251, 191, 36, 0.2); color: #fcd34d; border: 1px solid rgba(251, 191, 36, 0.3); padding: 4px 10px; border-radius: 8px; font-size: 11px; font-weight: 800; text-transform: uppercase;">
              Result Leaderboard
            </span>
            <div style="font-size: 10px; color: #94a3b8; margin-top: 4px;">
              Page ${pageNum} of ${totalPages}
            </div>
          </div>
        </div>

        ${
          isFirstPage
            ? `
          <!-- Exam Title & Stats Banner on Page 1 -->
          <div style="border-bottom: 1px solid #e2e8f0; padding-bottom: 12px; margin-top: 18px;">
            <h1 style="font-size: 18px; font-weight: 900; color: #0f172a; margin: 0;">${exam ? exam.title : 'Exam Results'}</h1>
            <p style="font-size: 11px; color: #64748b; margin: 4px 0 0 0;">
              Generated: ${new Date().toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>

          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; background: #f8fafc; padding: 12px; border-radius: 14px; border: 1px solid #e2e8f0; text-align: center; margin-top: 14px;">
            <div>
              <span style="font-size: 10px; font-weight: 700; color: #94a3b8; text-transform: uppercase; display: block;">Total Candidates</span>
              <span style="font-size: 18px; font-weight: 900; color: #0f172a;">${stats.totalAttempts}</span>
            </div>
            <div>
              <span style="font-size: 10px; font-weight: 700; color: #94a3b8; text-transform: uppercase; display: block;">Average Score</span>
              <span style="font-size: 18px; font-weight: 900; color: #1d4ed8;">${stats.averageScore}</span>
            </div>
            <div>
              <span style="font-size: 10px; font-weight: 700; color: #94a3b8; text-transform: uppercase; display: block;">Highest Score</span>
              <span style="font-size: 18px; font-weight: 900; color: #047857;">${stats.highestScore}</span>
            </div>
          </div>

          <!-- Top 3 Rankers Honor Banner Cards -->
          ${
            attempts.length > 0
              ? `
            <div style="margin-top: 14px;">
              <div style="font-size: 11px; font-weight: 900; color: #0f172a; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px;">
                🏆 TOP RANKERS HONOR ROLL
              </div>
              <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px;">
                ${
                  attempts[0]
                    ? `
                  <div style="background: #fef3c7; border: 1.5px solid #f59e0b; border-radius: 12px; padding: 10px; text-align: center;">
                    <div style="font-size: 16px;">🥇 <strong style="color: #b45309; font-size: 11px; text-transform: uppercase;">RANK #1</strong></div>
                    <div style="font-size: 12px; font-weight: 900; color: #78350f; margin-top: 2px; text-overflow: ellipsis; overflow: hidden; white-space: nowrap;">${escapeHTML(attempts[0].studentName)}</div>
                    <div style="font-size: 11px; font-weight: 800; color: #d97706; margin-top: 2px;">${attempts[0].score} / ${attempts[0].totalQuestions} (${attempts[0].percentage}%)</div>
                  </div>
                `
                    : ''
                }
                ${
                  attempts[1]
                    ? `
                  <div style="background: #f1f5f9; border: 1.5px solid #94a3b8; border-radius: 12px; padding: 10px; text-align: center;">
                    <div style="font-size: 16px;">🥈 <strong style="color: #475569; font-size: 11px; text-transform: uppercase;">RANK #2</strong></div>
                    <div style="font-size: 12px; font-weight: 900; color: #1e293b; margin-top: 2px; text-overflow: ellipsis; overflow: hidden; white-space: nowrap;">${escapeHTML(attempts[1].studentName)}</div>
                    <div style="font-size: 11px; font-weight: 800; color: #475569; margin-top: 2px;">${attempts[1].score} / ${attempts[1].totalQuestions} (${attempts[1].percentage}%)</div>
                  </div>
                `
                    : ''
                }
                ${
                  attempts[2]
                    ? `
                  <div style="background: #ffedd5; border: 1.5px solid #ea580c; border-radius: 12px; padding: 10px; text-align: center;">
                    <div style="font-size: 16px;">🥉 <strong style="color: #c2410c; font-size: 11px; text-transform: uppercase;">RANK #3</strong></div>
                    <div style="font-size: 12px; font-weight: 900; color: #7c2d12; margin-top: 2px; text-overflow: ellipsis; overflow: hidden; white-space: nowrap;">${escapeHTML(attempts[2].studentName)}</div>
                    <div style="font-size: 11px; font-weight: 800; color: #ea580c; margin-top: 2px;">${attempts[2].score} / ${attempts[2].totalQuestions} (${attempts[2].percentage}%)</div>
                  </div>
                `
                    : ''
                }
              </div>
            </div>
          `
              : ''
          }

          <div style="background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 14px; padding: 10px 14px; margin-top: 14px; text-align: center;">
            <div style="font-size: 11px; font-weight: 800; color: #0369a1; text-transform: uppercase;">
              📢 EXAM POWERED BY FORESTWAALA
            </div>
            <div style="font-size: 11px; color: #334155; margin-top: 4px;">
              For study materials & official notifications, join:
              <strong style="color: #0284c7;">Telegram: https://t.me/Forestwaala</strong> |
              <strong style="color: #e11d48;">YouTube: https://www.youtube.com/@ForestWaala</strong>
            </div>
          </div>
        `
            : ''
        }

        <!-- Leaderboard Table Chunk -->
        <div style="border: 1px solid #e2e8f0; border-radius: 14px; overflow: hidden; margin-top: 16px;">
          <table style="width: 100%; text-align: left; font-size: 12px; border-collapse: collapse;">
            <thead>
              <tr style="background: #0f172a; color: #ffffff; font-weight: 800; font-size: 11px; text-transform: uppercase;">
                <th style="padding: 10px; text-align: center; width: 60px;">Rank</th>
                <th style="padding: 10px;">Candidate Name</th>
                <th style="padding: 10px; text-align: center;">Score</th>
                <th style="padding: 10px; text-align: center;">Percentage</th>
                <th style="padding: 10px;">Submitted Date</th>
              </tr>
            </thead>
            <tbody>
              ${chunkData
                .map(
                  (att, idx) => `
                <tr style="background: ${idx % 2 === 0 ? '#ffffff' : '#f8fafc'}; border-top: 1px solid #f1f5f9;">
                  <td style="padding: 9px; text-align: center; font-weight: 900; color: #0f172a;">
                    ${att.rank === 1 ? '🥇 #1' : att.rank === 2 ? '🥈 #2' : att.rank === 3 ? '🥉 #3' : `#${att.rank}`}
                  </td>
                  <td style="padding: 9px; font-weight: 700; color: #0f172a;">${escapeHTML(att.studentName)}</td>
                  <td style="padding: 9px; text-align: center; font-weight: 800; color: #1e293b;">
                    ${att.score} / ${att.totalQuestions}
                  </td>
                  <td style="padding: 9px; text-align: center; font-weight: 800;">
                    <span style="background: #f1f5f9; color: #0f172a; padding: 2px 8px; border-radius: 12px; border: 1px solid #cbd5e1; font-size: 11px;">
                      ${att.percentage}%
                    </span>
                  </td>
                  <td style="padding: 9px; font-size: 11px; color: #64748b;">
                    ${
                      att.submittedAt
                        ? new Date(att.submittedAt).toLocaleString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : 'In Progress'
                    }
                  </td>
                </tr>
              `
                )
                .join('')}
            </tbody>
          </table>
        </div>

        <!-- Footer -->
        <div style="margin-top: 20px; padding-top: 12px; border-top: 1px solid #e2e8f0; display: flex; justify-content: space-between; font-size: 10px; color: #94a3b8;">
          <span>SarkariMitra — Powered by ForestWaala</span>
          <span>Telegram: https://t.me/Forestwaala</span>
        </div>
      </div>
    `;
  };

  const escapeHTML = (str) =>
    String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');

  const handleExecutePDFDownload = async () => {
    if (attempts.length === 0) return;
    setGeneratingPDF(true);
    try {
      const doc = await generatePDFInstance(exportLimit);
      const filename = `${exam ? exam.title.replace(/[^a-zA-Z0-9\u0A80-\u0AFF]/g, '_') : 'Exam'}_Leaderboard.pdf`;
      doc.save(filename);
      setIsExportModalOpen(false);
    } catch (err) {
      console.error('Failed to generate PDF:', err);
      alert('Failed to generate PDF leaderboard. Please try again.');
    } finally {
      setGeneratingPDF(false);
      setPdfProgressText('');
    }
  };

  const handleExecutePDFShare = async () => {
    if (attempts.length === 0) return;
    setGeneratingPDF(true);
    try {
      const doc = await generatePDFInstance(exportLimit);
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
      setIsExportModalOpen(false);
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error('Share error:', err);
        handleExecutePDFDownload();
      }
    } finally {
      setGeneratingPDF(false);
      setPdfProgressText('');
    }
  };

  // Pagination for UI Table
  const totalPages = Math.ceil(attempts.length / itemsPerPage) || 1;
  const paginatedAttempts = attempts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

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
            onClick={() => setIsExportModalOpen(true)}
            disabled={attempts.length === 0}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md shadow-brand-600/30 transition-all disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>Export Results PDF</span>
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

      {/* Attempts Leaderboard Table (UI Paginated) */}
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
          <>
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
                  {paginatedAttempts.map((att) => (
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

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
                <span>
                  Showing <strong className="text-slate-800">{(currentPage - 1) * itemsPerPage + 1}</strong> to{' '}
                  <strong className="text-slate-800">{Math.min(currentPage * itemsPerPage, attempts.length)}</strong> of{' '}
                  <strong className="text-slate-800">{attempts.length}</strong> candidates
                </span>

                <div className="flex items-center gap-2">
                  <button
                    disabled={currentPage <= 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    className="p-1.5 bg-white border border-slate-200 rounded-lg disabled:opacity-40 hover:bg-slate-100"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="font-bold text-slate-800">Page {currentPage} / {totalPages}</span>
                  <button
                    disabled={currentPage >= totalPages}
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    className="p-1.5 bg-white border border-slate-200 rounded-lg disabled:opacity-40 hover:bg-slate-100"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Export Range & Fast PDF Generation Modal */}
      {isExportModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full space-y-5 shadow-2xl border border-slate-100 relative">
            <button
              onClick={() => setIsExportModalOpen(false)}
              disabled={generatingPDF}
              className="absolute right-4 top-4 p-1 text-slate-400 hover:text-slate-600 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">Download Results Leaderboard PDF</h3>
                <p className="text-xs text-slate-500">Select candidate export range ({attempts.length} Total Attempts)</p>
              </div>
            </div>

            {/* Range Selection Options */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Export Candidate Range
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setExportLimit('50')}
                  className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all ${
                    exportLimit === '50'
                      ? 'bg-brand-600 text-white border-brand-600 shadow-sm'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Top 50
                </button>
                <button
                  type="button"
                  onClick={() => setExportLimit('100')}
                  className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all ${
                    exportLimit === '100'
                      ? 'bg-brand-600 text-white border-brand-600 shadow-sm'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Top 100
                </button>
                <button
                  type="button"
                  onClick={() => setExportLimit('all')}
                  className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all ${
                    exportLimit === 'all'
                      ? 'bg-brand-600 text-white border-brand-600 shadow-sm'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  All ({attempts.length})
                </button>
              </div>
            </div>

            {generatingPDF && (
              <div className="p-3 bg-brand-50 text-brand-800 rounded-xl text-xs font-bold text-center animate-pulse flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-brand-600 border-t-transparent rounded-full animate-spin"></div>
                <span>{pdfProgressText || 'Generating High-Speed PDF...'}</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={handleExecutePDFDownload}
                disabled={generatingPDF}
                className="flex-1 py-3 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-2xl shadow-md shadow-brand-600/30 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                <span>Download PDF</span>
              </button>

              <button
                onClick={handleExecutePDFShare}
                disabled={generatingPDF}
                className="py-3 px-4 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-bold rounded-2xl flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                <Share2 className="w-4 h-4" />
                <span>Share</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hidden DOM element node used for rendering page chunks */}
      <div className="absolute top-[-9999px] left-[-9999px] pointer-events-none">
        <div ref={chunkContainerRef}></div>
      </div>
    </div>
  );
};

export default ExamResults;
