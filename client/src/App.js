import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/auth.css';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';
import StudentDashboard from './pages/StudentDashboard';
import Leaderboard from './pages/Leaderboard';
import RepositoryDetails from './pages/RepositoryDetails';
import Landing from './pages/Landing';
import GithubCallback from './pages/GithubCallback';

const handleLogout = () => {
    localStorage.removeItem('userInfo');
    window.location.href = '/login';
};

const TeacherDashboard = () => (
    <div className="p-5">
        <h1>Teacher Dashboard</h1>
        <button className="btn btn-danger mt-3" onClick={handleLogout}>Log Out</button>
    </div>
);
const AdminDashboard = () => (
    <div className="p-5">
        <h1>Admin Dashboard</h1>
        <button className="btn btn-danger mt-3" onClick={handleLogout}>Log Out</button>
    </div>
);

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route element={<PublicRoute />}>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
        </Route>

        {/* Protected Student Routes */}
        <Route element={<ProtectedRoute allowedRoles={['student']} />}>
          <Route path="/student/dashboard" element={<StudentDashboard />} />
          <Route path="/student/github/callback" element={<GithubCallback />} />
          <Route path="/student/leaderboard" element={<Leaderboard />} />
          <Route path="/student/repository/:id" element={<RepositoryDetails />} />
        </Route>

        {/* Protected Teacher Routes */}
        <Route element={<ProtectedRoute allowedRoles={['teacher']} />}>
          <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
        </Route>

        {/* Protected Admin Routes */}
        <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
        </Route>
        
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;