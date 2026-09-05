import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  FaChartPie, 
  FaUserGraduate, 
  FaGithub, 
  FaCodeBranch, 
  FaHeartbeat, 
  FaExchangeAlt, 
  FaTrophy, 
  FaChartLine, 
  FaFileAlt, 
  FaBell, 
  FaUser, 
  FaSignOutAlt,
  FaTimes,
  FaRocket
} from 'react-icons/fa';

const StaffSidebar = ({ mobileOpen, closeSidebar }) => {
  const handleLogout = () => {
    localStorage.removeItem('userInfo');
    window.location.href = '/login';
  };

  return (
    <div className={`sidebar shadow-sm ${mobileOpen ? 'mobile-open' : ''}`} style={{ width: '250px' }}>
      <div className="sidebar-header d-flex align-items-center justify-content-between">
        <div className="d-flex align-items-center">
          <div className="avatar-circle me-2" style={{ width: 34, height: 34, fontSize: '0.95rem' }}>
            <FaRocket />
          </div>
          <div>
            <span className="fw-extrabold text-dark" style={{ letterSpacing: '-0.5px' }}>GitScope</span>
            <span className="badge bg-primary ms-2 px-2 py-1 small" style={{ fontSize: '0.6rem' }}>STAFF</span>
          </div>
        </div>
        <button className="btn btn-sm text-muted d-lg-none p-1 border-0" onClick={closeSidebar}>
          <FaTimes className="fs-5" />
        </button>
      </div>

      <div className="sidebar-nav px-2 py-3" onClick={closeSidebar}>
        <div className="text-muted small text-uppercase fw-bold mb-2 ms-3" style={{ fontSize: '0.65rem', letterSpacing: '1px' }}>
          Main Navigation
        </div>
        
        <NavLink to="/staff/dashboard" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} end>
          <FaChartPie className="icon" /> Dashboard
        </NavLink>

        <NavLink to="/staff/students" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
          <FaUserGraduate className="icon" /> My Students
        </NavLink>

        <div className="text-muted small text-uppercase fw-bold mt-3 mb-2 ms-3" style={{ fontSize: '0.65rem', letterSpacing: '1px' }}>
          GitHub Activity
        </div>

        <NavLink to="/staff/activity" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
          <FaGithub className="icon" /> GitHub Activity
        </NavLink>

        <NavLink to="/staff/open-source" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
          <FaCodeBranch className="icon" /> Open-Source Contributions
        </NavLink>

        <div className="text-muted small text-uppercase fw-bold mt-3 mb-2 ms-3" style={{ fontSize: '0.65rem', letterSpacing: '1px' }}>
          Monitoring & Comparison
        </div>

        <NavLink to="/staff/monitoring" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
          <FaHeartbeat className="icon" /> Activity Monitoring
        </NavLink>

        <NavLink to="/staff/comparison" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
          <FaExchangeAlt className="icon" /> Student Comparison
        </NavLink>

        <NavLink to="/staff/rankings" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
          <FaTrophy className="icon" /> Student Rankings
        </NavLink>

        <div className="text-muted small text-uppercase fw-bold mt-3 mb-2 ms-3" style={{ fontSize: '0.65rem', letterSpacing: '1px' }}>
          Analytics & Reports
        </div>

        <NavLink to="/staff/analytics" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
          <FaChartLine className="icon" /> Analytics
        </NavLink>

        <NavLink to="/staff/reports" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
          <FaFileAlt className="icon" /> Reports
        </NavLink>

        <NavLink to="/staff/notifications" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
          <FaBell className="icon" /> Notifications
        </NavLink>

        <div className="text-muted small text-uppercase fw-bold mt-3 mb-2 ms-3" style={{ fontSize: '0.65rem', letterSpacing: '1px' }}>
          Personal
        </div>

        <NavLink to="/staff/profile" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
          <FaUser className="icon" /> Profile
        </NavLink>

        <div className="mt-4 pt-3 border-top px-3">
          <button 
            className="btn btn-outline-danger w-100 btn-sm fw-bold d-flex align-items-center justify-content-center py-2 rounded-3" 
            onClick={handleLogout}
          >
            <FaSignOutAlt className="me-2" /> Logout Staff
          </button>
        </div>
      </div>
    </div>
  );
};

export default StaffSidebar;
