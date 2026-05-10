import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useParams, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Header from './components/Header';
import Home from './pages/Home';
import CourseDetail from './pages/CourseDetail';
import LecturePlayer from './pages/LecturePlayer';
import TestDetail from './pages/TestDetail';
import ResourcePage from './pages/ResourcePage';
import Dashboard from './pages/Dashboard';
import TestInterface from './pages/TestInterface';
import ContactPage from './pages/ContactPage';
import Leaderboard from './pages/Leaderboard';
import Login from './pages/Login';
import Onboarding from './pages/Onboarding';
import SubjectSelection from './pages/SubjectSelection';
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManager from './pages/admin/UserManager';
import MCQManager from './pages/admin/MCQManager';

const ProtectedRoute = ({ children }) => {
  const { user, profile, loading } = useAuth();
  
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (!profile) return <Navigate to="/onboarding" />;
  
  return children;
};

const AdminProtectedRoute = ({ children }) => {
  const { user, profile, loading } = useAuth();
  
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  // Assuming 'isAdmin' check here - fallback to profile check for now
  // if (!profile?.isAdmin) return <Navigate to="/student-dashboard" />;
  
  return children;
};

const CourseRouter = () => {
  const { subjectSlug } = useParams();

  // Pass the full slug — components handle the API call directly
  if (subjectSlug.endsWith('-mcqs')) {
    return <TestDetail subjectSlug={subjectSlug} />;
  }

  if (subjectSlug.endsWith('-lectures')) {
    return <CourseDetail subjectSlug={subjectSlug} />;
  }

  // Fallbacks for legacy or non-suffixed slugs
  if (subjectSlug === 'past-papers-full-length') return <TestDetail subjectSlug="past-papers-full-length" />;
  if (subjectSlug === 'full-length-test-series') return <TestDetail subjectSlug="full-length-test-series" />;
  if (subjectSlug === 'predoctr-test-series')    return <TestDetail subjectSlug="predoctr-test-series" />;

  // Bare subject slugs (e.g. /courses/biology) — default to MCQs
  return <TestDetail subjectSlug={`${subjectSlug}-mcqs`} />;
};

function App() {
  const { user, profile } = useAuth();
  const location = useLocation();
  
  // Hide global header in TestInterface, Admin area, or Auth pages
  const isTestInterface = location.pathname.includes('/practice/') && location.pathname.endsWith('/start');
  const isAdminArea = location.pathname.startsWith('/admin');
  const isAuthPage = location.pathname === '/login' || location.pathname === '/onboarding';

  return (
    <div className="app">
      {!isTestInterface && !isAdminArea && !isAuthPage && <Header />}
      <main>
        <Routes>
          {/* Protected LMS Routes */}
          <Route element={<ProtectedRoute><Outlet /></ProtectedRoute>}>
            <Route path="/" element={<Home />} />
            <Route path="/lectures" element={<SubjectSelection type="lectures" />} />
            <Route path="/lectures/:subjectId/watch" element={<LecturePlayer />} />
            <Route path="/question-bank" element={<SubjectSelection type="mcqs" />} />
            <Route path="/courses/:subjectSlug" element={<CourseRouter />} />
            <Route path="/practice/:subjectId/start" element={<TestInterface />} />
            <Route path="/student-dashboard" element={<Dashboard />} />
            <Route path="/practice/saved/:folderName" element={<TestInterface />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            
            {/* Resources Routes */}
            <Route path="/board-books" element={<ResourcePage />} />
            <Route path="/mdcat-syllabus-2021-onwards" element={<ResourcePage />} />
            <Route path="/aggregate-calculator" element={<ResourcePage />} />
            <Route path="/ocr-answer-sheet" element={<ResourcePage />} />
            <Route path="/:resourceId" element={<ResourcePage />} />
            
            {/* Fallback for other paths inside protected area */}
            <Route path="*" element={<Home />} />
          </Route>
          
          {/* Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/onboarding" element={
            user && !profile ? <Onboarding /> : <Navigate to="/student-dashboard" />
          } />
          
          {/* Admin Routes */}
          <Route path="/admin" element={
            <AdminProtectedRoute>
              <AdminLayout />
            </AdminProtectedRoute>
          }>
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<UserManager />} />
            <Route path="mcqs" element={<MCQManager />} />
            <Route path="flags" element={<div>Flagged Content (Coming Soon)</div>} />
            <Route path="comments" element={<div>Lecture Comments (Coming Soon)</div>} />
            <Route path="marketing" element={<div>Marketing & Offers (Coming Soon)</div>} />
            <Route path="settings" element={<div>Admin Settings (Coming Soon)</div>} />
          </Route>
          
          {/* Public Routes */}
          <Route path="/contact-us-2" element={<ContactPage />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
