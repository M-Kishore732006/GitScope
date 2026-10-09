import React, { useState } from 'react';
import { FaTimes, FaUsers, FaSearch, FaCheck } from 'react-icons/fa';
import axios from 'axios';

const CreateGroupModal = ({ show, onClose, eligibleStudents, onGroupCreated, currentUserId }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedStudentIds, setSelectedStudentIds] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!show) return null;

  const filteredStudents = (eligibleStudents || []).filter(s => {
    const q = search.toLowerCase();
    return (
      (s.fullName || s.username || '').toLowerCase().includes(q) ||
      (s.rollNumber || '').toLowerCase().includes(q) ||
      (s.githubUsername || '').toLowerCase().includes(q)
    );
  });

  const toggleStudent = (id) => {
    setSelectedStudentIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedStudentIds.length === filteredStudents.length) {
      setSelectedStudentIds([]);
    } else {
      setSelectedStudentIds(filteredStudents.map(s => s._id));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please provide a group name');
      return;
    }
    if (selectedStudentIds.length === 0) {
      setError('Please select at least one student');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
      const res = await axios.post('/api/chat/conversations/group', {
        name: name.trim(),
        description: description.trim(),
        memberIds: selectedStudentIds
      }, {
        headers: { Authorization: `Bearer ${userInfo.token}` }
      });

      onGroupCreated(res.data);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create group');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="modal show d-block" 
      tabIndex="-1" 
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)', zIndex: 1060 }}
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content border-0 shadow-lg rounded-4 bg-card text-main">
          <div className="modal-header border-bottom px-4 py-3">
            <h6 className="modal-title fw-bold d-flex align-items-center gap-2">
              <FaUsers className="text-primary" /> Create New Group Chat
            </h6>
            <button type="button" className="btn-close" onClick={onClose} aria-label="Close"></button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="modal-body px-4 py-3">
              {error && (
                <div className="alert alert-danger py-2 small mb-3">
                  {error}
                </div>
              )}

              <div className="mb-3">
                <label className="form-label small fw-semibold text-muted">Group Name *</label>
                <input 
                  type="text" 
                  className="form-control form-control-sm"
                  placeholder="e.g. Web Dev Project Batch A"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={100}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label small fw-semibold text-muted">Description (Optional)</label>
                <textarea 
                  className="form-control form-control-sm"
                  placeholder="Purpose of this group discussion..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  maxLength={250}
                />
              </div>

              <div className="mb-2 d-flex align-items-center justify-content-between">
                <label className="form-label small fw-semibold text-muted mb-0">
                  Select Assigned Students ({selectedStudentIds.length} selected)
                </label>
                {filteredStudents.length > 0 && (
                  <button 
                    type="button" 
                    className="btn btn-link btn-sm p-0 text-decoration-none small"
                    onClick={handleSelectAll}
                  >
                    {selectedStudentIds.length === filteredStudents.length ? 'Deselect All' : 'Select All'}
                  </button>
                )}
              </div>

              {/* Student Search */}
              <div className="position-relative mb-2">
                <FaSearch className="position-absolute text-muted small" style={{ left: 12, top: 10 }} />
                <input 
                  type="text" 
                  className="form-control form-control-sm ps-4" 
                  placeholder="Filter students by name, ID, or GitHub..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              {/* Student Selection List */}
              <div 
                className="border rounded-3 p-2 bg-light-custom" 
                style={{ maxHeight: '180px', overflowY: 'auto' }}
              >
                {filteredStudents.length > 0 ? (
                  filteredStudents.map(student => {
                    const isSelected = selectedStudentIds.includes(student._id);
                    return (
                      <div 
                        key={student._id}
                        className={`d-flex align-items-center justify-content-between p-2 rounded-2 mb-1 cursor-pointer transition-all ${
                          isSelected ? 'bg-primary text-white' : 'hover-bg'
                        }`}
                        onClick={() => toggleStudent(student._id)}
                        style={{ cursor: 'pointer' }}
                      >
                        <div className="d-flex align-items-center gap-2">
                          <div 
                            className="avatar-circle" 
                            style={{ 
                              width: 30, 
                              height: 30, 
                              fontSize: '0.75rem',
                              backgroundColor: isSelected ? 'rgba(255, 255, 255, 0.25)' : 'var(--primary)',
                              color: '#ffffff'
                            }}
                          >
                            {(student.fullName || student.username || 'S').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="fw-semibold small lh-1">
                              {student.fullName || student.username}
                            </div>
                            <div className="small opacity-75" style={{ fontSize: '0.7rem' }}>
                              {student.rollNumber ? `ID: ${student.rollNumber}` : student.email}
                              {student.githubUsername && ` • @${student.githubUsername}`}
                            </div>
                          </div>
                        </div>

                        <div 
                          className={`rounded-circle d-flex align-items-center justify-content-center border ${
                            isSelected ? 'bg-white text-primary border-white' : 'border-secondary'
                          }`}
                          style={{ width: 20, height: 20 }}
                        >
                          {isSelected && <FaCheck style={{ fontSize: '0.65rem' }} />}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-3 text-muted small">
                    No matching assigned students found
                  </div>
                )}
              </div>
            </div>

            <div className="modal-footer border-top px-4 py-2">
              <button 
                type="button" 
                className="btn btn-sm btn-outline-secondary" 
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="btn btn-sm btn-primary fw-semibold"
                disabled={loading || selectedStudentIds.length === 0 || !name.trim()}
              >
                {loading ? 'Creating...' : 'Create Group'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateGroupModal;
