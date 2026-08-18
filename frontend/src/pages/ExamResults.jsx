import React, { useState, useEffect } from 'react';
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
  FileText,
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import api from '../services/api';

const ExamResults = () => {
  const { id } = useParams();

  const [exam, setExam] = useState(null);
  const [stats, setStats] = useState({ totalAttempts: 0, averageScore: 0, highestScore: 0 });
  const [attempts, setAttempts] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [generatingPDF, setGeneratingPDF] = useState(false);

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

  // Generate & Download PDF Function
  const generatePDFBlob = () => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = doc.internal.pageSize.getWidth();

    // 1. Header Box
    doc.setFillColor(15, 23, 42); // slate-900
    doc.rect(0, 0, pageWidth, 28, 'F');

    // Title: સરકારી मित्र — Powered by ForestWaala
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('SarkariMitra - Powered by ForestWaala', 14, 12);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(251, 191, 36); // amber-400
    doc.text('Official Exam Result Leaderboard', 14, 20);

    // 2. Exam Title & Metadata Box
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    const examTitleText = exam ? exam.title : 'Exam Results';
    doc.text(examTitleText, 14, 38);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    const dateStr = new Date().toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
    doc.text(`Generated Date: ${dateStr}`, 14, 44);

    // 3. Summary Stats Grid
    doc.setFillColor(248, 250, 252); // slate-50
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(14, 48, pageWidth - 28, 14, 3, 3, 'FD');

    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(51, 65, 85);
    doc.text(`Total Candidates: ${stats.totalAttempts}`, 18, 57);
    doc.text(`Average Score: ${stats.averageScore}`, (pageWidth / 2) - 15, 57);
    doc.text(`Highest Score: ${stats.highestScore}`, pageWidth - 55, 57);

    // 4. ForestWaala Announcement Banner in PDF
    doc.setFillColor(240, 249, 255); // sky-50
    doc.setDrawColor(186, 230, 253); // sky-200
    doc.roundedRect(14, 65, pageWidth - 28, 16, 3, 3, 'FD');

    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(3, 105, 161); // sky-700
    doc.text('EXAM POWERED BY FORESTWAALA', 18, 71);

    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(51, 65, 85);
    doc.text('For more competitive mock exams, study materials & answer keys, join our Telegram & YouTube channels:', 18, 76);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(2, 132, 199);
    doc.text('Telegram: https://t.me/Forestwaala   |   YouTube: https://www.youtube.com/@ForestWaala', 18, 80);

    // 5. AutoTable Data
    const tableData = attempts.map((att) => [
      `#${att.rank}`,
      att.studentName,
      `${att.score} / ${att.totalQuestions}`,
      `${att.percentage}%`,
      att.submittedAt
        ? new Date(att.submittedAt).toLocaleString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })
        : 'In Progress',
    ]);

    autoTable(doc, {
      startY: 85,
      head: [['Rank', 'Candidate Name', 'Score', 'Percentage', 'Submitted Date']],
      body: tableData,
      theme: 'grid',
      headStyles: {
        fillColor: [30, 41, 59], // slate-800
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 9,
        halign: 'left',
      },
      columnStyles: {
        0: { halign: 'center', cellWidth: 16, fontStyle: 'bold' },
        1: { cellWidth: 'auto', fontStyle: 'bold' },
        2: { halign: 'center', cellWidth: 28, fontStyle: 'bold' },
        3: { halign: 'center', cellWidth: 28, fontStyle: 'bold' },
        4: { cellWidth: 45 },
      },
      styles: {
        fontSize: 8.5,
        cellPadding: 3,
        textColor: [30, 41, 59],
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },
    });

    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text(
        'SarkariMitra — Powered by ForestWaala | Telegram: t.me/Forestwaala',
        14,
        doc.internal.pageSize.getHeight() - 10
      );
      doc.text(
        `Page ${i} of ${pageCount}`,
        pageWidth - 25,
        doc.internal.pageSize.getHeight() - 10
      );
    }

    return doc;
  };

  const handleDownloadPDF = () => {
    setGeneratingPDF(true);
    try {
      const doc = generatePDFBlob();
      const filename = `${exam ? exam.title.replace(/[^a-zA-Z0-9]/g, '_') : 'Exam'}_Leaderboard.pdf`;
      doc.save(filename);
    } catch (err) {
      console.error('Failed to generate PDF:', err);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setGeneratingPDF(false);
    }
  };

  const handleSharePDF = async () => {
    setGeneratingPDF(true);
    try {
      const doc = generatePDFBlob();
      const pdfBlob = doc.output('blob');
      const filename = `${exam ? exam.title.replace(/[^a-zA-Z0-9]/g, '_') : 'Exam'}_Leaderboard.pdf`;
      const file = new File([pdfBlob], filename, { type: 'application/pdf' });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: exam ? exam.title : 'Exam Results',
          text: `Exam Leaderboard Results for ${exam ? exam.title : 'Exam'} - Powered by ForestWaala`,
        });
      } else {
        // Fallback to download if Web Share API files not supported on current browser
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
            <span>{generatingPDF ? 'Generating...' : 'Download Results PDF'}</span>
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
    </div>
  );
};

export default ExamResults;
