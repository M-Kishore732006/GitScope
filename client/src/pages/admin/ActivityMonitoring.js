import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaHeartbeat, FaExclamationTriangle, FaCheckCircle, FaUserClock, FaCog } from 'react-icons/fa';
import '../../styles/dashboard.css';

const ActivityMonitoring = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const [thresholdDays, setThresholdDays] = useState(14);
  const [levelFilter, setLevelFilter] = useState('');

  const token = JSON.parse(localStorage.getItem('userInfo'))?.token;

  const fetchMonitoring = async () => {
    setLoading(true);
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const res = await axios.get('/api/admin/monitoring', config);
      setData(res.data);
      if (res.data?.thresholdDays) setThresholdDays(res.data.thresholdDays);
    } catch (error) {
      console.error('Error fetching activity monitoring:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMonitoring();
  }, [token]);

  const students = data?.students || [];

  const filteredStudents = students.filter(s => {
    if (!levelFilter) return true;
    if (levelFilter === 'Inactive') return s.isInactive;
    return s.activityLevel === levelFilter;
  });

  return (
    <div className="container-fluid px-0">
      {/* Header Banner */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 pb-2 border-bottom">
        <div>
          <h2 className="fw-bold mb-1 d-flex align-items-center">
            <FaHeartbeat className="me-2 text-danger" /> Student Activity Monitoring & Classification
          </h2>
          <p className="text-muted mb-0">Automated activity level classification and inactive student detection for early intervention.</p>
        </div>
      </div>

      {/* Filter & Threshold Selector Bar */}
      <div className="saas-card mb-4 p-3 bg-white">
        <div className="row g-3 align-items-center">
          <div className="col-12 col-md-6">
            <label className="form-label text-muted small fw-bold mb-1">FILTER BY ACTIVITY LEVEL</label>
            <select className="form-select bg-light border-1 small" value={levelFilter} onChange={(e) => setLevelFilter(e.target.value)}>
              <option value="">All Activity Classifications</option>
              <option value="Highly Active">Highly Active (&le; 3 Days)</option>
              <option value="Active">Active (&le; 7 Days)</option>
              <option value="Moderately Active">Moderately Active (&le; 14 Days)</option>
              <option value="Low Activity">Low Activity (&le; 30 Days)</option>
              <option value="Inactive">Inactive / Flagged (&gt; 14 Days)</option>
            </select>
          </div>

          <div className="col-12 col-md-6 text-end">
            <span className="badge bg-danger px-3 py-2 fw-bold rounded-pill">
              {students.filter(s => s.isInactive).length} Inactive Students Flagged
            </span>
          </div>
        </div>
      </div>

      {/* Student Activity Monitoring Table */}
      <div className="saas-card overflow-hidden p-0 mb-4">
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-danger" role="status"></div>
            <p className="text-muted small mt-2">Computing Student Heartbeats...</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th scope="col" className="text-muted text-uppercase small fw-bold px-4 py-3 border-0">Student Name</th>
                  <th scope="col" className="text-muted text-uppercase small fw-bold py-3 border-0">Roll Number</th>
                  <th scope="col" className="text-muted text-uppercase small fw-bold py-3 border-0">Department</th>
                  <th scope="col" className="text-muted text-uppercase small fw-bold py-3 border-0">GitHub ID</th>
                  <th scope="col" className="text-muted text-uppercase small fw-bold py-3 border-0">Last Active</th>
                  <th scope="col" className="text-muted text-uppercase small fw-bold text-center py-3 border-0">Inactivity</th>
                  <th scope="col" className="text-muted text-uppercase small fw-bold text-end px-4 py-3 border-0">Activity Level</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.length > 0 ? (
                  filteredStudents.map((st, idx) => (
                    <tr key={idx} className={`border-bottom ${st.isInactive ? 'bg-light-danger' : ''}`}>
                      <td className="px-4 py-3 fw-bold text-dark">{st.name}</td>
                      <td className="fw-semibold text-dark small">{st.rollNumber}</td>
                      <td className="fw-semibold text-dark small">{st.department}</td>
                      <td className="small text-dark fw-bold">@{st.githubUsername || 'N/A'}</td>
                      
                      <td className="small text-muted">
                        {st.lastActivity ? new Date(st.lastActivity).toLocaleDateString() : 'Never'}
                      </td>

                      <td className="text-center">
                        <span className={`fw-bold ${st.isInactive ? 'text-danger' : 'text-dark'}`}>
                          {st.daysInactive === 999 ? 'Infinite' : `${st.daysInactive} Days`}
                        </span>
                      </td>

                      <td className="text-end px-4">
                        <span className={`badge px-3 py-2 rounded-pill fw-bold ${
                          st.activityLevel === 'Highly Active' ? 'bg-success' :
                          st.activityLevel === 'Active' ? 'bg-primary' :
                          st.activityLevel === 'Moderately Active' ? 'bg-info text-dark' :
                          st.activityLevel === 'Low Activity' ? 'bg-warning text-dark' : 'bg-danger'
                        }`}>
                          {st.activityLevel}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center py-5 text-muted">No students found matching level filter.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityMonitoring;
