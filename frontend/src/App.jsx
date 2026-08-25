import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AdminLayout from './components/AdminLayout';

// Admin Pages
import AdminLogin from './pages/AdminLogin';
import Dashboard from './pages/Dashboard';
import QuestionBank from './pages/QuestionBank';
import ExamList from './pages/ExamList';
import ExamForm from './pages/ExamForm';
import ExamResults from './pages/ExamResults';
import StudentAttemptDetail from './pages/StudentAttemptDetail';

// Student Exam, Practice & Home Pages
import HomePage from './pages/HomePage';
import StudentExamStart from './pages/StudentExamStart';
import StudentExamInterface from './pages/StudentExamInterface';
import StudentResult from './pages/StudentResult';
import StudentPracticePortal from './pages/StudentPracticePortal';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Home & Landing Pages */}
          <Route path="/" element={<HomePage />} />
          <Route path="/home" element={<HomePage />} />

          {/* Admin Public Route */}
          <Route path="/admin/login" element={<AdminLogin />} />

          {/* Admin Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route
              path="/admin"
              element={
                <AdminLayout>
                  <Navigate to="/admin/dashboard" replace />
                </AdminLayout>
              }
            />
            <Route
              path="/admin/dashboard"
              element={
                <AdminLayout>
                  <Dashboard />
                </AdminLayout>
              }
            />
            <Route
              path="/admin/questions"
              element={
                <AdminLayout>
                  <QuestionBank />
                </AdminLayout>
              }
            />
            <Route
              path="/admin/exams"
              element={
                <AdminLayout>
                  <ExamList />
                </AdminLayout>
              }
            />
            <Route
              path="/admin/exams/create"
              element={
                <AdminLayout>
                  <ExamForm />
                </AdminLayout>
              }
            />
            <Route
              path="/admin/exams/edit/:id"
              element={
                <AdminLayout>
                  <ExamForm />
                </AdminLayout>
              }
            />
            <Route
              path="/admin/exams/:id/results"
              element={
                <AdminLayout>
                  <ExamResults />
                </AdminLayout>
              }
            />
            <Route
              path="/admin/exams/:id/attempts/:attemptId"
              element={
                <AdminLayout>
                  <StudentAttemptDetail />
                </AdminLayout>
              }
            />
          </Route>

          {/* Student Public Exam & Practice Interface Routes */}
          <Route path="/practice" element={<StudentPracticePortal />} />
          <Route path="/exam/:token" element={<StudentExamStart />} />
          <Route path="/exam/:token/test" element={<StudentExamInterface />} />
          <Route path="/exam/:token/result" element={<StudentResult />} />

          {/* Catch-all 404 Route */}
          <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
