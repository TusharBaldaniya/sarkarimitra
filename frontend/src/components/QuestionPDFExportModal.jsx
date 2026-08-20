import React, { useState, useRef } from 'react';
import { FileText, Download, Share2, X, Eye, EyeOff, Sparkles, Send } from 'lucide-react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

const YOUTUBE_URL = 'https://www.youtube.com/@ForestWaala';
const TELEGRAM_URL = 'https://t.me/Forestwaala';

const QuestionPDFExportModal = ({ isOpen, onClose, title = 'Question Paper', subtitle = '', questions = [] }) => {
  const [includeAnswers, setIncludeAnswers] = useState(true);
  const [generatingPDF, setGeneratingPDF] = useState(false);
  const [progressText, setProgressText] = useState('');

  const chunkTemplateRef = useRef(null);

  if (!isOpen) return null;

  // Split questions into pages so NO question box gets sliced in half
  const buildPageChunks = (questionsList, includeAns) => {
    const pages = [];
    let currentPageQuestions = [];

    // Page 1 has top header banner & community box, so holds 3-4 questions
    // Subsequent pages hold 5-6 questions
    const firstPageLimit = includeAns ? 3 : 4;
    const otherPageLimit = includeAns ? 5 : 6;

    let limitForCurrentPage = firstPageLimit;

    for (let i = 0; i < questionsList.length; i++) {
      currentPageQuestions.push({ question: questionsList[i], index: i + 1 });
      if (currentPageQuestions.length >= limitForCurrentPage || i === questionsList.length - 1) {
        pages.push([...currentPageQuestions]);
        currentPageQuestions = [];
        limitForCurrentPage = otherPageLimit;
      }
    }

    return pages;
  };

  const generatePDFInstance = async () => {
    const container = chunkTemplateRef.current;
    if (!container) throw new Error('Template element not found');

    const pageChunks = buildPageChunks(questions, includeAnswers);
    const totalPages = pageChunks.length;

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    for (let pIdx = 0; pIdx < totalPages; pIdx++) {
      setProgressText(`Rendering Page ${pIdx + 1} of ${totalPages}...`);
      const chunkQuestions = pageChunks[pIdx];

      // Populate DOM node with specific page content & watermark
      renderPageChunkToDOM(container, chunkQuestions, pIdx + 1, totalPages);

      // Wait brief moment for DOM render & image loading
      await new Promise((r) => setTimeout(r, 80));

      const canvas = await html2canvas(container, {
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

      if (pIdx > 0) pdf.addPage();
      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, Math.min(pdfHeight, imgHeight));
    }

    return pdf;
  };

  // Render HTML for a single A4 page with ForestWaala Watermark & intact questions
  const renderPageChunkToDOM = (container, pageQuestions, pageNum, totalPages) => {
    const isFirstPage = pageNum === 1;

    container.innerHTML = `
      <div style="width: 800px; min-height: 1120px; padding: 28px; background: #ffffff; color: #0f172a; font-family: 'Inter', system-ui, -apple-system, sans-serif; box-sizing: border-box; position: relative; display: flex; flex-direction: column; justify-content: space-between;">
        
        {/* ================= WATERMARK LAYER ON ALL PAGES ================= */}
        <div style="position: absolute; inset: 0; display: flex; flex-direction: column; items-center; justify-content: center; opacity: 0.07; pointer-events: none; z-index: 0; text-align: center; margin-top: 100px;">
          <img src="/forestwallah.jpg" style="width: 280px; height: 280px; border-radius: 50%; object-fit: cover; margin: 0 auto; filter: grayscale(20%);" />
          <div style="font-size: 38px; font-weight: 900; letter-spacing: 4px; color: #0f172a; margin-top: 14px; text-transform: uppercase;">
            FORESTWAALA
          </div>
          <div style="font-size: 14px; font-weight: 800; color: #334155; margin-top: 4px; letter-spacing: 1px;">
            COMPETITIVE EXAM PORTAL
          </div>
        </div>

        {/* Content Container (Layered above Watermark) */}
        <div style="position: relative; z-index: 10; flex: 1;">
          
          ${
            isFirstPage
              ? `
            {/* Header Banner on Page 1 */}
            <div style="background: #0f172a; color: #ffffff; padding: 18px 22px; border-radius: 16px; border: 1px solid #1e293b; display: flex; align-items: center; justify-content: space-between;">
              <div style="display: flex; align-items: center; gap: 14px;">
                <img src="/forestwallah.jpg" style="width: 50px; height: 50px; border-radius: 50%; border: 2px solid #fbbf24; object-fit: cover;" />
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
                  ${includeAnswers ? 'MCQ Question Bank & Key' : 'Official Question Paper'}
                </span>
                <div style="font-size: 10px; color: #94a3b8; margin-top: 4px;">
                  Total: ${questions.length} MCQs
                </div>
              </div>
            </div>

            <!-- Title & Metadata -->
            <div style="border-bottom: 1px solid #e2e8f0; padding-bottom: 10px; margin-top: 14px;">
              <h1 style="font-size: 17px; font-weight: 900; color: #0f172a; margin: 0; line-height: 1.3;">${escapeHTML(title)}</h1>
              ${subtitle ? `<p style="font-size: 11px; color: #64748b; margin: 3px 0 0 0;">${escapeHTML(subtitle)}</p>` : ''}
            </div>

            <!-- ForestWaala Community Announcement Card -->
            <div style="background: rgba(240, 249, 255, 0.95); border: 1px solid #bae6fd; border-radius: 14px; padding: 10px 14px; margin-top: 12px;">
              <div style="font-size: 10px; font-weight: 800; color: #0369a1; text-transform: uppercase;">
                📢 FORESTWAALA OFFICIAL COMPETITIVE EXAM PORTAL
              </div>
              <div style="font-size: 10.5px; color: #334155; margin-top: 2px;">
                Join our Telegram channel & YouTube for daily competitive exam PDF material & test series:
              </div>
              <div style="font-size: 10.5px; font-weight: 700; color: #0284c7; margin-top: 4px; display: flex; gap: 16px;">
                <span>✈️ Telegram: ${TELEGRAM_URL}</span>
                <span>🔴 YouTube: ${YOUTUBE_URL}</span>
              </div>
            </div>
          `
              : `
            {/* Header Banner on Page 2+ */}
            <div style="background: #0f172a; color: #ffffff; padding: 12px 18px; border-radius: 12px; display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px;">
              <div style="display: flex; align-items: center; gap: 10px;">
                <img src="/forestwallah.jpg" style="width: 32px; height: 32px; border-radius: 50%; border: 1px solid #fbbf24; object-fit: cover;" />
                <span style="font-size: 14px; font-weight: 900;"><span style="color:#ffffff;">સરકારી</span> <span style="color:#60a5fa;">मित्र</span> — Powered by ForestWaala</span>
              </div>
              <span style="font-size: 10px; color: #fcd34d; font-weight: 700;">${escapeHTML(title)}</span>
            </div>
          `
          }

          {/* MCQ Question List (Intact Blocks) */}
          <div style="margin-top: 14px; display: flex; flex-direction: column; gap: 14px;">
            ${pageQuestions
              .map(
                (item) => `
              <div style="padding: 14px; border-radius: 14px; border: 1px solid #cbd5e1; background: rgba(255, 255, 255, 0.95); box-shadow: 0 1px 2px rgba(0,0,0,0.03);">
                <div style="display: flex; align-items: flex-start; justify-content: space-between; gap: 10px;">
                  <span style="font-weight: 900; font-size: 13px; color: #0f172a; line-height: 1.4;">
                    પ્રશ્ન ${item.index}. ${escapeHTML(item.question.questionText)}
                  </span>
                  <span style="background: #f1f5f9; color: #475569; font-size: 9.5px; font-weight: 800; padding: 2px 8px; border-radius: 6px; flex-shrink: 0;">
                    ${escapeHTML(item.question.category || 'GK')}
                  </span>
                </div>

                <!-- 2x2 Grid Options -->
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 10px; font-size: 11px;">
                  <div style="padding: 8px 10px; border-radius: 8px; border: 1px solid ${includeAnswers && item.question.correctAnswer === 'A' ? '#10b981' : '#e2e8f0'}; background: ${includeAnswers && item.question.correctAnswer === 'A' ? '#ecfdf5' : '#f8fafc'}; color: ${includeAnswers && item.question.correctAnswer === 'A' ? '#065f46' : '#1e293b'}; font-weight: ${includeAnswers && item.question.correctAnswer === 'A' ? '800' : '500'};">
                    (A) ${escapeHTML(item.question.optionA)}
                  </div>
                  <div style="padding: 8px 10px; border-radius: 8px; border: 1px solid ${includeAnswers && item.question.correctAnswer === 'B' ? '#10b981' : '#e2e8f0'}; background: ${includeAnswers && item.question.correctAnswer === 'B' ? '#ecfdf5' : '#f8fafc'}; color: ${includeAnswers && item.question.correctAnswer === 'B' ? '#065f46' : '#1e293b'}; font-weight: ${includeAnswers && item.question.correctAnswer === 'B' ? '800' : '500'};">
                    (B) ${escapeHTML(item.question.optionB)}
                  </div>
                  <div style="padding: 8px 10px; border-radius: 8px; border: 1px solid ${includeAnswers && item.question.correctAnswer === 'C' ? '#10b981' : '#e2e8f0'}; background: ${includeAnswers && item.question.correctAnswer === 'C' ? '#ecfdf5' : '#f8fafc'}; color: ${includeAnswers && item.question.correctAnswer === 'C' ? '#065f46' : '#1e293b'}; font-weight: ${includeAnswers && item.question.correctAnswer === 'C' ? '800' : '500'};">
                    (C) ${escapeHTML(item.question.optionC)}
                  </div>
                  <div style="padding: 8px 10px; border-radius: 8px; border: 1px solid ${includeAnswers && item.question.correctAnswer === 'D' ? '#10b981' : '#e2e8f0'}; background: ${includeAnswers && item.question.correctAnswer === 'D' ? '#ecfdf5' : '#f8fafc'}; color: ${includeAnswers && item.question.correctAnswer === 'D' ? '#065f46' : '#1e293b'}; font-weight: ${includeAnswers && item.question.correctAnswer === 'D' ? '800' : '500'};">
                    (D) ${escapeHTML(item.question.optionD)}
                  </div>
                </div>

                ${
                  includeAnswers
                    ? `
                  <div style="margin-top: 8px; padding: 8px 10px; background: #f1f5f9; border-radius: 8px; border: 1px solid #e2e8f0; font-size: 11px;">
                    <div style="font-weight: 800; color: #047857;">
                      સાચો જવાબ: વિકલ્પ (${item.question.correctAnswer})
                    </div>
                    ${
                      item.question.explanation
                        ? `<div style="color: #475569; font-size: 10.5px; margin-top: 2px;"><strong>સમજૂતી:</strong> ${escapeHTML(item.question.explanation)}</div>`
                        : ''
                    }
                  </div>
                `
                    : ''
                }
              </div>
            `
              )
              .join('')}
          </div>
        </div>

        {/* Footer (Layered above Watermark) */}
        <div style="position: relative; z-index: 10; padding-top: 12px; margin-top: 16px; border-top: 1px solid #cbd5e1; display: flex; align-items: center; justify-content: space-between; font-size: 10px; color: #64748b; font-weight: 600;">
          <span>SarkariMitra — Powered by ForestWaala</span>
          <span>Page ${pageNum} of ${totalPages} • Telegram: t.me/Forestwaala</span>
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
      setProgressText('');
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
      setProgressText('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 max-w-md w-full space-y-5 shadow-2xl border border-slate-100 relative">
        <button
          onClick={onClose}
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
              disabled={generatingPDF}
              className="w-4 h-4 text-brand-600 rounded border-slate-300 focus:ring-brand-500 cursor-pointer"
            />
          </label>
        </div>

        {generatingPDF && (
          <div className="p-3 bg-brand-50 text-brand-800 rounded-xl text-xs font-bold text-center animate-pulse flex items-center justify-center gap-2">
            <div className="w-4 h-4 border-2 border-brand-600 border-t-transparent rounded-full animate-spin"></div>
            <span>{progressText || 'Generating High-Quality PDF...'}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={handleDownload}
            disabled={generatingPDF || questions.length === 0}
            className="flex-1 py-3 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-2xl shadow-md shadow-brand-600/30 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>Download PDF</span>
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

      {/* Hidden DOM element node used for rendering page chunks */}
      <div className="absolute top-[-9999px] left-[-9999px] pointer-events-none">
        <div ref={chunkTemplateRef}></div>
      </div>
    </div>
  );
};

export default QuestionPDFExportModal;
