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

// Logout handler
const handleLogout = () => {
  localStorage.removeItem('userInfo');
  window.location.href = '/login';
};

// Teacher dashboard
const TeacherDashboard = () => {
  return (
    <div className="p-5">
      <h1>Teacher Dashboard</h1>

      <button
        className="btn btn-danger mt-3"
        onClick={handleLogout}
      >
        Log Out
      </button>
    </div>
  );
};

// Admin dashboard
const AdminDashboard = () => {
  return (
    <div className="p-5">
      <h1>Admin Dashboard</h1>

      <button
        className="btn btn-danger mt-3"
        onClick={handleLogout}
      >
        Log Out
      </button>
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
          <Route
            path="/admin/dashboard"
            element={<AdminDashboard />}
          />
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
