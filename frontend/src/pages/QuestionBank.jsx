import React, { useState, useEffect } from 'react';
import {
  HelpCircle,
  Plus,
  Upload,
  Search,
  Filter,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Download,
  CheckSquare,
  Square,
  FolderEdit,
  X,
} from 'lucide-react';
import api from '../services/api';
import QuestionFormModal from '../components/QuestionFormModal';
import CSVImportModal from '../components/CSVImportModal';
import QuestionPDFExportModal from '../components/QuestionPDFExportModal';

const CATEGORIES = [
  'Environment',
  'General Knowledge',
  'History',
  'Geography',
  'Indian Polity',
  'Science',
  'Economics',
  'Current Affairs',
  'Gujarat GK',
  'Reasoning',
  'Other',
];

const DIFFICULTIES = ['All', 'Easy', 'Medium', 'Hard'];

const QuestionBank = () => {
  const [questions, setQuestions] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');

  // Multi-select state
  const [selectedIds, setSelectedIds] = useState([]);
  const [targetCategory, setTargetCategory] = useState('Environment');

  // Modals
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [isCSVOpen, setIsCSVOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  // PDF Export Modal
  const [isPDFModalOpen, setIsPDFModalOpen] = useState(false);
  const [exportQuestions, setExportQuestions] = useState([]);

  useEffect(() => {
    fetchQuestions(1);
  }, [selectedCategory, selectedDifficulty]);

  const fetchQuestions = async (page = 1) => {
    setLoading(true);
    try {
      const res = await api.get('/questions', {
        params: {
          page,
          limit: 10,
          search,
          category: selectedCategory,
          difficulty: selectedDifficulty,
        },
      });

      if (res.data.success) {
        setQuestions(res.data.data);
        setPagination(res.data.pagination);
        setSelectedIds([]);
      }
    } catch (err) {
      console.error('Error fetching questions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchQuestions(1);
  };

  // Multi-select handlers
  const toggleSelectOne = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleSelectAllCurrentPage = () => {
    const currentPageIds = questions.map((q) => q.id);
    const allSelected = currentPageIds.every((id) => selectedIds.includes(id));

    if (allSelected) {
      setSelectedIds((prev) => prev.filter((id) => !currentPageIds.includes(id)));
    } else {
      setSelectedIds((prev) => Array.from(new Set([...prev, ...currentPageIds])));
    }
  };

  // Bulk actions
  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    try {
      await api.post('/questions/bulk-delete', { ids: selectedIds });
      setSelectedIds([]);
      setIsBulkDeleting(false);
      fetchQuestions(pagination.page);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete selected questions.');
    }
  };

  const handleBulkCategoryChange = async () => {
    if (selectedIds.length === 0 || !targetCategory) return;
    try {
      await api.patch('/questions/bulk-category', {
        ids: selectedIds,
        category: targetCategory,
      });
      alert(`Updated category to "${targetCategory}" for ${selectedIds.length} questions.`);
      setSelectedIds([]);
      fetchQuestions(pagination.page);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update question categories.');
    }
  };

  const handleOpenPDFExport = async () => {
    try {
      if (selectedIds.length > 0) {
        const selectedObjs = questions.filter((q) => selectedIds.includes(q.id));
        setExportQuestions(selectedObjs);
        setIsPDFModalOpen(true);
      } else {
        const res = await api.get('/questions', {
          params: {
            limit: 1000,
            search,
            category: selectedCategory,
            difficulty: selectedDifficulty,
          },
        });
        if (res.data.success) {
          setExportQuestions(res.data.data);
          setIsPDFModalOpen(true);
        }
      }
    } catch (err) {
      alert('Failed to prepare question PDF export.');
    }
  };

  const handleEdit = (q) => {
    setEditingQuestion(q);
    setIsFormOpen(true);
  };

  const handleAdd = () => {
    setEditingQuestion(null);
    setIsFormOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingId) return;
    try {
      await api.delete(`/questions/${deletingId}`);
      setDeletingId(null);
      fetchQuestions(pagination.page);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete question.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">Question Bank</h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Central repository of MCQ questions for government mock tests ({pagination.total} Total)
          </p>
        </div>

        <div className="grid grid-cols-2 sm:flex sm:items-center gap-2">
          <button
            onClick={handleOpenPDFExport}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs sm:text-sm rounded-xl border border-slate-200 transition-all"
            title="Generate PDF of Question Bank MCQs"
          >
            <Download className="w-4 h-4 text-brand-600 flex-shrink-0" />
            <span>PDF Export</span>
          </button>

          <button
            onClick={() => setIsCSVOpen(true)}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs sm:text-sm rounded-xl border border-slate-200 transition-all"
          >
            <Upload className="w-4 h-4 text-slate-600 flex-shrink-0" />
            <span>CSV Import</span>
          </button>

          <button
            onClick={handleAdd}
            className="col-span-2 sm:col-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-md shadow-brand-600/30 transition-all"
          >
            <Plus className="w-4 h-4 flex-shrink-0" />
            <span>Add Question</span>
          </button>
        </div>
      </div>

      {/* Floating Bulk Action Bar when questions are selected */}
      {selectedIds.length > 0 && (
        <div className="bg-slate-900 text-white p-3.5 rounded-2xl shadow-xl flex flex-wrap items-center justify-between gap-3 border border-slate-800 animate-in fade-in">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-lg bg-brand-500/20 text-brand-300 font-bold text-xs border border-brand-500/30">
              {selectedIds.length} Selected
            </span>
            <span className="text-xs text-slate-300 hidden sm:inline">Choose a bulk action:</span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1 bg-slate-800 px-2 py-1 rounded-xl border border-slate-700">
              <select
                value={targetCategory}
                onChange={(e) => setTargetCategory(e.target.value)}
                className="bg-transparent text-white text-xs font-semibold focus:outline-none pr-1"
              >
                {CATEGORIES.filter((c) => c !== 'All').map((cat) => (
                  <option key={cat} value={cat} className="bg-slate-900 text-white">
                    Set Category: {cat}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={handleBulkCategoryChange}
                className="px-2.5 py-1 bg-brand-600 hover:bg-brand-500 text-white rounded-lg text-xs font-bold transition-all"
              >
                Apply
              </button>
            </div>

            <button
              onClick={() => setIsBulkDeleting(true)}
              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1 transition-all"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete ({selectedIds.length})</span>
            </button>

            <button
              onClick={() => setSelectedIds([])}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg"
              title="Clear selection"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Mobile-Optimized Responsive Search & Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3 sm:space-y-0 sm:flex sm:items-center sm:gap-3">
        <form onSubmit={handleSearchSubmit} className="flex-1 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search questions by keyword..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white"
          />
        </form>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:w-auto w-full">
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1">
            <Filter className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full py-1 bg-transparent text-xs sm:text-sm focus:outline-none font-medium text-slate-700 truncate"
            >
              <option value="All">Category: All</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  Category: {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1">
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="w-full py-1 bg-transparent text-xs sm:text-sm focus:outline-none font-medium text-slate-700 truncate"
            >
              {DIFFICULTIES.map((dif) => (
                <option key={dif} value={dif}>
                  Difficulty: {dif}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Question List View */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-12 text-center text-slate-400 text-sm">Loading question bank...</div>
        ) : questions.length === 0 ? (
          <div className="py-12 text-center p-6 space-y-3">
            <HelpCircle className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="font-semibold text-slate-700 text-sm">No questions found</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Try adjusting your search query or filters, or create a new question using the button above.
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200 text-[11px]">
                  <tr>
                    <th className="px-4 py-3.5 text-center w-12">
                      <input
                        type="checkbox"
                        checked={
                          questions.length > 0 &&
                          questions.every((q) => selectedIds.includes(q.id))
                        }
                        onChange={toggleSelectAllCurrentPage}
                        className="w-4 h-4 text-brand-600 rounded border-slate-300 focus:ring-brand-500 cursor-pointer"
                      />
                    </th>
                    <th className="px-4 py-3.5">Question Statement</th>
                    <th className="px-4 py-3.5">Category</th>
                    <th className="px-4 py-3.5">Difficulty</th>
                    <th className="px-4 py-3.5 text-center">Correct Answer</th>
                    <th className="px-6 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {questions.map((q) => {
                    const isSelected = selectedIds.includes(q.id);
                    return (
                      <tr
                        key={q.id}
                        className={`hover:bg-slate-50/80 transition-colors ${
                          isSelected ? 'bg-brand-50/40' : ''
                        }`}
                      >
                        <td className="px-4 py-4 text-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelectOne(q.id)}
                            className="w-4 h-4 text-brand-600 rounded border-slate-300 focus:ring-brand-500 cursor-pointer"
                          />
                        </td>
                        <td className="px-4 py-4 max-w-md">
                          <p className="font-semibold text-slate-800 line-clamp-2">{q.questionText}</p>
                          <div className="flex gap-2 text-[11px] text-slate-400 mt-1">
                            <span>A: {q.optionA}</span> • <span>B: {q.optionB}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4 font-medium text-slate-600 whitespace-nowrap">
                          <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 text-xs font-semibold">
                            {q.category}
                          </span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                              q.difficulty === 'Easy'
                                ? 'bg-emerald-100 text-emerald-800'
                                : q.difficulty === 'Medium'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {q.difficulty}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-center font-bold text-brand-600">
                          Option {q.correctAnswer}
                        </td>
                        <td className="px-6 py-4 text-right whitespace-nowrap space-x-1">
                          <button
                            onClick={() => handleEdit(q)}
                            className="p-1.5 text-slate-500 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeletingId(q.id)}
                            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Card List View */}
            <div className="md:hidden divide-y divide-slate-100">
              {questions.map((q) => {
                const isSelected = selectedIds.includes(q.id);
                return (
                  <div
                    key={q.id}
                    className={`p-4 space-y-3 ${isSelected ? 'bg-brand-50/40' : ''}`}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelectOne(q.id)}
                        className="w-4 h-4 text-brand-600 rounded border-slate-300 focus:ring-brand-500 cursor-pointer mt-1"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-semibold text-slate-800 text-sm">{q.questionText}</p>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex-shrink-0 ${
                              q.difficulty === 'Easy'
                                ? 'bg-emerald-100 text-emerald-800'
                                : q.difficulty === 'Medium'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {q.difficulty}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-2.5 rounded-xl text-slate-600 border border-slate-100 mt-2">
                          <div>
                            <span className="font-bold text-slate-400">A:</span> {q.optionA}
                          </div>
                          <div>
                            <span className="font-bold text-slate-400">B:</span> {q.optionB}
                          </div>
                          <div>
                            <span className="font-bold text-slate-400">C:</span> {q.optionC}
                          </div>
                          <div>
                            <span className="font-bold text-slate-400">D:</span> {q.optionD}
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-2">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[11px] rounded font-medium">
                              {q.category}
                            </span>
                            <span className="text-xs font-bold text-brand-600">
                              Correct: Option {q.correctAnswer}
                            </span>
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleEdit(q)}
                              className="p-1.5 text-slate-500 hover:text-brand-600 bg-slate-100 rounded-lg"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setDeletingId(q.id)}
                              className="p-1.5 text-slate-500 hover:text-rose-600 bg-slate-100 rounded-lg"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination Control */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
              <span>
                Page <strong className="text-slate-800">{pagination.page}</strong> of{' '}
                <strong className="text-slate-800">{pagination.totalPages}</strong>
              </span>

              <div className="flex items-center gap-2">
                <button
                  disabled={pagination.page <= 1}
                  onClick={() => fetchQuestions(pagination.page - 1)}
                  className="p-1.5 bg-white border border-slate-200 rounded-lg disabled:opacity-40 hover:bg-slate-100"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() => fetchQuestions(pagination.page + 1)}
                  className="p-1.5 bg-white border border-slate-200 rounded-lg disabled:opacity-40 hover:bg-slate-100"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Single Delete Confirmation Dialog */}
      {deletingId && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-xl border border-slate-100">
            <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="text-center space-y-1">
              <h4 className="font-bold text-slate-800">Delete Question?</h4>
              <p className="text-xs text-slate-500">
                Are you sure you want to delete this question? This action cannot be undone.
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setDeletingId(null)}
                className="flex-1 py-2 bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="flex-1 py-2 bg-rose-600 text-white text-xs font-semibold rounded-xl shadow-sm shadow-rose-600/30"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Delete Confirmation Dialog */}
      {isBulkDeleting && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-xl border border-slate-100">
            <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="text-center space-y-1">
              <h4 className="font-bold text-slate-800">Delete {selectedIds.length} Questions?</h4>
              <p className="text-xs text-slate-500">
                Are you sure you want to delete all selected {selectedIds.length} questions from the Question Bank?
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setIsBulkDeleting(false)}
                className="flex-1 py-2 bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleBulkDelete}
                className="flex-1 py-2 bg-rose-600 text-white text-xs font-semibold rounded-xl shadow-sm shadow-rose-600/30"
              >
                Delete ({selectedIds.length})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Form & CSV Modals */}
      <QuestionFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        question={editingQuestion}
        onSuccess={() => fetchQuestions(pagination.page)}
      />

      <CSVImportModal
        isOpen={isCSVOpen}
        onClose={() => setIsCSVOpen(false)}
        onSuccess={() => fetchQuestions(1)}
      />

      {/* Questions PDF Export Modal */}
      <QuestionPDFExportModal
        isOpen={isPDFModalOpen}
        onClose={() => setIsPDFModalOpen(false)}
        title={selectedCategory !== 'All' ? `Question Bank - ${selectedCategory}` : 'SarkariMitra MCQ Question Bank'}
        subtitle={`Total Questions: ${exportQuestions.length}`}
        questions={exportQuestions}
      />
    </div>
  );
};

export default QuestionBank;
