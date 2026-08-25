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
  BookOpen,
} from 'lucide-react';
import api from '../services/api';
import QuestionFormModal from '../components/QuestionFormModal';
import CSVImportModal from '../components/CSVImportModal';

const CATEGORIES = [
  'All',
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
  const [allowPractice, setAllowPractice] = useState(true);

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

  const fetchInitialData = async () => {
    setLoading(true);
    setError('');
    try {
      // 1. Fetch all available question bank items
      const qRes = await api.get('/questions', { params: { limit: 1000 } });
      let questionsList = [];
      if (qRes.data.success) {
        questionsList = qRes.data.data;
        setAllQuestions(questionsList);
      }

      // 2. If editing existing exam, load details
      if (isEdit) {
        const examRes = await api.get(`/exams/${id}`);
        if (examRes.data.success) {
          const exam = examRes.data.data;
          setTitle(exam.title);
          setDescription(exam.description || '');
          setShowAnswersToStudent(exam.showAnswersToStudent !== undefined ? exam.showAnswersToStudent : true);
          setAllowPractice(exam.allowPractice !== undefined ? exam.allowPractice : true);

          // Convert ISO dates to HTML datetime-local format
          if (exam.startAt) setStartAt(new Date(exam.startAt).toISOString().slice(0, 16));
          if (exam.endAt) setEndAt(new Date(exam.endAt).toISOString().slice(0, 16));
          setDurationMinutes(exam.durationMinutes);

          // Populate existing selected questions
          if (Array.isArray(exam.questions)) {
            const currentSelectedIds = exam.questions.map((q) => q.id);
            setSelectedQuestionIds(currentSelectedIds);
          }
        }
      }
    } catch (err) {
      console.error('Error fetching exam form data:', err);
      setError('Failed to load exam details.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleQuestion = (qId) => {
    setSelectedQuestionIds((prev) =>
      prev.includes(qId) ? prev.filter((item) => item !== qId) : [...prev, qId]
    );
  };

  const handleSelectAllFiltered = () => {
    const filteredIds = filteredQuestions.map((q) => q.id);
    const allFilteredSelected = filteredIds.every((qId) => selectedQuestionIds.includes(qId));

    if (allFilteredSelected) {
      // Deselect all filtered
      setSelectedQuestionIds((prev) => prev.filter((qId) => !filteredIds.includes(qId)));
    } else {
      // Add all filtered to selection
      setSelectedQuestionIds((prev) => Array.from(new Set([...prev, ...filteredIds])));
    }
  };

  const handleQuickAddSuccess = (newQuestion) => {
    // Add new question to list and automatically select it for this exam
    setAllQuestions((prev) => [newQuestion, ...prev]);
    setSelectedQuestionIds((prev) => [newQuestion.id, ...prev]);
  };

  const handleQuickCSVSuccess = () => {
    // Refresh question list after CSV import
    api.get('/questions', { params: { limit: 1000 } }).then((res) => {
      if (res.data.success) {
        setAllQuestions(res.data.data);
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('Exam title is required.');
      return;
    }
    if (!startAt || !endAt) {
      setError('Start date and End date are required.');
      return;
    }
    if (new Date(endAt) <= new Date(startAt)) {
      setError('End Date/Time must be after Start Date/Time.');
      return;
    }
    if (selectedQuestionIds.length === 0) {
      setError('Please select at least 1 question for the exam.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        title: title.trim(),
        description: description.trim() || null,
        startAt: new Date(startAt).toISOString(),
        endAt: new Date(endAt).toISOString(),
        durationMinutes: parseInt(durationMinutes, 10),
        showAnswersToStudent,
        allowPractice,
        questionIds: selectedQuestionIds,
      };

      if (isEdit) {
        await api.put(`/exams/${id}`, payload);
      } else {
        await api.post('/exams', payload);
      }

      navigate('/admin/exams');
    } catch (err) {
      console.error('Error saving exam:', err);
      setError(err.response?.data?.message || 'Failed to save exam.');
    } finally {
      setSubmitting(false);
    }
  };

  // Filtering questions for selector table
  const filteredQuestions = allQuestions.filter((q) => {
    const matchesSearch = q.questionText.toLowerCase().includes(questionSearch.toLowerCase());
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
              <div className="sm:col-span-2 space-y-1">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Exam Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Forest Guard Model Test - Paper 1"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
                  required
                />
              </div>

              <div className="sm:col-span-2 space-y-1">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Description / Syllabus Details
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Optional brief overview of topics covered or test instructions"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
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

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
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

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
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
              <div className="sm:col-span-2 p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
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

                {/* Practice Mode Toggle */}
                <label className="flex items-center justify-between cursor-pointer pt-3 border-t border-slate-200">
                  <div className="space-y-0.5 pr-2">
                    <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                      <BookOpen className="w-4 h-4 text-brand-600" />
                      <span>Allow Student Practice Portal Access After Exam Window</span>
                    </span>
                    <span className="text-xs text-slate-500 block">
                      {allowPractice
                        ? 'Yes: Students who missed the live test window can practice this exam later on the Practice Portal.'
                        : 'No: Disable post-exam student practice for this test.'}
                    </span>
                  </div>
                  <div className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                    <input
                      type="checkbox"
                      checked={allowPractice}
                      onChange={(e) => setAllowPractice(e.target.checked)}
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
                  onClick={() => setIsQuickCSVOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 transition-all"
                >
                  <Upload className="w-3.5 h-3.5 text-slate-600" />
                  <span>CSV Import</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsQuickAddOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-brand-50 hover:bg-brand-100 text-brand-700 text-xs font-extrabold rounded-xl border border-brand-200 transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add New Question</span>
                </button>
              </div>
            </div>

            {/* Questions Toolbar Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={questionSearch}
                  onChange={(e) => setQuestionSearch(e.target.value)}
                  placeholder="Filter by question text..."
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium text-slate-700"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    Category: {cat}
                  </option>
                ))}
              </select>

              <select
                value={selectionFilter}
                onChange={(e) => setSelectionFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium text-slate-700"
              >
                <option value="all">Show All Questions</option>
                <option value="selected">Show Selected Only ({selectedQuestionIds.length})</option>
                <option value="unselected">Show Unselected Only</option>
              </select>
            </div>

            {/* Question Selector List (Desktop Table / Mobile Card List) */}
            <div className="border border-slate-200/80 rounded-2xl overflow-hidden max-h-96 overflow-y-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200 sticky top-0 z-10">
                  <tr>
                    <th className="px-4 py-3 text-center w-12 bg-slate-50">
                      <button
                        type="button"
                        onClick={handleSelectAllFiltered}
                        title="Select/Deselect All Filtered"
                        className="text-slate-600 hover:text-brand-600"
                      >
                        {filteredQuestions.length > 0 &&
                        filteredQuestions.every((q) => selectedQuestionIds.includes(q.id)) ? (
                          <CheckSquare className="w-4 h-4 text-brand-600" />
                        ) : (
                          <Square className="w-4 h-4" />
                        )}
                      </button>
                    </th>
                    <th className="px-4 py-3 bg-slate-50">Question Statement</th>
                    <th className="px-4 py-3 bg-slate-50">Category</th>
                    <th className="px-4 py-3 text-center bg-slate-50">Correct Ans</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredQuestions.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-slate-400">
                        No questions match your current search/filter criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredQuestions.map((q) => {
                      const isSelected = selectedQuestionIds.includes(q.id);
                      return (
                        <tr
                          key={q.id}
                          onClick={() => handleToggleQuestion(q.id)}
                          className={`cursor-pointer transition-colors ${
                            isSelected ? 'bg-brand-50/50 hover:bg-brand-50' : 'hover:bg-slate-50'
                          }`}
                        >
                          <td className="px-4 py-3 text-center">
                            {isSelected ? (
                              <CheckSquare className="w-4 h-4 text-brand-600 mx-auto" />
                            ) : (
                              <Square className="w-4 h-4 text-slate-300 mx-auto" />
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <p className="font-semibold text-slate-800 line-clamp-2">{q.questionText}</p>
                            <span className="text-[10px] text-slate-400 font-medium">
                              A: {q.optionA} | B: {q.optionB}
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[11px] font-medium">
                              {q.category}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center font-extrabold text-brand-600 whitespace-nowrap">
                            Option {q.correctAnswer}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Link
              to="/admin/exams"
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs sm:text-sm rounded-xl transition-all"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-md shadow-brand-600/30 transition-all disabled:opacity-50"
            >
              {submitting ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>{isEdit ? 'Update Exam' : 'Create Exam'}</span>
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
        onSuccess={handleQuickAddSuccess}
      />

      {/* Quick CSV Import Modal */}
      <CSVImportModal
        isOpen={isQuickCSVOpen}
        onClose={() => setIsQuickCSVOpen(false)}
        onSuccess={handleQuickCSVSuccess}
      />
    </div>
  );
};

export default ExamForm;
