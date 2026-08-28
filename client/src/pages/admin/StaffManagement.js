import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  FaUserTie, 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaKey, 
  FaUserGraduate, 
  FaSearch, 
  FaCheckCircle, 
  FaBan, 
  FaExclamationTriangle,
  FaTimes
} from 'react-icons/fa';
import '../../styles/dashboard.css';

const StaffManagement = () => {
  const [staffList, setStaffList] = useState([]);
  const [studentList, setStudentList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deptFilter, setDeptFilter] = useState('');

  // Modals state
  const [activeModal, setActiveModal] = useState(null); // 'add', 'edit', 'delete', 'resetPwd', 'assign'
  const [selectedStaff, setSelectedStaff] = useState(null);

  // Form states
  const [addForm, setAddForm] = useState({
    username: '',
    fullName: '',
    email: '',
    phoneNumber: '',
    department: '',
    rollNumber: '',
    password: ''
  });

  const [editForm, setEditForm] = useState({
    fullName: '',
    department: '',
    phoneNumber: '',
    rollNumber: ''
  });

  const [newPassword, setNewPassword] = useState('');
  const [selectedStudentIds, setSelectedStudentIds] = useState([]);

  const [msg, setMsg] = useState({ text: '', type: '' });

  const token = JSON.parse(localStorage.getItem('userInfo'))?.token;

  const fetchStaffAndStudents = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const [staffRes, studentRes] = await Promise.all([
        axios.get('/api/admin/staff', config),
        axios.get('/api/admin/students', config)
      ]);
      setStaffList(staffRes.data || []);
      setStudentList(studentRes.data || []);
    } catch (error) {
      console.error('Error fetching staff list:', error);
      setMsg({ text: 'Failed to load staff accounts.', type: 'danger' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaffAndStudents();
  }, [token]);

  // Handle Add Staff
  const handleAddStaff = async (e) => {
    e.preventDefault();
    setMsg({ text: 'Creating staff account...', type: 'info' });
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.post('/api/admin/staff', addForm, config);
      setMsg({ text: `Staff account created successfully!`, type: 'success' });
      setActiveModal(null);
      setAddForm({ username: '', fullName: '', email: '', phoneNumber: '', department: '', rollNumber: '', password: '' });
      fetchStaffAndStudents();
    } catch (error) {
      setMsg({ text: error.response?.data?.message || 'Error creating staff', type: 'danger' });
    }
  };

  // Handle Edit Staff
  const handleEditStaff = async (e) => {
    e.preventDefault();
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.put(`/api/admin/staff/${selectedStaff._id}`, editForm, config);
      setMsg({ text: 'Staff profile updated.', type: 'success' });
      setActiveModal(null);
      fetchStaffAndStudents();
    } catch (error) {
      setMsg({ text: error.response?.data?.message || 'Error updating staff', type: 'danger' });
    }
  };

  // Handle Toggle Active/Deactive Status
  const handleToggleStatus = async (staff) => {
    const nextStatus = staff.status === 'active' ? 'deactivated' : 'active';
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.put(`/api/admin/staff/${staff._id}/status`, { status: nextStatus }, config);
      fetchStaffAndStudents();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to update status');
    }
  };

  // Handle Delete Staff
  const handleDeleteStaff = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.delete(`/api/admin/staff/${selectedStaff._id}`, config);
      setMsg({ text: 'Staff account deleted permanently.', type: 'success' });
      setActiveModal(null);
      fetchStaffAndStudents();
    } catch (error) {
      setMsg({ text: error.response?.data?.message || 'Error deleting staff', type: 'danger' });
    }
  };

  // Handle Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.put(`/api/admin/staff/${selectedStaff._id}/reset-password`, { newPassword }, config);
      setMsg({ text: `Password reset successfully for ${selectedStaff.fullName}`, type: 'success' });
      setActiveModal(null);
      setNewPassword('');
    } catch (error) {
      setMsg({ text: error.response?.data?.message || 'Error resetting password', type: 'danger' });
    }
  };

  // Handle Assign Students
  const handleAssignStudents = async (e) => {
    e.preventDefault();
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.post(`/api/admin/staff/${selectedStaff._id}/assign-students`, { studentIds: selectedStudentIds }, config);
      setMsg({ text: 'Assigned students updated successfully.', type: 'success' });
      setActiveModal(null);
      fetchStaffAndStudents();
    } catch (error) {
      setMsg({ text: error.response?.data?.message || 'Error assigning students', type: 'danger' });
    }
  };

  // Filter staff list
  const filteredStaff = staffList.filter(s => {
    const matchesSearch = (s.fullName || s.username || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (s.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (s.rollNumber || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = !deptFilter || s.department === deptFilter;
    return matchesSearch && matchesDept;
  });

  return (
    <div className="container-fluid px-0">
      {/* Header Banner */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 pb-2 border-bottom">
        <div>
          <h2 className="fw-bold mb-1 d-flex align-items-center">
            <FaUserTie className="me-2 text-primary" /> Staff Management
          </h2>
          <p className="text-muted mb-0">Create staff accounts, assign students, and manage staff access permissions.</p>
        </div>
        <button 
          className="btn btn-primary fw-semibold px-4 py-2 mt-3 mt-md-0 d-flex align-items-center shadow-sm"
          onClick={() => { setActiveModal('add'); setMsg({ text: '', type: '' }); }}
        >
          <FaPlus className="me-2" /> Add Staff Member
        </button>
      </div>

      {msg.text && (
        <div className={`alert alert-${msg.type} alert-dismissible fade show mb-4`} role="alert">
          {msg.text}
          <button type="button" className="btn-close" onClick={() => setMsg({ text: '', type: '' })}></button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="saas-card mb-4 p-3 bg-white">
        <div className="row g-3 align-items-center">
          <div className="col-12 col-md-6">
            <div className="search-bar d-flex align-items-center bg-light px-3 py-2 rounded-3 border">
              <FaSearch className="text-muted me-2" />
              <input 
                type="text" 
                placeholder="Search staff by Name, Email, or ID..." 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border-0 bg-transparent flex-grow-1 outline-none small"
              />
            </div>
          </div>

          <div className="col-12 col-md-4">
            <select 
              className="form-select bg-light border-1 small" 
              value={deptFilter} 
              onChange={(e) => setDeptFilter(e.target.value)}
            >
              <option value="">All Departments</option>
              <option value="CSE">Computer Science (CSE)</option>
              <option value="AI & DS">Artificial Intelligence and Data Science (AI & DS)</option>
              <option value="IT">Information Technology (IT)</option>
              <option value="ECE">Electronics (ECE)</option>
              <option value="EEE">Electrical (EEE)</option>
              <option value="MECH">Mechanical (MECH)</option>
            </select>
          </div>

          <div className="col-12 col-md-2 text-end">
            <span className="badge bg-light text-dark border px-3 py-2 fw-semibold rounded-pill">
              Total: {filteredStaff.length} Staff
            </span>
          </div>
        </div>
      </div>

      {/* Staff Table */}
      <div className="saas-card overflow-hidden p-0 mb-4">
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status"></div>
            <p className="text-muted small mt-2">Loading Staff Roster...</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th scope="col" className="text-muted text-uppercase small fw-bold px-4 py-3 border-0">Staff Member</th>
                  <th scope="col" className="text-muted text-uppercase small fw-bold py-3 border-0">Staff ID</th>
                  <th scope="col" className="text-muted text-uppercase small fw-bold py-3 border-0">Department</th>
                  <th scope="col" className="text-muted text-uppercase small fw-bold text-center py-3 border-0">Assigned Students</th>
                  <th scope="col" className="text-muted text-uppercase small fw-bold text-center py-3 border-0">Status</th>
                  <th scope="col" className="text-muted text-uppercase small fw-bold text-end px-4 py-3 border-0">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStaff.length > 0 ? (
                  filteredStaff.map((staff, idx) => (
                    <tr key={idx} className="border-bottom">
                      <td className="px-4 py-3">
                        <div className="d-flex align-items-center">
                          <div className="avatar-circle me-3 bg-secondary text-white fw-bold" style={{ width: 38, height: 38 }}>
                            {staff.fullName?.charAt(0) || staff.username?.charAt(0)}
                          </div>
                          <div>
                            <div className="fw-bold text-dark">{staff.fullName || staff.username}</div>
                            <div className="text-muted small">{staff.email}</div>
                          </div>
                        </div>
                      </td>

                      <td className="fw-semibold text-dark small">{staff.rollNumber || 'STAFF-01'}</td>
                      
                      <td>
                        <span className="badge bg-light text-dark border px-3 py-2 fw-medium rounded-pill">
                          {staff.department || 'General'}
                        </span>
                      </td>

                      <td className="text-center">
                        <button 
                          className="btn btn-sm btn-outline-primary fw-semibold rounded-pill px-3"
                          onClick={() => {
                            setSelectedStaff(staff);
                            setSelectedStudentIds((staff.assignedStudents || []).map(s => s._id || s));
                            setActiveModal('assign');
                          }}
                        >
                          <FaUserGraduate className="me-1" /> {staff.assignedStudents?.length || 0} Students
                        </button>
                      </td>

                      <td className="text-center">
                        <span className={`badge px-3 py-2 rounded-pill fw-bold ${staff.status === 'deactivated' ? 'bg-danger' : 'bg-success'}`}>
                          {staff.status === 'deactivated' ? 'Deactivated' : 'Active'}
                        </span>
                      </td>

                      <td className="text-end px-4">
                        <div className="d-flex justify-content-end gap-2">
                          <button 
                            className="btn btn-sm btn-light border text-primary" 
                            title="Edit Staff"
                            onClick={() => {
                              setSelectedStaff(staff);
                              setEditForm({
                                fullName: staff.fullName || '',
                                department: staff.department || '',
                                phoneNumber: staff.phoneNumber || '',
                                rollNumber: staff.rollNumber || ''
                              });
                              setActiveModal('edit');
                            }}
                          >
                            <FaEdit />
                          </button>

                          <button 
                            className="btn btn-sm btn-light border text-warning" 
                            title="Reset Password"
                            onClick={() => { setSelectedStaff(staff); setActiveModal('resetPwd'); }}
                          >
                            <FaKey />
                          </button>

                          <button 
                            className={`btn btn-sm ${staff.status === 'deactivated' ? 'btn-outline-success' : 'btn-outline-warning'}`}
                            title={staff.status === 'deactivated' ? 'Activate Staff' : 'Deactivate Staff'}
                            onClick={() => handleToggleStatus(staff)}
                          >
                            {staff.status === 'deactivated' ? <FaCheckCircle /> : <FaBan />}
                          </button>

                          <button 
                            className="btn btn-sm btn-outline-danger" 
                            title="Delete Staff"
                            onClick={() => { setSelectedStaff(staff); setActiveModal('delete'); }}
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center py-5 text-muted">No staff members found matching your search criteria.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ==========================================
          MODALS
      ========================================== */}

      {activeModal && <div className="modal-backdrop fade show" style={{ zIndex: 1040, background: 'rgba(0,0,0,0.5)' }}></div>}

      {/* 1. Add Staff Modal */}
      {activeModal === 'add' && (
        <div className="modal d-block" tabIndex="-1" style={{ zIndex: 1050, marginTop: '5vh' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '1rem' }}>
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold">Create New Staff Account</h5>
                <button type="button" className="btn-close" onClick={() => setActiveModal(null)}></button>
              </div>
              <div className="modal-body p-4">
                <form onSubmit={handleAddStaff}>
                  <div className="row g-3 mb-3">
                    <div className="col-12 col-md-6">
                      <label className="form-label text-muted small fw-bold">USERNAME *</label>
                      <input 
                        type="text" 
                        className="form-control bg-light border-0 py-2" 
                        required
                        value={addForm.username}
                        onChange={(e) => setAddForm({ ...addForm, username: e.target.value })}
                      />
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label text-muted small fw-bold">FULL NAME *</label>
                      <input 
                        type="text" 
                        className="form-control bg-light border-0 py-2" 
                        required
                        value={addForm.fullName}
                        onChange={(e) => setAddForm({ ...addForm, fullName: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="row g-3 mb-3">
                    <div className="col-12 col-md-6">
                      <label className="form-label text-muted small fw-bold">EMAIL ADDRESS *</label>
                      <input 
                        type="email" 
                        className="form-control bg-light border-0 py-2" 
                        required
                        value={addForm.email}
                        onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                      />
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label text-muted small fw-bold">DEPARTMENT *</label>
                      <select 
                        className="form-select bg-light border-0 py-2" 
                        required
                        value={addForm.department}
                        onChange={(e) => setAddForm({ ...addForm, department: e.target.value })}
                      >
                        <option value="">Select Department</option>
                        <option value="CSE">Computer Science (CSE)</option>
                        <option value="AI & DS">Artificial Intelligence and Data Science (AI & DS)</option>
                        <option value="IT">Information Technology (IT)</option>
                        <option value="ECE">Electronics (ECE)</option>
                        <option value="EEE">Electrical (EEE)</option>
                        <option value="MECH">Mechanical (MECH)</option>
                      </select>
                    </div>
                  </div>

                  <div className="row g-3 mb-4">
                    <div className="col-12 col-md-6">
                      <label className="form-label text-muted small fw-bold">STAFF / EMPLOYEE ID</label>
                      <input 
                        type="text" 
                        className="form-control bg-light border-0 py-2" 
                        placeholder="e.g. STF-102"
                        value={addForm.rollNumber}
                        onChange={(e) => setAddForm({ ...addForm, rollNumber: e.target.value })}
                      />
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label text-muted small fw-bold">INITIAL PASSWORD *</label>
                      <input 
                        type="password" 
                        className="form-control bg-light border-0 py-2" 
                        required
                        minLength="6"
                        value={addForm.password}
                        onChange={(e) => setAddForm({ ...addForm, password: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="d-flex justify-content-end gap-2">
                    <button type="button" className="btn btn-light fw-bold" onClick={() => setActiveModal(null)}>Cancel</button>
                    <button type="submit" className="btn btn-primary fw-bold px-4">Create Account</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Edit Staff Modal */}
      {activeModal === 'edit' && selectedStaff && (
        <div className="modal d-block" tabIndex="-1" style={{ zIndex: 1050, marginTop: '10vh' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '1rem' }}>
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold">Edit Staff Profile</h5>
                <button type="button" className="btn-close" onClick={() => setActiveModal(null)}></button>
              </div>
              <div className="modal-body p-4">
                <form onSubmit={handleEditStaff}>
                  <div className="mb-3">
                    <label className="form-label text-muted small fw-bold">FULL NAME</label>
                    <input 
                      type="text" 
                      className="form-control bg-light border-0 py-2" 
                      value={editForm.fullName}
                      onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label text-muted small fw-bold">DEPARTMENT</label>
                    <input 
                      type="text" 
                      className="form-control bg-light border-0 py-2" 
                      value={editForm.department}
                      onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
                    />
                  </div>

                  <div className="mb-4">
                    <label className="form-label text-muted small fw-bold">STAFF ID</label>
                    <input 
                      type="text" 
                      className="form-control bg-light border-0 py-2" 
                      value={editForm.rollNumber}
                      onChange={(e) => setEditForm({ ...editForm, rollNumber: e.target.value })}
                    />
                  </div>

                  <div className="d-flex justify-content-end gap-2">
                    <button type="button" className="btn btn-light fw-bold" onClick={() => setActiveModal(null)}>Cancel</button>
                    <button type="submit" className="btn btn-primary fw-bold">Save Changes</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. Assign Students Modal */}
      {activeModal === 'assign' && selectedStaff && (
        <div className="modal d-block" tabIndex="-1" style={{ zIndex: 1050, marginTop: '5vh' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '1rem' }}>
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold">Assign Students to {selectedStaff.fullName}</h5>
                <button type="button" className="btn-close" onClick={() => setActiveModal(null)}></button>
              </div>
              <div className="modal-body p-4">
                <p className="text-muted small mb-3">
                  Select students to assign to this staff member for monitoring and review.
                </p>

                <div className="mb-3 border rounded p-3 bg-light" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                  {studentList.length > 0 ? (
                    studentList.map(st => {
                      const isChecked = selectedStudentIds.includes(st._id);
                      return (
                        <div key={st._id} className="form-check d-flex align-items-center justify-content-between p-2 border-bottom">
                          <div>
                            <input 
                              type="checkbox" 
                              className="form-check-input me-3" 
                              id={`st-${st._id}`}
                              checked={isChecked}
                              onChange={(e) => {
                                if (e.target.checked) setSelectedStudentIds([...selectedStudentIds, st._id]);
                                else setSelectedStudentIds(selectedStudentIds.filter(id => id !== st._id));
                              }}
                            />
                            <label className="form-check-label fw-bold text-dark" htmlFor={`st-${st._id}`}>
                              {st.fullName || st.username}
                            </label>
                            <div className="text-muted small ms-4">
                              {st.rollNumber} • {st.department} (Year {st.year})
                            </div>
                          </div>
                          <span className="badge bg-white text-dark border">{st.department}</span>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center text-muted py-3">No students available.</div>
                  )}
                </div>

                <div className="d-flex justify-content-between align-items-center">
                  <span className="text-muted small fw-bold">{selectedStudentIds.length} Students Selected</span>
                  <div className="d-flex gap-2">
                    <button type="button" className="btn btn-light fw-bold" onClick={() => setActiveModal(null)}>Cancel</button>
                    <button type="button" className="btn btn-primary fw-bold" onClick={handleAssignStudents}>Save Assignment</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. Reset Password Modal */}
      {activeModal === 'resetPwd' && selectedStaff && (
        <div className="modal d-block" tabIndex="-1" style={{ zIndex: 1050, marginTop: '10vh' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '1rem' }}>
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold">Reset Staff Password</h5>
                <button type="button" className="btn-close" onClick={() => setActiveModal(null)}></button>
              </div>
              <div className="modal-body p-4">
                <p className="text-muted small mb-3">
                  Set a new temporary password for <strong>{selectedStaff.fullName}</strong> ({selectedStaff.email}).
                </p>
                <form onSubmit={handleResetPassword}>
                  <div className="mb-4">
                    <label className="form-label text-muted small fw-bold">NEW TEMPORARY PASSWORD</label>
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
                    <button type="submit" className="btn btn-warning fw-bold text-dark">Confirm Reset</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. Delete Staff Modal */}
      {activeModal === 'delete' && selectedStaff && (
        <div className="modal d-block" tabIndex="-1" style={{ zIndex: 1050, marginTop: '10vh' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg border-top border-danger border-4" style={{ borderRadius: '1rem' }}>
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold text-danger"><FaExclamationTriangle className="me-2" /> Delete Staff Account</h5>
                <button type="button" className="btn-close" onClick={() => setActiveModal(null)}></button>
              </div>
              <div className="modal-body p-4">
                <p className="text-muted small mb-4">
                  Are you sure you want to permanently delete staff member <strong>{selectedStaff.fullName}</strong>? Assigned students will be unassigned automatically.
                </p>
                <div className="d-flex justify-content-end gap-2">
                  <button type="button" className="btn btn-light fw-bold" onClick={() => setActiveModal(null)}>Cancel</button>
                  <button type="button" className="btn btn-danger fw-bold" onClick={handleDeleteStaff}>Delete Permanently</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default StaffManagement;
