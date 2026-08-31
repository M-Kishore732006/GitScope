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

// Student Dashboard layout
import DashboardLayout from './components/dashboard/DashboardLayout';

// Staff Layout & Pages
import StaffLayout from './components/staff/StaffLayout';
import StaffDashboard from './pages/staff/StaffDashboard';
import MyStudents from './pages/staff/MyStudents';
import StaffGithubActivity from './pages/staff/StaffGithubActivity';
import StaffOpenSource from './pages/staff/StaffOpenSource';
import StaffActivityMonitoring from './pages/staff/StaffActivityMonitoring';
import StaffStudentComparison from './pages/staff/StaffStudentComparison';
import StaffStudentRankings from './pages/staff/StaffStudentRankings';
import StaffAnalytics from './pages/staff/StaffAnalytics';
import StaffReports from './pages/staff/StaffReports';
import StaffNotifications from './pages/staff/StaffNotifications';
import StaffProfile from './pages/staff/StaffProfile';

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
            STAFF / TEACHER ROUTES
        ========================== */}
        <Route
          element={
            <ProtectedRoute allowedRoles={['staff', 'teacher']} />
          }
        >
          <Route element={<StaffLayout />}>
            <Route path="/staff/dashboard" element={<StaffDashboard />} />
            <Route path="/staff/students" element={<MyStudents />} />
            <Route path="/staff/activity" element={<StaffGithubActivity />} />
            <Route path="/staff/open-source" element={<StaffOpenSource />} />
            <Route path="/staff/monitoring" element={<StaffActivityMonitoring />} />
            <Route path="/staff/comparison" element={<StaffStudentComparison />} />
            <Route path="/staff/rankings" element={<StaffStudentRankings />} />
            <Route path="/staff/analytics" element={<StaffAnalytics />} />
            <Route path="/staff/reports" element={<StaffReports />} />
            <Route path="/staff/notifications" element={<StaffNotifications />} />
            <Route path="/staff/profile" element={<StaffProfile />} />

            {/* Teacher legacy alias route */}
            <Route path="/teacher/dashboard" element={<Navigate to="/staff/dashboard" replace />} />
          </Route>
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
