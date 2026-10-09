import React from 'react';
import { NavLink } from 'react-router-dom';
import { FaChartPie, FaBook, FaTrophy, FaMedal, FaChartLine, FaUser, FaCog, FaRocket, FaTimes, FaComments, FaChevronLeft } from 'react-icons/fa';
import { useSocket } from '../../context/SocketContext';

const Sidebar = ({ handleLogout, mobileOpen, closeSidebar, collapsed, toggleSidebar }) => {
  const { totalUnread } = useSocket();

  return (
    <div className={`sidebar shadow-sm ${mobileOpen ? 'mobile-open' : ''} ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header d-flex align-items-center justify-content-between">
         <div className="d-flex align-items-center">
           <div className="avatar-circle me-2" style={{ width: 34, height: 34, fontSize: '0.95rem' }}>
             <FaRocket />
           </div>
           <div>
             <span className="fw-extrabold text-main" style={{ letterSpacing: '-0.5px' }}>GitScope</span>
           </div>
         </div>
         <div className="d-flex align-items-center gap-1">
           <button 
             className="btn btn-sm btn-light border p-1 rounded-circle text-muted d-none d-lg-flex align-items-center justify-content-center"
             onClick={toggleSidebar}
             title="Slide Out (Full Screen)"
             style={{ width: 28, height: 28 }}
           >
             <FaChevronLeft style={{ fontSize: '0.75rem' }} />
           </button>
           <button className="btn btn-sm text-muted d-lg-none p-1 border-0" onClick={closeSidebar}>
             <FaTimes className="fs-5" />
           </button>
         </div>
      </div>
      <div className="sidebar-nav" onClick={closeSidebar}>
         <NavLink to="/student/dashboard" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} end>
            <FaChartPie className="icon" /> Dashboard
         </NavLink>
         <NavLink to="/student/messages" className={({ isActive }) => `sidebar-link d-flex align-items-center justify-content-between ${isActive ? 'active' : ''}`}>
            <span className="d-flex align-items-center">
              <FaComments className="icon me-2" /> Messages
            </span>
            {totalUnread > 0 && (
              <span className="badge bg-danger rounded-pill px-2 py-1 small">
                {totalUnread > 99 ? '99+' : totalUnread}
              </span>
            )}
         </NavLink>
         <NavLink to="/student/leaderboard" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <FaTrophy className="icon" /> Leaderboard
         </NavLink>
         
         <div className="text-muted small text-uppercase fw-bold mt-4 mb-2 ms-4" style={{fontSize: '0.65rem', letterSpacing: '1px'}}>GitHub Insights</div>
         <NavLink to="/student/repositories" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <FaBook className="icon" /> Repositories
         </NavLink>
         <NavLink to="/student/contributions" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <FaChartLine className="icon" /> Contributions
         </NavLink>
         <NavLink to="/student/achievements" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <FaMedal className="icon" /> Achievements
         </NavLink>
         
         <div className="text-muted small text-uppercase fw-bold mt-4 mb-2 ms-4" style={{fontSize: '0.65rem', letterSpacing: '1px'}}>Preferences</div>
         <NavLink to="/student/profile" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <FaUser className="icon" /> Profile
         </NavLink>
         <NavLink to="/student/settings" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <FaCog className="icon" /> Settings
         </NavLink>
      </div>
    </div>
  );
};

export default Sidebar;
