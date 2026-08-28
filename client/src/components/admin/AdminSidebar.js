import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  FaShieldAlt, 
  FaChartPie, 
  FaUserTie, 
  FaUserGraduate, 
  FaGithub, 
  FaChartLine, 
  FaTrophy, 
  FaCodeBranch, 
  FaHeartbeat, 
  FaFileAlt, 
  FaHistory, 
  FaCog,
  FaSignOutAlt
} from 'react-icons/fa';

const AdminSidebar = () => {
  const handleLogout = () => {
    localStorage.removeItem('userInfo');
    window.location.href = '/login';
  };

  return (
    <div className="sidebar shadow-sm" style={{ width: '250px' }}>
      <div className="sidebar-header d-flex align-items-center justify-content-between">
        <div className="d-flex align-items-center">
          <div className="avatar-circle me-2 bg-dark text-white" style={{ width: 34, height: 34, fontSize: '0.9rem' }}>
            <FaShieldAlt className="text-warning" />
          </div>
          <div>
            <span className="fw-extrabold text-dark" style={{ letterSpacing: '-0.5px' }}>GitScope</span>
            <span className="badge bg-danger ms-2 px-2 py-1 small" style={{ fontSize: '0.6rem' }}>ADMIN</span>
          </div>
        </div>
      </div>

      <div className="sidebar-nav px-2 py-3">
        <div className="text-muted small text-uppercase fw-bold mb-2 ms-3" style={{ fontSize: '0.65rem', letterSpacing: '1px' }}>
          Overview
        </div>
        
        <NavLink to="/admin/dashboard" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} end>
          <FaChartPie className="icon" /> Dashboard
        </NavLink>

        <div className="text-muted small text-uppercase fw-bold mt-3 mb-2 ms-3" style={{ fontSize: '0.65rem', letterSpacing: '1px' }}>
          User Management
        </div>

        <NavLink to="/admin/staff" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
          <FaUserTie className="icon" /> Staff Management
        </NavLink>

        <NavLink to="/admin/students" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
          <FaUserGraduate className="icon" /> Student Management
        </NavLink>

        <div className="text-muted small text-uppercase fw-bold mt-3 mb-2 ms-3" style={{ fontSize: '0.65rem', letterSpacing: '1px' }}>
          GitHub Ecosystem
        </div>

        <NavLink to="/admin/github-accounts" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
          <FaGithub className="icon" /> GitHub Accounts
        </NavLink>

        <NavLink to="/admin/analytics" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
          <FaChartLine className="icon" /> GitHub Analytics
        </NavLink>

        <NavLink to="/admin/rankings" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
          <FaTrophy className="icon" /> Student Rankings
        </NavLink>

        <NavLink to="/admin/open-source" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
          <FaCodeBranch className="icon" /> Open-Source Tracking
        </NavLink>

        <NavLink to="/admin/monitoring" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
          <FaHeartbeat className="icon" /> Activity Monitoring
        </NavLink>

        <div className="text-muted small text-uppercase fw-bold mt-3 mb-2 ms-3" style={{ fontSize: '0.65rem', letterSpacing: '1px' }}>
          Governance & System
        </div>

        <NavLink to="/admin/reports" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
          <FaFileAlt className="icon" /> Reports
        </NavLink>

        <NavLink to="/admin/audit-logs" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
          <FaHistory className="icon" /> Audit Logs
        </NavLink>

        <NavLink to="/admin/settings" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
          <FaCog className="icon" /> Settings
        </NavLink>

        <div className="mt-4 pt-3 border-top px-3">
          <button 
            className="btn btn-outline-danger w-100 btn-sm fw-bold d-flex align-items-center justify-content-center py-2 rounded-3" 
            onClick={handleLogout}
          >
            <FaSignOutAlt className="me-2" /> Logout Admin
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminSidebar;
