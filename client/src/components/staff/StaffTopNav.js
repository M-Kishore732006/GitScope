import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaSearch, FaBell, FaChevronDown, FaUserTie, FaBars, FaSignOutAlt, FaUser } from 'react-icons/fa';

const StaffTopNav = ({ user, handleLogout, toggleSidebar }) => {
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState([]);

  const dropdownRef = useRef(null);
  const notifRef = useRef(null);

  const token = JSON.parse(localStorage.getItem('userInfo'))?.token;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) setDropdownOpen(false);
      if (notifRef.current && !notifRef.current.contains(event.target)) setNotifOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const res = await axios.get('/api/staff/notifications', config);
        setNotifications(res.data || []);
      } catch (err) {
        // silent fallback
      }
    };
    if (token) fetchNotifications();
  }, [token]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/staff/students?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <div className="topnav px-3 px-md-4 py-2 border-bottom bg-white sticky-top d-flex align-items-center justify-content-between flex-wrap gap-2">
      {/* Mobile Hamburger & Logo */}
      <div className="d-flex align-items-center me-2">
        <button 
          className="btn btn-light border p-2 rounded-3 me-3 d-lg-none shadow-sm text-dark d-flex align-items-center"
          onClick={toggleSidebar}
          aria-label="Toggle navigation menu"
        >
          <FaBars className="fs-5" />
        </button>
        <span className="fw-extrabold text-dark d-lg-none" style={{ letterSpacing: '-0.5px' }}>GitScope</span>
      </div>

      {/* Global Search Bar for Assigned Students */}
      <form onSubmit={handleSearchSubmit} className="position-relative flex-grow-1 search-wrapper" style={{ maxWidth: '380px', minWidth: '220px' }}>
        <div className="search-bar shadow-sm d-flex align-items-center bg-light px-3 py-2 rounded-3 border w-100">
          <FaSearch className="text-muted me-2" />
          <input 
            type="text" 
            placeholder="Search assigned students..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border-0 bg-transparent flex-grow-1 outline-none small"
            style={{ outline: 'none' }}
          />
        </div>
      </form>

      {/* Top Bar Actions */}
      <div className="topnav-actions d-flex align-items-center gap-3">
        {/* Notifications Dropdown */}
        <div className="position-relative" ref={notifRef}>
          <button 
            className="btn btn-light rounded-circle shadow-sm border p-2 text-muted position-relative" 
            style={{ width: 40, height: 40 }}
            onClick={() => setNotifOpen(!notifOpen)}
          >
            <FaBell />
            {notifications.length > 0 && (
              <span className="position-absolute top-0 start-100 translate-middle p-1 bg-danger border border-light rounded-circle">
                <span className="visually-hidden">New alerts</span>
              </span>
            )}
          </button>

          {notifOpen && (
            <div className="dropdown-menu dropdown-menu-end shadow-lg border-0 mt-2 p-0 rounded-3 show position-absolute" style={{ width: '320px', right: 0, zIndex: 1050 }}>
              <div className="p-3 border-bottom d-flex justify-content-between align-items-center bg-light">
                <h6 className="mb-0 fw-bold">Student Alerts</h6>
                <span className="badge bg-primary rounded-pill">{notifications.length}</span>
              </div>
              <div className="list-group list-group-flush overflow-auto" style={{ maxHeight: '280px' }}>
                {notifications.length === 0 ? (
                  <div className="p-3 text-center text-muted small">No pending alerts for assigned students</div>
                ) : (
                  notifications.map((n, idx) => (
                    <div key={idx} className="list-group-item list-group-item-action p-3">
                      <div className="fw-semibold small text-dark">{n.title || 'Notification'}</div>
                      <div className="text-muted small mt-1">{n.message}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Pill */}
        <div className="position-relative" ref={dropdownRef}>
          <div 
            className="d-flex align-items-center pe-auto cursor-pointer border rounded-pill p-1 ps-3 shadow-sm bg-white" 
            onClick={() => setDropdownOpen(!dropdownOpen)}
            style={{ cursor: 'pointer' }}
          >
            <span className="fw-bold me-2 small text-dark d-none d-sm-inline">
              {user?.fullName || user?.username || 'Staff'}
            </span>
            <div className="avatar-circle me-1 bg-primary text-white" style={{ width: 32, height: 32, fontSize: '0.85rem' }}>
              {(user?.fullName?.charAt(0) || user?.username?.charAt(0) || 'S').toUpperCase()}
            </div>
            <FaChevronDown className="ms-1 me-1 text-muted small" />
          </div>

          {dropdownOpen && (
            <ul className="dropdown-menu dropdown-menu-end shadow border-0 mt-2 rounded-3 show position-absolute" style={{ right: 0, minWidth: '180px', zIndex: 1050 }}>
              <li>
                <Link className="dropdown-item py-2 fw-medium text-secondary d-flex align-items-center" to="/staff/profile" onClick={() => setDropdownOpen(false)}>
                  <FaUser className="me-2 text-primary" /> My Profile
                </Link>
              </li>
              <li><hr className="dropdown-divider my-1" /></li>
              <li>
                <button className="dropdown-item py-2 fw-medium text-danger d-flex align-items-center" onClick={handleLogout}>
                  <FaSignOutAlt className="me-2" /> Logout
                </button>
              </li>
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default StaffTopNav;
