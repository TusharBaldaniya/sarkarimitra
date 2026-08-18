import React, { useState, useRef } from 'react';
import { FileText, Download, Share2, X, Check, Eye, EyeOff, Sparkles, Send } from 'lucide-react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

const YOUTUBE_URL = 'https://www.youtube.com/@ForestWaala';
const TELEGRAM_URL = 'https://t.me/Forestwaala';

const QuestionPDFExportModal = ({ isOpen, onClose, title = 'Question Paper', subtitle = '', questions = [] }) => {
  const [includeAnswers, setIncludeAnswers] = useState(true);
  const [generatingPDF, setGeneratingPDF] = useState(false);

  const printTemplateRef = useRef(null);

  if (!isOpen) return null;

  const generatePDFInstance = async () => {
    if (!printTemplateRef.current) throw new Error('Template element not found');

    const canvas = await html2canvas(printTemplateRef.current, {
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

    const imgHeight = (canvasHeight * pdfWidth) / canvasWidth;
    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, imgHeight);
    heightLeft -= pdfHeight;

    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, imgHeight);
      heightLeft -= pdfHeight;
    }

    return pdf;
  };

  const handleDownload = async () => {
    setGeneratingPDF(true);
    try {
      const doc = await generatePDFInstance();
      const safeTitle = title.replace(/[^a-zA-Z0-9\u0A80-\u0AFF]/g, '_');
      const filename = `${safeTitle}_Questions.pdf`;
      doc.save(filename);
      onClose();
    } catch (err) {
      console.error('PDF generation error:', err);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setGeneratingPDF(false);
    }
  };

  const handleShare = async () => {
    setGeneratingPDF(true);
    try {
      const doc = await generatePDFInstance();
      const pdfBlob = doc.output('blob');
      const safeTitle = title.replace(/[^a-zA-Z0-9\u0A80-\u0AFF]/g, '_');
      const filename = `${safeTitle}_Questions.pdf`;
      const file = new File([pdfBlob], filename, { type: 'application/pdf' });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: title,
          text: `Question Collection for ${title} - Powered by ForestWaala`,
        });
      } else {
        doc.save(filename);
      }
      onClose();
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error('Share error:', err);
        handleDownload();
      }
    } finally {
      setGeneratingPDF(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 max-w-md w-full space-y-5 shadow-2xl border border-slate-100 relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1 text-slate-400 hover:text-slate-600 rounded-lg"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-slate-900 text-base">Export Questions PDF</h3>
            <p className="text-xs text-slate-500">{questions.length} MCQs selected for export</p>
          </div>
        </div>

        {/* PDF Option Configurator */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">PDF Output Options</span>
          <label className="flex items-center justify-between cursor-pointer">
            <div className="space-y-0.5 pr-2">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                {includeAnswers ? <Eye className="w-4 h-4 text-emerald-600" /> : <EyeOff className="w-4 h-4 text-slate-400" />}
                <span>Include Answer Key & Explanations</span>
              </span>
              <span className="text-[11px] text-slate-500 block">
                {includeAnswers
                  ? 'Yes: Includes correct answer option & explanation for study revision.'
                  : 'No: Generates clean question paper for student mock practice.'}
              </span>
            </div>
            <input
              type="checkbox"
              checked={includeAnswers}
              onChange={(e) => setIncludeAnswers(e.target.checked)}
              className="w-4 h-4 text-brand-600 rounded border-slate-300 focus:ring-brand-500 cursor-pointer"
            />
          </label>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={handleDownload}
            disabled={generatingPDF || questions.length === 0}
            className="flex-1 py-3 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-2xl shadow-md shadow-brand-600/30 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {generatingPDF ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Download PDF</span>
              </>
            )}
          </button>

          <button
            onClick={handleShare}
            disabled={generatingPDF || questions.length === 0}
            className="py-3 px-4 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-bold rounded-2xl flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            <Share2 className="w-4 h-4" />
            <span>Share</span>
          </button>
        </div>
      </div>

      {/* ================================================================ */}
      {/* HIDDEN PRINTABLE CONTAINER FOR HIGH-RES GUJARATI PDF GENERATION  */}
      {/* ================================================================ */}
      <div className="absolute top-[-9999px] left-[-9999px] pointer-events-none">
        <div
          ref={printTemplateRef}
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
                {includeAnswers ? 'MCQ Question Bank & Key' : 'Official Question Paper'}
              </span>
              <span className="text-[11px] text-slate-400">Total: {questions.length} MCQs</span>
            </div>
          </div>

          {/* Title & Metadata */}
          <div className="border-b border-slate-200 pb-3 space-y-1">
            <h1 className="text-xl font-black text-slate-900 leading-snug">{title}</h1>
            {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
          </div>

          {/* ForestWaala Community Announcement Card */}
          <div className="bg-sky-50 border border-sky-200 rounded-2xl p-4 space-y-1.5">
            <div className="flex items-center gap-2 text-sky-900 font-extrabold text-xs uppercase tracking-wider">
              <Send className="w-4 h-4 text-sky-600" />
              <span>FORESTWAALA OFFICIAL COMPETITIVE EXAM PORTAL</span>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed font-medium">
              Join our Telegram channel & YouTube for daily competitive exam PDF material, test series & model papers:
            </p>
            <div className="flex items-center gap-4 text-xs font-bold text-sky-700 pt-0.5">
              <span>✈️ Telegram: {TELEGRAM_URL}</span>
              <span>🔴 YouTube: {YOUTUBE_URL}</span>
            </div>
          </div>

          {/* MCQ Question List */}
          <div className="space-y-6 pt-2">
            {questions.map((q, idx) => (
              <div key={q.id || idx} className="p-4 rounded-2xl border border-slate-200 bg-white space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <span className="font-extrabold text-slate-900 text-sm leading-snug">
                    પ્રશ્ન {idx + 1}. {q.questionText}
                  </span>
                  <span className="px-2.5 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-bold rounded-md flex-shrink-0">
                    {q.category}
                  </span>
                </div>

                {/* Options 2x2 Grid */}
                <div className="grid grid-cols-2 gap-2 text-xs font-medium pt-1">
                  <div className={`p-2.5 rounded-xl border ${includeAnswers && q.correctAnswer === 'A' ? 'border-emerald-500 bg-emerald-50 text-emerald-900 font-bold' : 'border-slate-200 bg-slate-50 text-slate-800'}`}>
                    (A) {q.optionA}
                  </div>
                  <div className={`p-2.5 rounded-xl border ${includeAnswers && q.correctAnswer === 'B' ? 'border-emerald-500 bg-emerald-50 text-emerald-900 font-bold' : 'border-slate-200 bg-slate-50 text-slate-800'}`}>
                    (B) {q.optionB}
                  </div>
                  <div className={`p-2.5 rounded-xl border ${includeAnswers && q.correctAnswer === 'C' ? 'border-emerald-500 bg-emerald-50 text-emerald-900 font-bold' : 'border-slate-200 bg-slate-50 text-slate-800'}`}>
                    (C) {q.optionC}
                  </div>
                  <div className={`p-2.5 rounded-xl border ${includeAnswers && q.correctAnswer === 'D' ? 'border-emerald-500 bg-emerald-50 text-emerald-900 font-bold' : 'border-slate-200 bg-slate-50 text-slate-800'}`}>
                    (D) {q.optionD}
                  </div>
                </div>

                {/* Answer & Explanation if enabled */}
                {includeAnswers && (
                  <div className="p-3 bg-slate-100 rounded-xl text-xs space-y-1 border border-slate-200/80">
                    <div className="font-bold text-emerald-800">
                      સાચો જવાબ: વિકલ્પ ({q.correctAnswer})
                    </div>
                    {q.explanation && (
                      <div className="text-slate-600 text-[11px]">
                        <strong>સમજૂતી:</strong> {q.explanation}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-400 font-medium">
            <span>SarkariMitra — Powered by ForestWaala</span>
            <span>Telegram: {TELEGRAM_URL}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionPDFExportModal;
