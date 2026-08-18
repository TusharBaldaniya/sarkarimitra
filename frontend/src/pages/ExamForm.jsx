import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  Search,
  CheckSquare,
  Square,
  AlertCircle,
  Plus,
  Upload,
  Eye,
  EyeOff,
} from 'lucide-react';
import api from '../services/api';
import QuestionFormModal from '../components/QuestionFormModal';
import CSVImportModal from '../components/CSVImportModal';

const CATEGORIES = [
  'All',
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

const ExamForm = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startAt, setStartAt] = useState('');
  const [endAt, setEndAt] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [showAnswersToStudent, setShowAnswersToStudent] = useState(true);

  // Questions selection
  const [allQuestions, setAllQuestions] = useState([]);
  const [selectedQuestionIds, setSelectedQuestionIds] = useState([]);
  const [questionSearch, setQuestionSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectionFilter, setSelectionFilter] = useState('all'); // 'all', 'selected', 'unselected'

  // Modals for Quick Add & Quick CSV Import
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [isQuickCSVOpen, setIsQuickCSVOpen] = useState(false);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchInitialData();
  }, [id]);

  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const pad = (n) => (n < 10 ? `0${n}` : n);
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
      date.getHours()
    )}:${pad(date.getMinutes())}`;
  };

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      // Fetch questions from bank (sorted newest first)
      const qRes = await api.get('/questions?limit=1000');
      const bankQuestions = qRes.data.data || [];
      setAllQuestions(bankQuestions);

      if (isEdit) {
        const examRes = await api.get(`/exams/${id}`);
        const exam = examRes.data.data;
        setTitle(exam.title || '');
        setDescription(exam.description || '');
        setStartAt(formatDateForInput(exam.startAt));
        setEndAt(formatDateForInput(exam.endAt));
        setDurationMinutes(exam.durationMinutes || 30);
        setShowAnswersToStudent(exam.showAnswersToStudent !== undefined ? Boolean(exam.showAnswersToStudent) : true);

        if (Array.isArray(exam.questions)) {
          setSelectedQuestionIds(exam.questions.map((q) => q.id));
        }
      } else {
        // Default start = now, end = 7 days later
        const now = new Date();
        const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        setStartAt(formatDateForInput(now.toISOString()));
        setEndAt(formatDateForInput(nextWeek.toISOString()));
      }
    } catch (err) {
      console.error('Failed to load exam form data:', err);
      setError('Failed to load initial data.');
    } finally {
      setLoading(false);
    }
  };

  // Helper to refresh question list and auto-select newly added question(s)
  const refreshAndAutoSelectNew = async (newQuestionIds = []) => {
    try {
      const qRes = await api.get('/questions?limit=1000');
      const updatedBank = qRes.data.data || [];
      setAllQuestions(updatedBank);

      if (newQuestionIds.length > 0) {
        setSelectedQuestionIds((prev) => Array.from(new Set([...newQuestionIds, ...prev])));
      } else {
        // Auto select the newest question if ID wasn't explicitly passed
        if (updatedBank.length > 0) {
          const newestId = updatedBank[0].id;
          setSelectedQuestionIds((prev) => Array.from(new Set([newestId, ...prev])));
        }
      }
    } catch (err) {
      console.error('Failed to refresh questions:', err);
    }
  };

  const toggleQuestionSelection = (qId) => {
    setSelectedQuestionIds((prev) =>
      prev.includes(qId) ? prev.filter((item) => item !== qId) : [...prev, qId]
    );
  };

  const handleSelectAllFiltered = () => {
    const filteredIds = filteredQuestions.map((q) => q.id);
    const allSelected = filteredIds.every((qId) => selectedQuestionIds.includes(qId));

    if (allSelected) {
      setSelectedQuestionIds((prev) => prev.filter((qId) => !filteredIds.includes(qId)));
    } else {
      setSelectedQuestionIds((prev) => Array.from(new Set([...prev, ...filteredIds])));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!title.trim() || !startAt || !endAt || !durationMinutes) {
      setError('Please fill in all required exam settings.');
      return;
    }

    if (new Date(endAt) <= new Date(startAt)) {
      setError('End date/time must be after start date/time.');
      return;
    }

    if (selectedQuestionIds.length === 0) {
      setError('Please select at least one question for this exam.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        title: title.trim(),
        description: description.trim(),
        startAt: new Date(startAt).toISOString(),
        endAt: new Date(endAt).toISOString(),
        durationMinutes: parseInt(durationMinutes, 10),
        showAnswersToStudent,
        questionIds: selectedQuestionIds,
      };

      if (isEdit) {
        await api.put(`/exams/${id}`, payload);
      } else {
        await api.post('/exams', payload);
      }

      navigate('/admin/exams');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save exam.');
    } finally {
      setSubmitting(false);
    }
  };

  // Filtered questions in selector list
  const filteredQuestions = allQuestions.filter((q) => {
    const matchesSearch =
      !questionSearch || q.questionText.toLowerCase().includes(questionSearch.toLowerCase());
    const matchesCat = selectedCategory === 'All' || q.category === selectedCategory;

    const isSelected = selectedQuestionIds.includes(q.id);
    let matchesSelection = true;
    if (selectionFilter === 'selected') matchesSelection = isSelected;
    if (selectionFilter === 'unselected') matchesSelection = !isSelected;

    return matchesSearch && matchesCat && matchesSelection;
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header Bar */}
      <div className="flex items-center gap-3">
        <Link
          to="/admin/exams"
          className="p-2 text-slate-500 hover:text-slate-800 bg-white border border-slate-200 rounded-xl hover:bg-slate-50"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            {isEdit ? 'Edit Exam' : 'Create New Exam'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Set up test metadata, schedule timing, and attach questions
          </p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-xs font-medium">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="py-16 text-center text-slate-400 text-sm">Loading exam configuration...</div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: Basic Exam Configuration */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider border-b border-slate-100 pb-2">
              1. Basic Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Exam Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Gujarat GK & General Studies Mock Test - 01"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white"
                  required
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Description / Syllabus (Optional)
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter practice test details or instructions for candidates..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Start Date & Time <span className="text-rose-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  value={startAt}
                  onChange={(e) => setStartAt(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  End Date & Time <span className="text-rose-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  value={endAt}
                  onChange={(e) => setEndAt(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Duration (Minutes) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min={1}
                  max={300}
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  required
                />
              </div>

              {/* Show Answers & Result Toggle */}
              <div className="sm:col-span-2 p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <label className="flex items-center justify-between cursor-pointer">
                  <div className="space-y-0.5 pr-2">
                    <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                      {showAnswersToStudent ? <Eye className="w-4 h-4 text-emerald-600" /> : <EyeOff className="w-4 h-4 text-slate-400" />}
                      <span>Show Result & Answer Key to Student After Exam</span>
                    </span>
                    <span className="text-xs text-slate-500 block">
                      {showAnswersToStudent
                        ? 'Yes: Students can view their score & correct answer key immediately after submitting.'
                        : 'No: Answer key is hidden from students. Results will be released via PDF leaderboard on Telegram!'}
                    </span>
                  </div>
                  <div className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                    <input
                      type="checkbox"
                      checked={showAnswersToStudent}
                      onChange={(e) => setShowAnswersToStudent(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-600"></div>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Section 2: Question Selector with Instant Add Features */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider">
                    2. Select Questions for Exam
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full bg-brand-100 text-brand-800 font-extrabold text-xs">
                    {selectedQuestionIds.length} Selected
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Select existing questions or quickly add/import new questions directly into this exam!
                </p>
              </div>

              {/* Instant Action Buttons for New MCQs */}
              <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                <button
                  type="button"
                  onClick={() => setIsQuickAddOpen(true)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-brand-50 hover:bg-brand-100 text-brand-700 border border-brand-200 text-xs font-bold rounded-xl transition-all"
                  title="Add a new question and automatically select it for this exam"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Quick Add MCQ</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsQuickCSVOpen(true)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-bold rounded-xl transition-all"
                  title="Import CSV of new MCQs and automatically select all of them for this exam"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>📥 Quick CSV Import</span>
                </button>
              </div>
            </div>

            {/* Filter Bar & Views */}
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="relative sm:col-span-2">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={questionSearch}
                    onChange={(e) => setQuestionSearch(e.target.value)}
                    placeholder="Search questions by statement..."
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      Category: {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Selection Status Chips & Select All Toggle */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1">
                <div className="flex items-center gap-1.5 text-xs">
                  <span className="text-slate-400 font-semibold text-[11px] uppercase mr-1">View:</span>
                  <button
                    type="button"
                    onClick={() => setSelectionFilter('all')}
                    className={`px-2.5 py-1 rounded-lg font-semibold text-xs transition-colors ${
                      selectionFilter === 'all'
                        ? 'bg-slate-800 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    All Bank MCQs ({allQuestions.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectionFilter('selected')}
                    className={`px-2.5 py-1 rounded-lg font-semibold text-xs transition-colors ${
                      selectionFilter === 'selected'
                        ? 'bg-brand-600 text-white'
                        : 'bg-brand-50 text-brand-700 hover:bg-brand-100'
                    }`}
                  >
                    Selected Only ({selectedQuestionIds.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectionFilter('unselected')}
                    className={`px-2.5 py-1 rounded-lg font-semibold text-xs transition-colors ${
                      selectionFilter === 'unselected'
                        ? 'bg-slate-800 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Unselected ({allQuestions.length - selectedQuestionIds.length})
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleSelectAllFiltered}
                  className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg self-start sm:self-auto"
                >
                  Toggle Select All ({filteredQuestions.length})
                </button>
              </div>
            </div>

            {/* Questions Selection List (Sorted Newest First) */}
            <div className="max-h-96 overflow-y-auto border border-slate-200 rounded-xl divide-y divide-slate-100">
              {filteredQuestions.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400 space-y-2">
                  <p>No matching questions found in this view.</p>
                  {selectionFilter === 'selected' && (
                    <button
                      type="button"
                      onClick={() => setSelectionFilter('all')}
                      className="text-brand-600 font-semibold underline"
                    >
                      Show all bank questions
                    </button>
                  )}
                </div>
              ) : (
                filteredQuestions.map((q) => {
                  const isChecked = selectedQuestionIds.includes(q.id);
                  return (
                    <div
                      key={q.id}
                      onClick={() => toggleQuestionSelection(q.id)}
                      className={`p-3.5 flex items-start gap-3 cursor-pointer transition-colors ${
                        isChecked ? 'bg-brand-50/60 border-l-4 border-l-brand-600' : 'hover:bg-slate-50'
                      }`}
                    >
                      <div className="mt-0.5 text-slate-500">
                        {isChecked ? (
                          <CheckSquare className="w-5 h-5 text-brand-600" />
                        ) : (
                          <Square className="w-5 h-5 text-slate-300" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-800 text-xs sm:text-sm line-clamp-2">
                          {q.questionText}
                        </p>
                        <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500">
                          <span className="px-2 py-0.5 bg-slate-100 rounded text-slate-700">
                            {q.category}
                          </span>
                          <span>Diff: {q.difficulty}</span> •{' '}
                          <span className="font-medium text-brand-600">Ans: Option {q.correctAnswer}</span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Submit Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Link
              to="/admin/exams"
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-brand-600/30 disabled:opacity-50"
            >
              {submitting ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>{isEdit ? 'Save Changes' : 'Create Exam'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* Quick Add Question Modal */}
      <QuestionFormModal
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
        question={null}
        onSuccess={async () => {
          await refreshAndAutoSelectNew();
          setIsQuickAddOpen(false);
        }}
      />

      {/* Quick CSV Import Modal */}
      <CSVImportModal
        isOpen={isQuickCSVOpen}
        onClose={() => setIsQuickCSVOpen(false)}
        onSuccess={async () => {
          await refreshAndAutoSelectNew();
          setIsQuickCSVOpen(false);
        }}
      />
    </div>
  );
};

export default ExamForm;
