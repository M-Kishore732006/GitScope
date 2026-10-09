import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaSearch, FaChevronDown, FaShieldAlt, FaUserGraduate, FaUserTie, FaGithub, FaBars, FaSun, FaMoon, FaCog, FaSignOutAlt } from 'react-icons/fa';
import { toTitleCase } from '../../utils/formatters';
import { useTheme } from '../../context/ThemeContext';
import NotificationDropdown from '../NotificationDropdown';

const AdminTopNav = ({ user, handleLogout, toggleSidebar, sidebarCollapsed }) => {
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [searching, setSearching] = useState(false);

  const dropdownRef = useRef(null);
  const searchRef = useRef(null);
  const { theme, toggleTheme } = useTheme();

  const token = JSON.parse(localStorage.getItem('userInfo'))?.token;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) setDropdownOpen(false);
      if (searchRef.current && !searchRef.current.contains(event.target)) setSearchResults(null);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
        <span className="fw-extrabold text-main" style={{ letterSpacing: '-0.5px' }}>GitScope Admin</span>
      </div>

      {/* Global Search Component */}
      <div className="position-relative flex-grow-1 search-wrapper" ref={searchRef} style={{ maxWidth: '380px', minWidth: '180px' }}>
        <div className="search-bar shadow-sm d-flex align-items-center px-3 py-2 rounded-3 border w-100">
          <FaSearch className="text-muted me-2" />
          <input 
            type="text" 
            placeholder="Search Students, Staff, GitHub IDs..." 
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="border-0 bg-transparent flex-grow-1 small"
            style={{ outline: 'none' }}
          />
        </div>

        {/* Search Results Dropdown */}
        {searchResults && (
          <div className="position-absolute top-100 start-0 w-100 bg-card text-main shadow-lg rounded-3 border mt-1 p-2" style={{ zIndex: 1100 }}>
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
                        className="d-flex justify-content-between align-items-center p-2 rounded hover-bg-light text-decoration-none text-main small border-bottom"
                      >
                        <div>
                          <div className="fw-bold">{toTitleCase(s.fullName || s.username)}</div>
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
                        className="d-flex justify-content-between align-items-center p-2 rounded hover-bg-light text-decoration-none text-main small border-bottom"
                      >
                        <div>
                          <div className="fw-bold">{toTitleCase(st.fullName || st.username)}</div>
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
                      <FaGithub className="me-1" /> GitHub Profiles ({searchResults.github.length})
                    </div>
                    {searchResults.github.map((g, idx) => (
                      <Link 
                        key={idx} 
                        to="/admin/github-accounts" 
                        onClick={() => setSearchResults(null)}
                        className="d-flex justify-content-between align-items-center p-2 rounded hover-bg-light text-decoration-none text-main small"
                      >
                        <div>
                          <div className="fw-bold">@{g.githubUsername?.toUpperCase()}</div>
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
      <div className="topnav-actions d-flex align-items-center gap-2">
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

        {/* Responsive Admin Notification Center */}
        <NotificationDropdown role="admin" />

        {/* User Menu Dropdown */}
        <div className="dropdown" ref={dropdownRef}>
          <div 
            className="d-flex align-items-center cursor-pointer border rounded-pill p-1 ps-3 shadow-sm bg-card" 
            onClick={() => setDropdownOpen(!dropdownOpen)}
            style={{ cursor: 'pointer' }}
          >
            <span className="fw-bold me-2 small text-main d-none d-sm-inline">
              {toTitleCase(user?.fullName || user?.username || 'Admin User')}
            </span>
            <div className="avatar-circle me-1 bg-dark text-white fw-bold" style={{ width: 32, height: 32, fontSize: '0.85rem' }}>
              <FaShieldAlt className="text-warning" />
            </div>
            <FaChevronDown className="ms-1 text-muted small me-1" />
          </div>

          <ul className={`dropdown-menu dropdown-menu-end shadow border-0 mt-2 rounded-3 ${dropdownOpen ? 'show' : ''}`} style={{ position: 'absolute', right: 0 }}>
            <li>
              <Link className="dropdown-item py-2 fw-medium d-flex align-items-center gap-2" to="/admin/settings" onClick={() => setDropdownOpen(false)}>
                <FaCog className="text-muted" /> Admin Settings
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

export default AdminTopNav;
