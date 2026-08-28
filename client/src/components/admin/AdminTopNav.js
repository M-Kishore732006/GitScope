import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaSearch, FaBell, FaChevronDown, FaShieldAlt, FaUserTie, FaUserGraduate, FaGithub, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

const AdminTopNav = ({ user, handleLogout }) => {
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [searching, setSearching] = useState(false);

  const [notifications, setNotifications] = useState([]);
  
  const dropdownRef = useRef(null);
  const notifRef = useRef(null);
  const searchRef = useRef(null);

  const token = JSON.parse(localStorage.getItem('userInfo'))?.token;

  // Click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) setDropdownOpen(false);
      if (notifRef.current && !notifRef.current.contains(event.target)) setNotifOpen(false);
      if (searchRef.current && !searchRef.current.contains(event.target)) setSearchResults(null);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const res = await axios.get('/api/admin/notifications', config);
        setNotifications(res.data || []);
      } catch (err) {
        // silent fallback
      }
    };
    if (token) fetchNotifications();
  }, [token]);

  // Global search handler
  const handleSearch = async (val) => {
    setSearchQuery(val);
    if (!val || val.trim().length < 2) {
      setSearchResults(null);
      return;
    }
    setSearching(true);
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const res = await axios.get(`/api/admin/search?q=${encodeURIComponent(val)}`, config);
      setSearchResults(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="topnav px-4 py-2 border-bottom bg-white sticky-top d-flex align-items-center justify-content-between">
      {/* Global Search Component */}
      <div className="position-relative" ref={searchRef} style={{ width: '380px' }}>
        <div className="search-bar shadow-sm d-flex align-items-center bg-light px-3 py-2 rounded-3 border">
          <FaSearch className="text-muted me-2" />
          <input 
            type="text" 
            placeholder="Search Students, Staff, GitHub IDs..." 
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="border-0 bg-transparent flex-grow-1 outline-none small"
            style={{ outline: 'none' }}
          />
        </div>

        {/* Search Results Dropdown */}
        {searchResults && (
          <div className="position-absolute top-100 start-0 w-100 bg-white shadow-lg rounded-3 border mt-1 p-2" style={{ zIndex: 1050 }}>
            {searching ? (
              <div className="p-3 text-center text-muted small">Searching...</div>
            ) : (
              <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                {searchResults.students?.length > 0 && (
                  <div className="mb-2">
                    <div className="text-muted small fw-bold text-uppercase px-2 mb-1" style={{ fontSize: '0.7rem' }}>
                      <FaUserGraduate className="me-1 text-primary" /> Students ({searchResults.students.length})
                    </div>
                    {searchResults.students.map(s => (
                      <Link 
                        key={s._id} 
                        to="/admin/students" 
                        onClick={() => setSearchResults(null)}
                        className="d-flex justify-content-between align-items-center p-2 rounded hover-bg-light text-decoration-none text-dark small border-bottom"
                      >
                        <div>
                          <div className="fw-bold">{s.fullName || s.username}</div>
                          <div className="text-muted" style={{ fontSize: '0.75rem' }}>{s.rollNumber} • {s.department}</div>
                        </div>
                        <span className="badge bg-primary text-white" style={{ fontSize: '0.65rem' }}>Student</span>
                      </Link>
                    ))}
                  </div>
                )}

                {searchResults.staff?.length > 0 && (
                  <div className="mb-2">
                    <div className="text-muted small fw-bold text-uppercase px-2 mb-1" style={{ fontSize: '0.7rem' }}>
                      <FaUserTie className="me-1 text-success" /> Staff ({searchResults.staff.length})
                    </div>
                    {searchResults.staff.map(st => (
                      <Link 
                        key={st._id} 
                        to="/admin/staff" 
                        onClick={() => setSearchResults(null)}
                        className="d-flex justify-content-between align-items-center p-2 rounded hover-bg-light text-decoration-none text-dark small border-bottom"
                      >
                        <div>
                          <div className="fw-bold">{st.fullName || st.username}</div>
                          <div className="text-muted" style={{ fontSize: '0.75rem' }}>{st.email} • {st.department}</div>
                        </div>
                        <span className="badge bg-success text-white" style={{ fontSize: '0.65rem' }}>Staff</span>
                      </Link>
                    ))}
                  </div>
                )}

                {searchResults.github?.length > 0 && (
                  <div>
                    <div className="text-muted small fw-bold text-uppercase px-2 mb-1" style={{ fontSize: '0.7rem' }}>
                      <FaGithub className="me-1 text-dark" /> GitHub Profiles ({searchResults.github.length})
                    </div>
                    {searchResults.github.map((g, idx) => (
                      <Link 
                        key={idx} 
                        to="/admin/github-accounts" 
                        onClick={() => setSearchResults(null)}
                        className="d-flex justify-content-between align-items-center p-2 rounded hover-bg-light text-decoration-none text-dark small"
                      >
                        <div>
                          <div className="fw-bold">@{g.githubUsername}</div>
                          <div className="text-muted" style={{ fontSize: '0.75rem' }}>{g.studentName}</div>
                        </div>
                        <span className="badge bg-dark text-white" style={{ fontSize: '0.65rem' }}>Score: {g.score}</span>
                      </Link>
                    ))}
                  </div>
                )}

                {searchResults.students?.length === 0 && searchResults.staff?.length === 0 && searchResults.github?.length === 0 && (
                  <div className="p-3 text-center text-muted small">No matching results found.</div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right Navigation Actions */}
      <div className="topnav-actions d-flex align-items-center gap-3">
        {/* Notification Bell Dropdown */}
        <div className="position-relative" ref={notifRef}>
          <button 
            className="btn btn-light rounded-circle border shadow-sm p-2 text-muted position-relative" 
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
            <div className="position-absolute end-0 top-100 mt-2 bg-white shadow-lg border rounded-3 p-3" style={{ width: '320px', zIndex: 1050 }}>
              <div className="d-flex justify-content-between align-items-center mb-2 pb-2 border-bottom">
                <h6 className="fw-bold mb-0">System Notifications</h6>
                <span className="badge bg-primary rounded-pill">{notifications.length}</span>
              </div>
              <div style={{ maxHeight: '250px', overflowY: 'auto' }}>
                {notifications.length > 0 ? (
                  notifications.map((n, i) => (
                    <div key={i} className="mb-2 p-2 rounded bg-light border-bottom">
                      <div className="d-flex align-items-center justify-content-between">
                        <span className={`fw-bold small text-${n.type === 'danger' ? 'danger' : n.type === 'success' ? 'success' : 'primary'}`}>
                          {n.title}
                        </span>
                        <span className="text-muted" style={{ fontSize: '0.65rem' }}>
                          {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="small text-muted mb-0 mt-1" style={{ fontSize: '0.75rem' }}>{n.message}</p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-3 text-muted small">No new notifications.</div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Menu Dropdown */}
        <div className="dropdown" ref={dropdownRef}>
          <div 
            className="d-flex align-items-center cursor-pointer border rounded-pill p-1 ps-3 shadow-sm bg-white" 
            onClick={() => setDropdownOpen(!dropdownOpen)}
            style={{ cursor: 'pointer' }}
          >
            <span className="fw-bold me-3 small text-dark">{user?.fullName || user?.username || 'Admin User'}</span>
            <div className="avatar-circle me-1 bg-dark text-white fw-bold" style={{ width: 34, height: 34, fontSize: '0.85rem' }}>
              <FaShieldAlt className="text-warning" />
            </div>
            <FaChevronDown className="ms-2 text-muted small me-2" />
          </div>

          <ul className={`dropdown-menu dropdown-menu-end shadow border-0 mt-2 rounded-3 ${dropdownOpen ? 'show' : ''}`} style={{ position: 'absolute', right: 0 }}>
            <li>
              <Link className="dropdown-item py-2 fw-medium text-secondary" to="/admin/settings" onClick={() => setDropdownOpen(false)}>
                Admin Settings
              </Link>
            </li>
            <li><hr className="dropdown-divider" /></li>
            <li>
              <button className="dropdown-item py-2 fw-medium text-danger" onClick={handleLogout}>
                Logout
              </button>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AdminTopNav;
