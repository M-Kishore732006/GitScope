import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { FaSearch, FaBell, FaMoon, FaSun, FaCloudDownloadAlt, FaChevronDown } from 'react-icons/fa';

const TopNav = ({ user, stats, handleLogout }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

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
    <div className="topnav">
       <div className="search-bar shadow-sm">
          <FaSearch className="text-muted" />
          <input type="text" placeholder="Search repositories, achievements..." />
       </div>
       
       <div className="topnav-actions">
          {stats?.lastUpdated && (
             <div className="d-flex align-items-center text-muted small me-3 bg-light rounded-pill px-3 py-1 border">
                <FaCloudDownloadAlt className="text-success me-2" />
                Synced: {new Date(stats.lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute:'2-digit' })}
             </div>
          )}
          <button className="btn btn-light rounded-circle shadow-sm border p-2 text-muted" style={{width: 40, height: 40}}>
             <FaMoon />
          </button>
          <button className="btn btn-light rounded-circle shadow-sm border p-2 text-muted position-relative" style={{width: 40, height: 40}}>
             <FaBell />
             <span className="position-absolute top-0 start-100 translate-middle p-1 bg-danger border border-light rounded-circle">
               <span className="visually-hidden">New alerts</span>
             </span>
          </button>
          <div className="dropdown ms-3" ref={dropdownRef}>
             <div 
                className="d-flex align-items-center pe-auto cursor-pointer border rounded-pill p-1 ps-3 shadow-sm bg-white" 
                onClick={() => setDropdownOpen(!dropdownOpen)}
             >
                <span className="fw-semibold me-3 small text-dark">{user?.fullName || user?.username}</span>
                <div className="avatar-circle">
                   {user?.fullName?.charAt(0) || user?.username?.charAt(0) || 'U'}
                </div>
                <FaChevronDown className="ms-2 text-muted small" />
             </div>
             <ul className={`dropdown-menu dropdown-menu-end shadow border-0 mt-2 rounded-3 ${dropdownOpen ? 'show' : ''}`} style={{position: 'absolute', right: 0}}>
                <li>
                  <Link className="dropdown-item py-2 fw-medium text-secondary" to="/student/profile" onClick={() => setDropdownOpen(false)}>
                    My Profile
                  </Link>
                </li>
                <li><hr className="dropdown-divider" /></li>
                <li><button className="dropdown-item py-2 fw-medium text-danger" onClick={handleLogout}>Logout</button></li>
             </ul>
          </div>
       </div>
    </div>
  );
};

export default TopNav;
