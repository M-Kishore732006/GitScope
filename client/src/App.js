import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';

import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/auth.css';

// Public pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';

// Protected routes
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';

// Student pages
import StudentDashboard from './pages/StudentDashboard';
import StudentProfile from './pages/StudentProfile';
import Leaderboard from './pages/Leaderboard';
import RepositoryDetails from './pages/RepositoryDetails';
import GithubCallback from './pages/GithubCallback';

// Dashboard layout
import DashboardLayout from './components/dashboard/DashboardLayout';

// Admin Layout & Pages
import AdminLayout from './components/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import StaffManagement from './pages/admin/StaffManagement';
import StudentManagement from './pages/admin/StudentManagement';
import GithubAccounts from './pages/admin/GithubAccounts';
import GithubAnalytics from './pages/admin/GithubAnalytics';
import StudentRankings from './pages/admin/StudentRankings';
import OpenSourceTracking from './pages/admin/OpenSourceTracking';
import ActivityMonitoring from './pages/admin/ActivityMonitoring';
import AdminReports from './pages/admin/AdminReports';
import AuditLogs from './pages/admin/AuditLogs';
import AdminSettings from './pages/admin/AdminSettings';

// Logout handler
const handleLogout = () => {
  localStorage.removeItem('userInfo');
  window.location.href = '/login';
};

// Teacher dashboard placeholder
const TeacherDashboard = () => {
  return (
    <div className="p-5">
      <h1>Teacher Dashboard</h1>
      <button className="btn btn-danger mt-3" onClick={handleLogout}>Log Out</button>
    </div>
  );
};

function App() {
  return (
    <Router>
      <Routes>

        {/* =========================
            PUBLIC ROUTES
        ========================== */}
        <Route element={<PublicRoute />}>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
        </Route>


        {/* =========================
            STUDENT ROUTES
        ========================== */}
        <Route
          element={
            <ProtectedRoute allowedRoles={['student']} />
          }
        >
          {/* Student pages with dashboard layout/sidebar */}
          <Route element={<DashboardLayout />}>

            <Route
              path="/student/dashboard"
              element={<StudentDashboard />}
            />

            <Route
              path="/student/profile"
              element={<StudentProfile />}
            />

            <Route
              path="/student/leaderboard"
              element={<Leaderboard />}
            />

            <Route
              path="/student/repository/:id"
              element={<RepositoryDetails />}
            />

          </Route>

          {/* GitHub callback without dashboard sidebar */}
          <Route
            path="/student/github/callback"
            element={<GithubCallback />}
          />
        </Route>


        {/* =========================
            TEACHER ROUTES
        ========================== */}
        <Route
          element={
            <ProtectedRoute allowedRoles={['teacher']} />
          }
        >
          <Route
            path="/teacher/dashboard"
            element={<TeacherDashboard />}
          />
        </Route>


        {/* =========================
            ADMIN ROUTES
        ========================== */}
        <Route
          element={
            <ProtectedRoute allowedRoles={['admin']} />
          }
        >
          <Route element={<AdminLayout />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/staff" element={<StaffManagement />} />
            <Route path="/admin/students" element={<StudentManagement />} />
            <Route path="/admin/github-accounts" element={<GithubAccounts />} />
            <Route path="/admin/analytics" element={<GithubAnalytics />} />
            <Route path="/admin/rankings" element={<StudentRankings />} />
            <Route path="/admin/open-source" element={<OpenSourceTracking />} />
            <Route path="/admin/monitoring" element={<ActivityMonitoring />} />
            <Route path="/admin/reports" element={<AdminReports />} />
            <Route path="/admin/audit-logs" element={<AuditLogs />} />
            <Route path="/admin/settings" element={<AdminSettings />} />
          </Route>
        </Route>


        {/* =========================
            FALLBACK ROUTE
        ========================== */}
        <Route
          path="*"
          element={<Navigate to="/login" replace />}
        />

      </Routes>
    </Router>
  );
}

export default App;
