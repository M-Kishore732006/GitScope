import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { FaSearch, FaMoon, FaSun, FaCloudDownloadAlt, FaChevronDown, FaBars, FaUser, FaCog, FaSignOutAlt, FaComments } from 'react-icons/fa';
import { toTitleCase } from '../../utils/formatters';
import { useTheme } from '../../context/ThemeContext';
import { useSocket } from '../../context/SocketContext';
import NotificationDropdown from '../NotificationDropdown';

const TopNav = ({ user, stats, handleLogout, toggleSidebar }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { theme, toggleTheme } = useTheme();
  const { totalUnread } = useSocket();

  // Close dropdown if clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="topnav px-3 px-md-4 py-2 sticky-top d-flex align-items-center justify-content-between flex-wrap gap-2">
       {/* Mobile Hamburger Button */}
       <div className="d-flex align-items-center me-2">
         <button 
           className="btn btn-light border p-2 rounded-3 me-2 d-lg-none shadow-sm text-main d-flex align-items-center theme-btn-icon"
           onClick={toggleSidebar}
           aria-label="Toggle Navigation"
         >
           <FaBars className="fs-5" />
         </button>
         <span className="fw-extrabold text-main d-lg-none" style={{ letterSpacing: '-0.5px' }}>GitScope</span>
       </div>

       <div className="search-bar shadow-sm flex-grow-1 search-wrapper" style={{ maxWidth: '380px', minWidth: '180px' }}>
          <FaSearch className="text-muted" />
          <input type="text" placeholder="Search repositories, insights..." />
       </div>
       
       <div className="topnav-actions d-flex align-items-center gap-2">
          {stats?.lastUpdated && (
             <div className="d-none d-sm-flex align-items-center text-muted small me-2 rounded-pill px-3 py-1 border bg-pill">
                <FaCloudDownloadAlt className="text-success me-2" />
                Synced: {new Date(stats.lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute:'2-digit' })}
             </div>
          )}

          {/* Theme Toggle Button */}
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
            to="/student/messages"
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

          {/* Responsive Notification Center */}
          <NotificationDropdown role="student" />

          {/* User Menu Dropdown */}
          <div className="dropdown ms-2" ref={dropdownRef}>
             <div 
                className="d-flex align-items-center cursor-pointer border rounded-pill p-1 ps-3 shadow-sm bg-card" 
                onClick={() => setDropdownOpen(!dropdownOpen)}
             >
                <span className="fw-semibold me-2 small text-main d-none d-md-inline">
                  {toTitleCase(user?.fullName || user?.username)}
                </span>
                <div className="avatar-circle">
                   {(user?.fullName || user?.username || 'U').charAt(0).toUpperCase()}
                </div>
                <FaChevronDown className="ms-2 text-muted small me-1" />
             </div>
             <ul className={`dropdown-menu dropdown-menu-end shadow border mt-2 rounded-3 ${dropdownOpen ? 'show' : ''}`} style={{ position: 'absolute', right: 0 }}>
                <li>
                  <Link className="dropdown-item py-2 fw-medium d-flex align-items-center gap-2" to="/student/profile" onClick={() => setDropdownOpen(false)}>
                    <FaUser className="text-muted" /> My Profile
                  </Link>
                </li>
                <li>
                  <Link className="dropdown-item py-2 fw-medium d-flex align-items-center gap-2" to="/student/settings" onClick={() => setDropdownOpen(false)}>
                    <FaCog className="text-muted" /> Settings
                  </Link>
                </li>
                <li><hr className="dropdown-divider my-1" /></li>
                <li>
                  <button className="dropdown-item py-2 fw-medium text-danger d-flex align-items-center gap-2" onClick={handleLogout}>
                    <FaSignOutAlt /> Logout
                  </button>
                </li>
             </ul>
          </div>
       </div>
    </header>
  );
};

export default TopNav;
