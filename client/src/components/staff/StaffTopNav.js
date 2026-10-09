import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaSearch, FaChevronDown, FaBars, FaSignOutAlt, FaUser, FaSun, FaMoon, FaComments } from 'react-icons/fa';
import { toTitleCase } from '../../utils/formatters';
import { useTheme } from '../../context/ThemeContext';
import { useSocket } from '../../context/SocketContext';
import NotificationDropdown from '../NotificationDropdown';

const StaffTopNav = ({ user, handleLogout, toggleSidebar, sidebarCollapsed }) => {
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef(null);
  const { theme, toggleTheme } = useTheme();
  const { totalUnread } = useSocket();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) setDropdownOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/staff/students?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <header className="topnav px-3 px-md-4 py-2 sticky-top d-flex align-items-center justify-content-between flex-wrap gap-2">
      {/* Sidebar Toggle Button (Desktop Full Screen & Mobile Slide In/Out) */}
      <div className="d-flex align-items-center me-2">
        <button 
          className="btn btn-light border p-2 rounded-3 me-2 shadow-sm text-main d-flex align-items-center theme-btn-icon"
          onClick={toggleSidebar}
          title={sidebarCollapsed ? "Slide In Sidebar" : "Slide Out to Full Screen"}
          aria-label="Toggle navigation menu"
        >
          <FaBars className="fs-5" />
        </button>
        
      </div>

      {/* Global Search Bar for Assigned Students */}
      <form onSubmit={handleSearchSubmit} className="position-relative flex-grow-1 search-wrapper" style={{ maxWidth: '380px', minWidth: '180px' }}>
        <div className="search-bar shadow-sm d-flex align-items-center px-3 py-2 rounded-3 border w-100">
          <FaSearch className="text-muted me-2" />
          <input 
            type="text" 
            placeholder="Search assigned students..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border-0 bg-transparent flex-grow-1 small"
            style={{ outline: 'none' }}
          />
        </div>
      </form>

      {/* Top Bar Actions */}
      <div className="topnav-actions d-flex align-items-center gap-2">
        {/* Theme Toggle */}
        <button 
          className="btn btn-light rounded-circle shadow-sm border p-2 text-muted theme-btn-icon d-flex align-items-center justify-content-center"
          style={{ width: 40, height: 40 }}
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          aria-label="Toggle Theme"
        >
           {theme === 'dark' ? <FaSun className="text-warning fs-5" /> : <FaMoon className="fs-5" />}
        </button>

        {/* Chat Messages Button */}
        <Link 
          to="/staff/messages"
          className="btn btn-light rounded-circle shadow-sm border p-2 text-muted theme-btn-icon d-flex align-items-center justify-content-center position-relative"
          style={{ width: 40, height: 40 }}
          title="Messages"
          aria-label="Messages"
        >
          <FaComments className="fs-6" />
          {totalUnread > 0 && (
            <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger border border-light" style={{ fontSize: '0.65rem' }}>
              {totalUnread > 9 ? '9+' : totalUnread}
            </span>
          )}
        </Link>

        {/* Responsive Staff Notification Center */}
        <NotificationDropdown role="staff" />

        {/* User Profile Pill */}
        <div className="position-relative" ref={dropdownRef}>
          <div 
            className="d-flex align-items-center pe-auto cursor-pointer border rounded-pill p-1 ps-3 shadow-sm bg-card" 
            onClick={() => setDropdownOpen(!dropdownOpen)}
            style={{ cursor: 'pointer' }}
          >
            <span className="fw-bold me-2 small text-main d-none d-sm-inline">
              {toTitleCase(user?.fullName || user?.username || 'Staff')}
            </span>
            <div className="avatar-circle me-1 bg-primary text-white" style={{ width: 32, height: 32, fontSize: '0.85rem' }}>
              {(user?.fullName?.charAt(0) || user?.username?.charAt(0) || 'S').toUpperCase()}
            </div>
            <FaChevronDown className="ms-1 me-1 text-muted small" />
          </div>

          {dropdownOpen && (
            <ul className="dropdown-menu dropdown-menu-end shadow border-0 mt-2 rounded-3 show position-absolute" style={{ right: 0, minWidth: '180px', zIndex: 1050 }}>
              <li>
                <Link className="dropdown-item py-2 fw-medium d-flex align-items-center gap-2" to="/staff/profile" onClick={() => setDropdownOpen(false)}>
                  <FaUser className="text-primary" /> My Profile
                </Link>
              </li>
              <li><hr className="dropdown-divider my-1" /></li>
              <li>
                <button className="dropdown-item py-2 fw-medium text-danger d-flex align-items-center gap-2" onClick={handleLogout}>
                  <FaSignOutAlt /> Logout
                </button>
              </li>
            </ul>
          )}
        </div>
      </div>
    </header>
  );
};

export default StaffTopNav;
