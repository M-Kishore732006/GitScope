import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { 
  FaSearch, 
  FaFilter, 
  FaGithub, 
  FaCheckCircle, 
  FaExclamationTriangle, 
  FaUserGraduate, 
  FaSync,
  FaEye,
  FaLayerGroup
} from 'react-icons/fa';
import StaffStudentProfileModal from './StaffStudentProfileModal';

const MyStudents = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Search & Filter state
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [department, setDepartment] = useState('');
  const [year, setYear] = useState('');
  const [section, setSection] = useState('');
  const [githubConnected, setGithubConnected] = useState('');
  const [activeStatus, setActiveStatus] = useState('');

  // Selected student for Profile View Modal / Drawer
  const [selectedStudentId, setSelectedStudentId] = useState(null);

  const token = JSON.parse(localStorage.getItem('userInfo'))?.token;

  const fetchStudents = async () => {
    setLoading(true);
    setError('');
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (department) params.append('department', department);
      if (year) params.append('year', year);
      if (section) params.append('section', section);
      if (githubConnected) params.append('githubConnected', githubConnected);
      if (activeStatus) params.append('activeStatus', activeStatus);

      const res = await axios.get(`/api/staff/students?${params.toString()}`, config);
      setStudents(res.data || []);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to fetch assigned students list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
    // eslint-disable-next-line
  }, [department, year, section, githubConnected, activeStatus]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchStudents();
  };

  const handleSyncStudent = async (studentId, e) => {
    e.stopPropagation();
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.post(`/api/staff/students/${studentId}/sync`, {}, config);
      fetchStudents();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to synchronize student GitHub telemetry.');
    }
  };

  return (
    <div className="my-students-page">
      {/* Header */}
      <div className="d-flex flex-wrap align-items-center justify-content-between mb-4 gap-3">
        <div>
          <h2 className="fw-bold text-dark mb-1">My Assigned Students</h2>
          <p className="text-muted small mb-0">
            Monitor GitHub telemetry and contribution performance for students under your guidance.
          </p>
        </div>
        <button className="btn btn-outline-primary btn-sm rounded-3 fw-bold shadow-sm" onClick={fetchStudents}>
          <FaSync className="me-2" /> Refresh List
        </button>
      </div>

      {/* Search & Filter Control Panel */}
      <div className="saas-card mb-4">
        <form onSubmit={handleSearchSubmit} className="row g-3">
          {/* Search Input */}
          <div className="col-12 col-md-4">
            <div className="input-group shadow-sm">
              <span className="input-group-text bg-light border-end-0"><FaSearch className="text-muted" /></span>
              <input 
                type="text" 
                className="form-control border-start-0 bg-light" 
                placeholder="Search by Name, Roll No, GitHub..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {/* Department Filter */}
          <div className="col-6 col-md-2">
            <select className="form-select bg-light" value={department} onChange={(e) => setDepartment(e.target.value)}>
              <option value="">All Departments</option>
              <option value="CSE">CSE</option>
              <option value="AI & DS">AI &amp; DS</option>
              <option value="IT">IT</option>
              <option value="ECE">ECE</option>
              <option value="EEE">EEE</option>
              <option value="MECH">MECH</option>
              <option value="CIVIL">CIVIL</option>
            </select>
          </div>

          {/* Year Filter */}
          <div className="col-6 col-md-2">
            <select className="form-select bg-light" value={year} onChange={(e) => setYear(e.target.value)}>
              <option value="">All Years</option>
              <option value="1">1st Year</option>
              <option value="2">2nd Year</option>
              <option value="3">3rd Year</option>
              <option value="4">4th Year</option>
            </select>
          </div>

          {/* Section Filter */}
          <div className="col-6 col-md-2">
            <select className="form-select bg-light" value={section} onChange={(e) => setSection(e.target.value)}>
              <option value="">All Sections</option>
              <option value="A">Section A</option>
              <option value="B">Section B</option>
              <option value="C">Section C</option>
              <option value="D">Section D</option>
            </select>
          </div>

          {/* GitHub Connection Status Filter */}
          <div className="col-6 col-md-2">
            <select className="form-select bg-light" value={githubConnected} onChange={(e) => setGithubConnected(e.target.value)}>
              <option value="">GitHub Status</option>
              <option value="true">Connected</option>
              <option value="false">Not Connected</option>
            </select>
          </div>

          {/* Activity Status Filter */}
          <div className="col-6 col-md-2">
            <select className="form-select bg-light" value={activeStatus} onChange={(e) => setActiveStatus(e.target.value)}>
              <option value="">Activity Level</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </form>
      </div>

      {/* Student List Table */}
      <div className="saas-card">
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary me-2" role="status"></div>
            <span className="fw-semibold text-muted">Loading assigned students data...</span>
          </div>
        ) : error ? (
          <div className="alert alert-danger mb-0">{error}</div>
        ) : students.length === 0 ? (
          <div className="text-center py-5 text-muted">
            <FaUserGraduate className="fs-1 text-secondary mb-3 opacity-50" />
            <h5 className="fw-bold">No Assigned Students Found</h5>
            <p className="small mb-0">Try clearing filters or search queries.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Student Info</th>
                  <th>ID / Roll No</th>
                  <th>Dept &amp; Class</th>
                  <th>GitHub Account</th>
                  <th>Connection</th>
                  <th>Activity Status</th>
                  <th>Last Activity</th>
                  <th>Score</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.map((st) => (
                  <tr key={st._id} style={{ cursor: 'pointer' }} onClick={() => setSelectedStudentId(st._id)}>
                    <td>
                      <div className="d-flex align-items-center">
                        <div className="avatar-circle me-2 bg-primary-subtle text-primary fw-bold" style={{ width: 36, height: 36 }}>
                          {st.fullName?.charAt(0).toUpperCase() || 'S'}
                        </div>
                        <div>
                          <div className="fw-bold text-dark">{st.fullName}</div>
                          <div className="text-muted extra-small">{st.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="fw-semibold small">{st.rollNumber}</td>
                    <td>
                      <span className="badge bg-light text-dark border me-1">{st.department}</span>
                      <span className="extra-small text-muted">Y{st.year} - Sec {st.section}</span>
                    </td>
                    <td>
                      {st.githubLinked ? (
                        <span className="fw-semibold text-primary">@{st.githubUsername}</span>
                      ) : (
                        <span className="text-muted italic small">Not Linked</span>
                      )}
                    </td>
                    <td>
                      {st.githubLinked ? (
                        <span className="badge bg-success-subtle text-success border border-success-subtle">
                          <FaCheckCircle className="me-1" /> Connected
                        </span>
                      ) : (
                        <span className="badge bg-warning-subtle text-warning border border-warning-subtle">
                          Not Connected
                        </span>
                      )}
                    </td>
                    <td>
                      {st.activityStatus === 'Active' ? (
                        <span className="badge bg-info-subtle text-primary border border-info-subtle">Active</span>
                      ) : st.activityStatus === 'Inactive' ? (
                        <span className="badge bg-danger-subtle text-danger border border-danger-subtle">Inactive</span>
                      ) : (
                        <span className="badge bg-light text-muted">N/A</span>
                      )}
                    </td>
                    <td className="small text-muted">
                      {st.lastGithubActivity ? new Date(st.lastGithubActivity).toLocaleDateString() : 'Never'}
                    </td>
                    <td>
                      <span className="badge bg-primary px-2 py-1">{st.contributionScore} pts</span>
                    </td>
                    <td className="text-end">
                      <button className="btn btn-sm btn-light me-1 border" title="View Student Telemetry" onClick={() => setSelectedStudentId(st._id)}>
                        <FaEye className="text-primary" />
                      </button>
                      {st.githubLinked && (
                        <button className="btn btn-sm btn-outline-primary border" title="Sync GitHub Data" onClick={(e) => handleSyncStudent(st._id, e)}>
                          <FaSync />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detailed Student Telemetry Modal / Drawer */}
      {selectedStudentId && (
        <StaffStudentProfileModal 
          studentId={selectedStudentId} 
          onClose={() => setSelectedStudentId(null)} 
        />
      )}
    </div>
  );
};

export default MyStudents;
