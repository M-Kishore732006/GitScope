import React from 'react';
import { NavLink } from 'react-router-dom';
import { FaChartPie, FaBook, FaTrophy, FaMedal, FaChartLine, FaUser, FaCog, FaRocket, FaTimes } from 'react-icons/fa';

const Sidebar = ({ handleLogout, mobileOpen, closeSidebar }) => {
  return (
    <div className={`sidebar shadow-sm ${mobileOpen ? 'mobile-open' : ''}`}>
      <div className="sidebar-header d-flex align-items-center justify-content-between">
         <div className="d-flex align-items-center">
           <div className="avatar-circle me-2" style={{ width: 34, height: 34, fontSize: '0.95rem' }}>
             <FaRocket />
           </div>
           <div>
             <span className="fw-extrabold text-dark" style={{ letterSpacing: '-0.5px' }}>GitScope</span>
           </div>
         </div>
         <button className="btn btn-sm text-muted d-lg-none p-1 border-0" onClick={closeSidebar}>
           <FaTimes className="fs-5" />
         </button>
      </div>
      <div className="sidebar-nav" onClick={closeSidebar}>
         <NavLink to="/student/dashboard" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} end>
            <FaChartPie className="icon" /> Dashboard
         </NavLink>
         <NavLink to="/student/leaderboard" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <FaTrophy className="icon" /> Leaderboard
         </NavLink>
         
         <div className="text-muted small text-uppercase fw-bold mt-4 mb-2 ms-4" style={{fontSize: '0.65rem', letterSpacing: '1px'}}>GitHub Insights</div>
         <a href="#repositories" className="sidebar-link">
            <FaBook className="icon" /> Repositories
         </a>
         <a href="#timeline" className="sidebar-link">
            <FaChartLine className="icon" /> Contributions
         </a>
         <a href="#achievements" className="sidebar-link">
            <FaMedal className="icon" /> Achievements
         </a>
         
         <div className="text-muted small text-uppercase fw-bold mt-4 mb-2 ms-4" style={{fontSize: '0.65rem', letterSpacing: '1px'}}>Preferences</div>
         <NavLink to="/student/profile" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <FaUser className="icon" /> Profile
         </NavLink>
         <a href="#!" className="sidebar-link">
            <FaCog className="icon" /> Settings
         </a>
      </div>
    </div>
  );
};

export default Sidebar;
