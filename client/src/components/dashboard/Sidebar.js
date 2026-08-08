import React from 'react';
import { NavLink } from 'react-router-dom';
import { FaGithub, FaChartPie, FaBook, FaTrophy, FaMedal, FaChartLine, FaUser, FaCog, FaSignOutAlt, FaRocket } from 'react-icons/fa';

const Sidebar = ({ handleLogout }) => {
  return (
    <div className="sidebar shadow-sm">
      <div className="sidebar-header">
         <div className="avatar-circle me-3" style={{width: 32, height: 32, fontSize: '1rem'}}><FaRocket /></div>
         GitScope
      </div>
      <div className="sidebar-nav">
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
         <a href="#!" className="sidebar-link">
            <FaUser className="icon" /> Profile
         </a>
         <a href="#!" className="sidebar-link">
            <FaCog className="icon" /> Settings
         </a>
         <a href="#!" className="sidebar-link text-danger mt-2" onClick={handleLogout}>
            <FaSignOutAlt className="icon" /> Logout
         </a>
      </div>
    </div>
  );
};

export default Sidebar;
