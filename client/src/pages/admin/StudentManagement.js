import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  FaUserGraduate, 
  FaSearch, 
  FaFilter, 
  FaEye, 
  FaEdit, 
  FaTrash, 
  FaKey, 
  FaGithub, 
  FaCheckCircle, 
  FaBan, 
  FaExclamationTriangle,
  FaBook,
  FaCodeBranch,
  FaStar,
  FaTimes
} from 'react-icons/fa';
import '../../styles/dashboard.css';

const StudentManagement = () => {
  const [students, setStudents] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter states
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('');
  const [year, setYear] = useState('');
  const [section, setSection] = useState('');
  const [status, setStatus] = useState('');
  const [githubFilter, setGithubFilter] = useState('');

  // Modals / Drawers state
  const [activeModal, setActiveModal] = useState(null); // 'view', 'edit', 'delete', 'resetPwd'
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentDetails, setStudentDetails] = useState(null);

  // Edit form state
  const [editForm, setEditForm] = useState({
    fullName: '',
    department: '',
    year: '',
    section: '',
    rollNumber: '',
    githubUsername: '',
    assignedStaff: ''
  });

  const [newPassword, setNewPassword] = useState('');
  const [msg, setMsg] = useState({ text: '', type: '' });

  const token = JSON.parse(localStorage.getItem('userInfo'))?.token;

  const fetchStudents = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      let queryParams = [];
      if (search) queryParams.push(`search=${encodeURIComponent(search)}`);
      if (department) queryParams.push(`department=${encodeURIComponent(department)}`);
      if (year) queryParams.push(`year=${encodeURIComponent(year)}`);
      if (section) queryParams.push(`section=${encodeURIComponent(section)}`);
      if (status) queryParams.push(`status=${encodeURIComponent(status)}`);
      if (githubFilter) queryParams.push(`githubLinked=${githubFilter}`);

      const queryString = queryParams.length > 0 ? `?${queryParams.join('&')}` : '';

      const [stRes, staffRes] = await Promise.all([
        axios.get(`/api/admin/students${queryString}`, config),
        axios.get('/api/admin/staff', config)
      ]);

      setStudents(stRes.data || []);
      setStaffList(staffRes.data || []);
    } catch (error) {
      console.error('Error fetching students:', error);
      setMsg({ text: 'Failed to fetch student roster.', type: 'danger' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [token, department, year, section, status, githubFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchStudents();
  };

  // View Student Full Details
  const handleViewStudent = async (student) => {
    setSelectedStudent(student);
    setActiveModal('view');
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const res = await axios.get(`/api/admin/students/${student._id}`, config);
      setStudentDetails(res.data);
    } catch (error) {
      console.error('Error fetching student details:', error);
    }
  };

  // Edit Student Submit
  const handleEditStudent = async (e) => {
    e.preventDefault();
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.put(`/api/admin/students/${selectedStudent._id}`, editForm, config);
      setMsg({ text: 'Student profile updated.', type: 'success' });
      setActiveModal(null);
      fetchStudents();
    } catch (error) {
      setMsg({ text: error.response?.data?.message || 'Error updating student', type: 'danger' });
    }
  };

  // Toggle Active/Deactive Status
  const handleToggleStatus = async (student) => {
    const nextStatus = student.status === 'deactivated' ? 'active' : 'deactivated';
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.put(`/api/admin/students/${student._id}/status`, { status: nextStatus }, config);
      fetchStudents();
    } catch (error) {
      alert('Failed to update student status');
    }
  };

  // Delete Student
  const handleDeleteStudent = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.delete(`/api/admin/students/${selectedStudent._id}`, config);
      setMsg({ text: 'Student account deleted permanently.', type: 'success' });
      setActiveModal(null);
      fetchStudents();
    } catch (error) {
      setMsg({ text: error.response?.data?.message || 'Error deleting student', type: 'danger' });
    }
  };

  // Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.put(`/api/admin/students/${selectedStudent._id}/reset-password`, { newPassword }, config);
      setMsg({ text: `Password reset successfully for ${selectedStudent.fullName || selectedStudent.username}`, type: 'success' });
      setActiveModal(null);
      setNewPassword('');
    } catch (error) {
      setMsg({ text: error.response?.data?.message || 'Error resetting password', type: 'danger' });
    }
  };

  return (
    <div className="container-fluid px-0">
      {/* Header Banner */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 pb-2 border-bottom">
        <div>
          <h2 className="fw-bold mb-1 d-flex align-items-center">
            <FaUserGraduate className="me-2 text-primary" /> Student Management
          </h2>
          <p className="text-muted mb-0">Institution student directory, academic profiling, GitHub account linking, and account governance.</p>
        </div>
        <div className="mt-3 mt-md-0">
          <span className="badge bg-primary px-3 py-2 rounded-pill fw-bold" style={{ fontSize: '0.9rem' }}>
            Total Registered: {students.length} Students
          </span>
        </div>
      </div>

      {msg.text && (
        <div className={`alert alert-${msg.type} alert-dismissible fade show mb-4`} role="alert">
          {msg.text}
          <button type="button" className="btn-close" onClick={() => setMsg({ text: '', type: '' })}></button>
        </div>
      )}

      {/* Multi-Filter Toolbar */}
      <div className="saas-card mb-4 p-3 bg-white">
        <form onSubmit={handleSearchSubmit} className="row g-2 g-xl-3 align-items-center">
          <div className="col-12 col-md-3">
            <div className="search-bar d-flex align-items-center bg-light px-3 py-2 rounded-3 border w-100">
              <FaSearch className="text-muted me-2 flex-shrink-0" />
              <input 
                type="text" 
                placeholder="Search Name, Roll No, GitHub ID..." 
                value={search} 
                onChange={(e) => setSearch(e.target.value)}
                className="border-0 bg-transparent flex-grow-1 outline-none small w-100"
                style={{ outline: 'none', minWidth: 0 }}
              />
            </div>
          </div>

          <div className="col-6 col-md-2">
            <select className="form-select bg-light border-1 small" value={department} onChange={(e) => setDepartment(e.target.value)}>
              <option value="">Department: All</option>
              <option value="CSE">CSE</option>
              <option value="AI & DS">AI & DS</option>
              <option value="IT">IT</option>
              <option value="ECE">ECE</option>
              <option value="EEE">EEE</option>
              <option value="MECH">MECH</option>
            </select>
          </div>

          <div className="col-6 col-md-2">
            <select className="form-select bg-light border-1 small" value={year} onChange={(e) => setYear(e.target.value)}>
              <option value="">Year: All</option>
              <option value="1">1st Year</option>
              <option value="2">2nd Year</option>
              <option value="3">3rd Year</option>
              <option value="4">4th Year</option>
            </select>
          </div>

          <div className="col-6 col-md-2">
            <select className="form-select bg-light border-1 small" value={githubFilter} onChange={(e) => setGithubFilter(e.target.value)}>
              <option value="">GitHub: All</option>
              <option value="true">Connected</option>
              <option value="false">Not Connected</option>
            </select>
          </div>

          <div className="col-6 col-md-2">
            <select className="form-select bg-light border-1 small" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="">Status: All</option>
              <option value="active">Active</option>
              <option value="deactivated">Deactivated</option>
            </select>
          </div>

          <div className="col-12 col-md-1 text-end">
            <button type="submit" className="btn btn-primary btn-sm w-100 py-2 fw-bold">Filter</button>
          </div>
        </form>
      </div>

      {/* Student List Table */}
      <div className="saas-card overflow-hidden p-0 mb-4">
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status"></div>
            <p className="text-muted small mt-2">Loading Student Directory...</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th scope="col" className="text-muted text-uppercase small fw-bold px-4 py-3 border-0">Student</th>
                  <th scope="col" className="text-muted text-uppercase small fw-bold py-3 border-0">Roll Number</th>
                  <th scope="col" className="text-muted text-uppercase small fw-bold py-3 border-0">Cohort</th>
                  <th scope="col" className="text-muted text-uppercase small fw-bold py-3 border-0">GitHub Account</th>
                  <th scope="col" className="text-muted text-uppercase small fw-bold text-center py-3 border-0">Activity Score</th>
                  <th scope="col" className="text-muted text-uppercase small fw-bold text-center py-3 border-0">Status</th>
                  <th scope="col" className="text-muted text-uppercase small fw-bold text-end px-4 py-3 border-0">Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.length > 0 ? (
                  students.map((st, idx) => (
                    <tr key={idx} className="border-bottom">
                      <td className="px-4 py-3">
                        <div className="d-flex align-items-center">
                          <div className="avatar-circle me-3 bg-primary text-white fw-bold" style={{ width: 38, height: 38 }}>
                            {st.fullName?.charAt(0) || st.username?.charAt(0)}
                          </div>
                          <div>
                            <div className="fw-bold text-dark">{st.fullName || st.username}</div>
                            <div className="text-muted small">{st.email}</div>
                          </div>
                        </div>
                      </td>

                      <td className="fw-semibold text-dark small">{st.rollNumber || 'N/A'}</td>

                      <td>
                        <div className="d-flex flex-column">
                          <span className="fw-semibold text-dark small">{st.department || 'N/A'}</span>
                          <span className="text-muted" style={{ fontSize: '0.75rem' }}>Year {st.year || '?'} • Sec {st.section || 'A'}</span>
                        </div>
                      </td>

                      <td>
                        {st.githubLinked ? (
                          <div className="d-flex align-items-center text-dark small fw-bold">
                            <FaGithub className="me-2 fs-5" /> @{st.githubUsername}
                          </div>
                        ) : (
                          <span className="badge bg-light text-muted border px-2 py-1 small">Not Connected</span>
                        )}
                      </td>

                      <td className="text-center">
                        <span className="fw-bold text-primary fs-6">{st.stats?.contributionScore || 0}</span>
                        <div className="text-muted" style={{ fontSize: '0.7rem' }}>{st.stats?.level || 'Bronze'} Tier</div>
                      </td>

                      <td className="text-center">
                        <span className={`badge px-3 py-2 rounded-pill fw-bold ${st.status === 'deactivated' ? 'bg-danger' : 'bg-success'}`}>
                          {st.status === 'deactivated' ? 'Deactivated' : 'Active'}
                        </span>
                      </td>

                      <td className="text-end px-4">
                        <div className="d-flex justify-content-end gap-2">
                          <button 
                            className="btn btn-sm btn-light border text-secondary d-inline-flex align-items-center justify-content-center rounded-2" 
                            style={{ width: '32px', height: '32px' }}
                            title="View Full Profile & GitHub Stats"
                            onClick={() => handleViewStudent(st)}
                          >
                            <FaEye />
                          </button>

                          <button 
                            className="btn btn-sm btn-light border text-primary d-inline-flex align-items-center justify-content-center rounded-2" 
                            style={{ width: '32px', height: '32px' }}
                            title="Edit Student Profile"
                            onClick={() => {
                              setSelectedStudent(st);
                              setEditForm({
                                fullName: st.fullName || '',
                                department: st.department || '',
                                year: st.year || '',
                                section: st.section || '',
                                rollNumber: st.rollNumber || '',
                                githubUsername: st.githubUsername || '',
                                assignedStaff: st.assignedStaff?._id || st.assignedStaff || ''
                              });
                              setActiveModal('edit');
                            }}
                          >
                            <FaEdit />
                          </button>

                          <button 
                            className="btn btn-sm btn-light border text-warning d-inline-flex align-items-center justify-content-center rounded-2" 
                            style={{ width: '32px', height: '32px' }}
                            title="Reset Password"
                            onClick={() => { setSelectedStudent(st); setActiveModal('resetPwd'); }}
                          >
                            <FaKey />
                          </button>

                          <button 
                            className={`btn btn-sm btn-light border ${st.status === 'deactivated' ? 'text-success' : 'text-warning'} d-inline-flex align-items-center justify-content-center rounded-2`}
                            style={{ width: '32px', height: '32px' }}
                            title={st.status === 'deactivated' ? 'Activate Student' : 'Deactivate Student'}
                            onClick={() => handleToggleStatus(st)}
                          >
                            {st.status === 'deactivated' ? <FaCheckCircle /> : <FaBan />}
                          </button>

                          <button 
                            className="btn btn-sm btn-light border text-danger d-inline-flex align-items-center justify-content-center rounded-2" 
                            style={{ width: '32px', height: '32px' }}
                            title="Delete Student Account"
                            onClick={() => { setSelectedStudent(st); setActiveModal('delete'); }}
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center py-5 text-muted">No student accounts found matching your filters.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ==========================================
          MODALS & DRAWERS
      ========================================== */}

      {activeModal && <div className="modal-backdrop fade show" style={{ zIndex: 1040, background: 'rgba(0,0,0,0.5)' }}></div>}

      {/* 1. View Full Student Telemetry Drawer Modal */}
      {activeModal === 'view' && selectedStudent && (
        <div className="modal d-block" tabIndex="-1" style={{ zIndex: 1050, marginTop: '3vh' }}>
          <div className="modal-dialog modal-dialog-centered modal-xl">
            <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '1rem' }}>
              <div className="modal-header border-0 pb-0">
                <div className="d-flex align-items-center">
                  <div className="avatar-circle me-3 bg-primary text-white fs-4 fw-bold" style={{ width: 48, height: 48 }}>
                    {selectedStudent.fullName?.charAt(0) || selectedStudent.username?.charAt(0)}
                  </div>
                  <div>
                    <h5 className="modal-title fw-bold">{selectedStudent.fullName || selectedStudent.username}</h5>
                    <p className="text-muted small mb-0">{selectedStudent.email} • Roll No: {selectedStudent.rollNumber}</p>
                  </div>
                </div>
                <button type="button" className="btn-close" onClick={() => setActiveModal(null)}></button>
              </div>

              <div className="modal-body p-4">
                <div className="row g-4">
                  {/* Academic & Staff Info Card */}
                  <div className="col-12 col-md-4">
                    <div className="saas-card mb-3">
                      <h6 className="fw-bold mb-3 border-bottom pb-2">Academic Profile</h6>
                      <div className="mb-2">
                        <span className="text-muted small fw-bold">DEPARTMENT: </span>
                        <span className="fw-semibold text-dark">{selectedStudent.department || 'N/A'}</span>
                      </div>
                      <div className="mb-2">
                        <span className="text-muted small fw-bold">YEAR & SECTION: </span>
                        <span className="fw-semibold text-dark">Year {selectedStudent.year} - Sec {selectedStudent.section}</span>
                      </div>
                      <div className="mb-2">
                        <span className="text-muted small fw-bold">ASSIGNED MENTOR: </span>
                        <span className="fw-semibold text-primary">{selectedStudent.assignedStaff?.fullName || 'Unassigned'}</span>
                      </div>
                    </div>

                    <div className="saas-card">
                      <h6 className="fw-bold mb-3 border-bottom pb-2">GitHub Overview</h6>
                      <div className="mb-2">
                        <span className="text-muted small fw-bold">GITHUB ID: </span>
                        <span className="fw-semibold text-dark">@{selectedStudent.githubUsername || 'Not Connected'}</span>
                      </div>
                      <div className="mb-2">
                        <span className="text-muted small fw-bold">ACTIVITY SCORE: </span>
                        <span className="fw-bold text-primary">{studentDetails?.stats?.contributionScore || 0} pts</span>
                      </div>
                      <div className="mb-2">
                        <span className="text-muted small fw-bold">TIER LEVEL: </span>
                        <span className="badge bg-warning text-dark fw-bold">{studentDetails?.stats?.level || 'Bronze'}</span>
                      </div>
                    </div>
                  </div>

                  {/* GitHub Statistics Metrics */}
                  <div className="col-12 col-md-8">
                    <div className="row g-3 mb-4">
                      {[
                        { label: 'Repositories', value: studentDetails?.stats?.totalRepositories || 0, icon: FaBook, color: 'secondary' },
                        { label: 'Total Commits', value: studentDetails?.stats?.totalCommits || 0, icon: FaCodeBranch, color: 'primary' },
                        { label: 'Merged PRs', value: studentDetails?.stats?.mergedPullRequests || 0, icon: FaCheckCircle, color: 'success' },
                        { label: 'Stars Earned', value: studentDetails?.stats?.totalStars || 0, icon: FaStar, color: 'warning' }
                      ].map((item, i) => (
                        <div key={i} className="col-6 col-sm-3">
                          <div className="saas-card p-3 text-center">
                            <item.icon className="fs-4 mb-2 text-primary" />
                            <p className="text-muted small fw-bold text-uppercase mb-1" style={{ fontSize: '0.65rem' }}>{item.label}</p>
                            <h4 className="fw-bold mb-0">{item.value}</h4>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Repositories List */}
                    <div className="saas-card">
                      <h6 className="fw-bold mb-3 border-bottom pb-2">Public Repositories ({studentDetails?.stats?.repositoriesList?.length || 0})</h6>
                      <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                        {studentDetails?.stats?.repositoriesList?.length > 0 ? (
                          studentDetails.stats.repositoriesList.map((repo, i) => (
                            <div key={i} className="d-flex justify-content-between align-items-center p-2 border-bottom">
                              <div>
                                <a href={repo.url} target="_blank" rel="noreferrer" className="fw-bold text-primary text-decoration-none small">
                                  {repo.name}
                                </a>
                                <div className="text-muted small" style={{ fontSize: '0.75rem' }}>{repo.description || 'No description'}</div>
                              </div>
                              <span className="badge bg-light text-dark border">{repo.primaryLanguage || 'Code'}</span>
                            </div>
                          ))
                        ) : (
                          <div className="text-center text-muted py-3">No repositories synced yet.</div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="d-flex justify-content-end gap-2 mt-4 pt-3 border-top">
                  <button type="button" className="btn btn-light fw-bold" onClick={() => setActiveModal(null)}>Close</button>
                  {selectedStudent.githubUsername && (
                    <a 
                      href={`https://github.com/${selectedStudent.githubUsername}`} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="btn btn-dark fw-bold d-flex align-items-center"
                    >
                      <FaGithub className="me-2" /> View Full GitHub Profile &rarr;
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Edit Student Modal */}
      {activeModal === 'edit' && selectedStudent && (
        <div className="modal d-block" tabIndex="-1" style={{ zIndex: 1050, marginTop: '5vh' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '1rem' }}>
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold">Edit Student Information</h5>
                <button type="button" className="btn-close" onClick={() => setActiveModal(null)}></button>
              </div>
              <div className="modal-body p-4">
                <form onSubmit={handleEditStudent}>
                  <div className="row g-3 mb-3">
                    <div className="col-12 col-md-6">
                      <label className="form-label text-muted small fw-bold">FULL NAME</label>
                      <input 
                        type="text" 
                        className="form-control bg-light border-0 py-2" 
                        value={editForm.fullName}
                        onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                      />
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label text-muted small fw-bold">ROLL NUMBER</label>
                      <input 
                        type="text" 
                        className="form-control bg-light border-0 py-2" 
                        value={editForm.rollNumber}
                        onChange={(e) => setEditForm({ ...editForm, rollNumber: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="row g-3 mb-3">
                    <div className="col-12 col-md-4">
                      <label className="form-label text-muted small fw-bold">DEPARTMENT</label>
                      <input 
                        type="text" 
                        className="form-control bg-light border-0 py-2" 
                        value={editForm.department}
                        onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
                      />
                    </div>
                    <div className="col-12 col-md-4">
                      <label className="form-label text-muted small fw-bold">YEAR</label>
                      <input 
                        type="text" 
                        className="form-control bg-light border-0 py-2" 
                        value={editForm.year}
                        onChange={(e) => setEditForm({ ...editForm, year: e.target.value })}
                      />
                    </div>
                    <div className="col-12 col-md-4">
                      <label className="form-label text-muted small fw-bold">SECTION</label>
                      <input 
                        type="text" 
                        className="form-control bg-light border-0 py-2" 
                        value={editForm.section}
                        onChange={(e) => setEditForm({ ...editForm, section: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="row g-3 mb-4">
                    <div className="col-12 col-md-6">
                      <label className="form-label text-muted small fw-bold">GITHUB USERNAME</label>
                      <input 
                        type="text" 
                        className="form-control bg-light border-0 py-2" 
                        value={editForm.githubUsername}
                        onChange={(e) => setEditForm({ ...editForm, githubUsername: e.target.value })}
                      />
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label text-muted small fw-bold">ASSIGNED STAFF MENTOR</label>
                      <select 
                        className="form-select bg-light border-0 py-2"
                        value={editForm.assignedStaff}
                        onChange={(e) => setEditForm({ ...editForm, assignedStaff: e.target.value })}
                      >
                        <option value="">Unassigned</option>
                        {staffList.map(st => (
                          <option key={st._id} value={st._id}>{st.fullName || st.username} ({st.department})</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="d-flex justify-content-end gap-2">
                    <button type="button" className="btn btn-light fw-bold" onClick={() => setActiveModal(null)}>Cancel</button>
                    <button type="submit" className="btn btn-primary fw-bold">Save Student Profile</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. Reset Password Modal */}
      {activeModal === 'resetPwd' && selectedStudent && (
        <div className="modal d-block" tabIndex="-1" style={{ zIndex: 1050, marginTop: '10vh' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '1rem' }}>
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold">Reset Student Password</h5>
                <button type="button" className="btn-close" onClick={() => setActiveModal(null)}></button>
              </div>
              <div className="modal-body p-4">
                <p className="text-muted small mb-3">
                  Set a new password for student <strong>{selectedStudent.fullName || selectedStudent.username}</strong> ({selectedStudent.email}).
                </p>
                <form onSubmit={handleResetPassword}>
                  <div className="mb-4">
                    <label className="form-label text-muted small fw-bold">NEW PASSWORD</label>
                    <input 
                      type="password" 
                      className="form-control bg-light border-0 py-2" 
                      required
                      minLength="6"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                  </div>
                  <div className="d-flex justify-content-end gap-2">
                    <button type="button" className="btn btn-light fw-bold" onClick={() => setActiveModal(null)}>Cancel</button>
                    <button type="submit" className="btn btn-warning fw-bold text-dark">Reset Password</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. Delete Student Modal */}
      {activeModal === 'delete' && selectedStudent && (
        <div className="modal d-block" tabIndex="-1" style={{ zIndex: 1050, marginTop: '10vh' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg border-top border-danger border-4" style={{ borderRadius: '1rem' }}>
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold text-danger"><FaExclamationTriangle className="me-2" /> Permanent Account Deletion</h5>
                <button type="button" className="btn-close" onClick={() => setActiveModal(null)}></button>
              </div>
              <div className="modal-body p-4">
                <p className="text-muted small mb-4">
                  Are you sure you want to permanently delete student account <strong>{selectedStudent.fullName || selectedStudent.username}</strong>? All associated GitHub activity stats and records will be deleted.
                </p>
                <div className="d-flex justify-content-end gap-2">
                  <button type="button" className="btn btn-light fw-bold" onClick={() => setActiveModal(null)}>Cancel</button>
                  <button type="button" className="btn btn-danger fw-bold" onClick={handleDeleteStudent}>Delete Student Permanently</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default StudentManagement;
