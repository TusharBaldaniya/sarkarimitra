import React, { useState } from 'react';
import { X, Upload, FileText, CheckCircle2, AlertTriangle, Download } from 'lucide-react';
import api from '../services/api';

const SAMPLE_CSV = `questionText,optionA,optionB,optionC,optionD,correctAnswer,category,difficulty,explanation
"Who was the first President of India?","Dr. Rajendra Prasad","S. Radhakrishnan","Jawaharlal Nehru","Vallabhbhai Patel","A","History","Easy","Dr. Rajendra Prasad was the first President of India."
"Capital city of Gujarat state?","Surat","Gandhinagar","Ahmedabad","Vadodara","B","Gujarat GK","Easy","Gandhinagar is the capital city of Gujarat."`;

const CSVImportModal = ({ isOpen, onClose, onSuccess }) => {
  const [csvFile, setCsvFile] = useState(null);
  const [csvText, setCsvText] = useState('');
  const [summary, setSummary] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCsvFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setCsvText(event.target.result);
      };
      reader.readAsText(file);
    }
  };

  const handleImport = async () => {
    if (!csvText.trim()) {
      setError('Please select or paste CSV content.');
      return;
    }

    setError('');
    setSubmitting(true);
    try {
      const res = await api.post('/questions/import', {
        csvContent: csvText,
      });

      if (res.data.success) {
        setSummary(res.data.summary);
        onSuccess();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to import CSV.');
    } finally {
      setSubmitting(false);
    }
  };

  const downloadSampleCSV = () => {
    const blob = new Blob([SAMPLE_CSV], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'sarkari_mitra_sample_questions.csv';
    link.click();
  };

  const handleClose = () => {
    setCsvFile(null);
    setCsvText('');
    setSummary(null);
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-100 w-full max-w-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <Upload className="w-5 h-5 text-brand-600" />
            <h3 className="font-bold text-slate-800 text-lg">Bulk Import Questions (CSV)</h3>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {!summary ? (
            <>
              {error && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-medium">
                  {error}
                </div>
              )}

              <div className="flex items-center justify-between bg-brand-50/60 p-3.5 rounded-xl border border-brand-100">
                <div className="text-xs text-brand-900">
                  <p className="font-semibold">Required Columns:</p>
                  <p className="text-brand-700 font-mono text-[11px] mt-0.5">
                    questionText, optionA, optionB, optionC, optionD, correctAnswer, category, difficulty, explanation
                  </p>
                </div>
                <button
                  type="button"
                  onClick={downloadSampleCSV}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-brand-200 text-brand-700 rounded-lg text-xs font-semibold hover:bg-brand-50"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Sample CSV</span>
                </button>
              </div>

              {/* Upload Drop Area */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">Select CSV File</label>
                <div className="border-2 border-dashed border-slate-200 hover:border-brand-400 rounded-2xl p-6 text-center bg-slate-50/50 cursor-pointer transition-colors relative">
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <FileText className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-slate-700">
                    {csvFile ? csvFile.name : 'Click or Drag & Drop CSV file here'}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">Supports standard CSV format with comma separation</p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Or Paste Raw CSV Data
                </label>
                <textarea
                  rows={4}
                  value={csvText}
                  onChange={(e) => setCsvText(e.target.value)}
                  placeholder="questionText,optionA,optionB,optionC,optionD,correctAnswer,category,difficulty,explanation..."
                  className="w-full p-3 font-mono text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleImport}
                  disabled={submitting}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-semibold shadow-sm shadow-brand-600/30 disabled:opacity-50"
                >
                  {submitting ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      <span>Validate & Import</span>
                    </>
                  )}
                </button>
              </div>
            </>
          ) : (
            /* Summary View */
            <div className="space-y-4">
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0" />
                <div>
                  <h4 className="font-bold text-emerald-900 text-sm">Import Finished</h4>
                  <p className="text-xs text-emerald-700">
                    Successfully imported {summary.importedCount} out of {summary.totalRows} question rows.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <p className="text-xs text-slate-500">Total Rows</p>
                  <p className="text-lg font-bold text-slate-900">{summary.totalRows}</p>
                </div>
                <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200">
                  <p className="text-xs text-emerald-600">Valid Rows</p>
                  <p className="text-lg font-bold text-emerald-700">{summary.validCount}</p>
                </div>
                <div className="bg-rose-50 p-3 rounded-xl border border-rose-200">
                  <p className="text-xs text-rose-600">Invalid Rows</p>
                  <p className="text-lg font-bold text-rose-700">{summary.invalidCount}</p>
                </div>
              </div>

              {summary.invalidRows.length > 0 && (
                <div className="space-y-2">
                  <h5 className="text-xs font-bold text-rose-700 uppercase tracking-wider flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Invalid Rows Report ({summary.invalidRows.length})</span>
                  </h5>
                  <div className="max-h-40 overflow-y-auto border border-rose-100 bg-rose-50/50 rounded-xl p-3 space-y-2">
                    {summary.invalidRows.map((inv, idx) => (
                      <div key={idx} className="text-xs border-b border-rose-100 pb-1.5 last:border-b-0">
                        <span className="font-semibold text-rose-900">Row #{inv.row}: </span>
                        <span className="text-rose-700">{inv.reasons.join(', ')}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-3 flex justify-end">
                <button
                  onClick={handleClose}
                  className="px-5 py-2 bg-brand-600 text-white rounded-xl text-xs font-semibold shadow-sm"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CSVImportModal;
