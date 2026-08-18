import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FileCheck,
  Plus,
  Copy,
  Check,
  Power,
  Trash2,
  Edit2,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Search,
  Filter,
} from 'lucide-react';
import api from '../services/api';

const ExamList = () => {
  const [exams, setExams] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [copiedToken, setCopiedToken] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    fetchExams(1);
  }, [selectedStatus]);

  const fetchExams = async (page = 1) => {
    setLoading(true);
    try {
      const res = await api.get('/exams', {
        params: {
          page,
          limit: 10,
          search,
          status: selectedStatus,
        },
      });

      if (res.data.success) {
        setExams(res.data.data);
        setPagination(res.data.pagination);
      }
    } catch (err) {
      console.error('Failed to fetch exams:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchExams(1);
  };

  const copyExamLink = (token) => {
    const url = `${window.location.origin}/exam/${token}`;
    navigator.clipboard.writeText(url);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(''), 2500);
  };

  const handleToggleStatus = async (id) => {
    try {
      await api.patch(`/exams/${id}/status`);
      fetchExams(pagination.page);
    } catch (err) {
      alert('Failed to update exam status.');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingId) return;
    try {
      await api.delete(`/exams/${deletingId}`);
      setDeletingId(null);
      fetchExams(pagination.page);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete exam.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">Exams Management</h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Configure mock competitive tests, set duration and schedules ({pagination.total} Total)
          </p>
        </div>

        <Link
          to="/admin/exams/create"
          className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-md shadow-brand-600/30 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Exam</span>
        </Link>
      </div>

      {/* Filters Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3 sm:space-y-0 sm:flex sm:items-center sm:gap-4">
        <form onSubmit={handleSearchSubmit} className="flex-1 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search exam title..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white"
          />
        </form>

        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="All">Status: All</option>
            <option value="Active">Active</option>
            <option value="Upcoming">Upcoming</option>
            <option value="Expired">Expired</option>
            <option value="Disabled">Disabled</option>
          </select>
        </div>
      </div>

      {/* Exam Cards Grid */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-12 text-center text-slate-400 text-sm">Loading exams...</div>
        ) : exams.length === 0 ? (
          <div className="py-12 text-center p-6 space-y-3">
            <FileCheck className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="font-semibold text-slate-700 text-sm">No exams found</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Create your first mock test exam to share token links with students.
            </p>
            <Link
              to="/admin/exams/create"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand-600 text-white rounded-xl text-xs font-semibold"
            >
              <Plus className="w-4 h-4" />
              <span>Create Exam</span>
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {exams.map((exam) => (
              <div key={exam.id} className="p-5 sm:p-6 space-y-4 hover:bg-slate-50/50 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-slate-900 text-base">{exam.title}</h3>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          exam.status === 'Active'
                            ? 'bg-emerald-100 text-emerald-800'
                            : exam.status === 'Upcoming'
                            ? 'bg-blue-100 text-blue-800'
                            : exam.status === 'Expired'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {exam.status}
                      </span>
                    </div>

                    {exam.description && (
                      <p className="text-xs text-slate-500 line-clamp-1">{exam.description}</p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                    <button
                      onClick={() => copyExamLink(exam.publicToken)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
                    >
                      {copiedToken === exam.publicToken ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-700">Link Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-slate-500" />
                          <span>Copy Exam Link</span>
                        </>
                      )}
                    </button>

                    <Link
                      to={`/admin/exams/${exam.id}/results`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-50 hover:bg-brand-100 text-brand-700 rounded-xl text-xs font-semibold transition-colors"
                    >
                      <span>Results ({exam.attemptCount})</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>

                {/* Exam Details & Timeline */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs">
                  <div>
                    <span className="text-slate-400 font-medium block">Duration</span>
                    <span className="font-semibold text-slate-800">{exam.durationMinutes} Minutes</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium block">Questions</span>
                    <span className="font-semibold text-slate-800">{exam.questionCount} Questions</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium block">Start Date</span>
                    <span className="font-semibold text-slate-800">
                      {new Date(exam.startAt).toLocaleString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium block">End Date</span>
                    <span className="font-semibold text-slate-800">
                      {new Date(exam.endAt).toLocaleString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>

                {/* Bottom Toggle / Edit / Delete Control */}
                <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                  <button
                    onClick={() => handleToggleStatus(exam.id)}
                    className={`inline-flex items-center gap-1.5 text-xs font-semibold ${
                      exam.isActive ? 'text-emerald-700 hover:text-emerald-800' : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    <Power className={`w-3.5 h-3.5 ${exam.isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
                    <span>{exam.isActive ? 'Status: Enabled' : 'Status: Disabled'}</span>
                  </button>

                  <div className="flex items-center gap-1">
                    <Link
                      to={`/admin/exams/edit/${exam.id}`}
                      className="p-1.5 text-slate-500 hover:text-brand-600 hover:bg-slate-100 rounded-lg"
                      title="Edit Exam"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => setDeletingId(exam.id)}
                      className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-slate-100 rounded-lg"
                      title="Delete Exam"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>
            Page <strong className="text-slate-800">{pagination.page}</strong> of{' '}
            <strong className="text-slate-800">{pagination.totalPages}</strong>
          </span>

          <div className="flex items-center gap-2">
            <button
              disabled={pagination.page <= 1}
              onClick={() => fetchExams(pagination.page - 1)}
              className="p-1.5 bg-white border border-slate-200 rounded-lg disabled:opacity-40 hover:bg-slate-100"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => fetchExams(pagination.page + 1)}
              className="p-1.5 bg-white border border-slate-200 rounded-lg disabled:opacity-40 hover:bg-slate-100"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deletingId && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-xl border border-slate-100">
            <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="text-center space-y-1">
              <h4 className="font-bold text-slate-800">Delete Exam?</h4>
              <p className="text-xs text-slate-500">
                Are you sure you want to delete this exam? All student attempt records for this exam will also be deleted.
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
    </div>
  );
};

export default ExamList;
