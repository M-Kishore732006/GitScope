import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaHeartbeat, FaExclamationTriangle, FaCheckCircle, FaClock } from 'react-icons/fa';

const StaffActivityMonitoring = () => {
  const [monitoredData, setMonitoredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = JSON.parse(localStorage.getItem('userInfo'))?.token;

  useEffect(() => {
    const fetchMonitoring = async () => {
      setLoading(true);
      try {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const res = await axios.get('/api/staff/monitoring', config);
        setMonitoredData(res.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchMonitoring();
  }, [token]);

  const getLevelBadge = (level) => {
    switch (level) {
      case 'Highly Active':
        return <span className="badge bg-success">Highly Active</span>;
      case 'Active':
        return <span className="badge bg-primary">Active</span>;
      case 'Moderately Active':
        return <span className="badge bg-info text-dark">Moderately Active</span>;
      case 'Low Activity':
        return <span className="badge bg-warning text-dark">Low Activity</span>;
      default:
        return <span className="badge bg-danger">Inactive</span>;
    }
  };

  return (
    <div className="staff-activity-monitoring">
      <div className="d-flex flex-wrap align-items-center justify-content-between mb-4 gap-3">
        <div>
          <h2 className="fw-bold text-dark mb-1">Student Activity Monitoring</h2>
          <p className="text-muted small mb-0">
            Real-time classification of assigned student activity levels based on recorded GitHub commits and contribution dates.
          </p>
        </div>
      </div>

      <div className="alert alert-warning border-0 shadow-sm mb-4 d-flex align-items-center">
        <FaExclamationTriangle className="fs-4 me-3 flex-shrink-0" />
        <div>
          <strong>Guidance Note:</strong> This monitoring view is designed for early intervention and support. Inactive status indicates a lack of recent GitHub commits or PRs and should prompt staff guidance rather than automatic disciplinary action.
        </div>
      </div>

      <div className="saas-card">
        <h5 className="fw-bold text-dark mb-3">Activity Status Breakdown</h5>
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary me-2" role="status"></div>
            <span className="fw-semibold text-muted">Calculating activity thresholds...</span>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Student Name</th>
                  <th>Roll No</th>
                  <th>Department</th>
                  <th>GitHub Handle</th>
                  <th>Commits</th>
                  <th>PRs</th>
                  <th>Days Since Activity</th>
                  <th>Activity Level</th>
                </tr>
              </thead>
              <tbody>
                {monitoredData.map((item, idx) => (
                  <tr key={idx}>
                    <td className="fw-bold text-dark">{item.name}</td>
                    <td className="small text-muted">{item.rollNumber}</td>
                    <td><span className="badge bg-light text-dark border">{item.department}</span></td>
                    <td>
                      {item.githubLinked ? (
                        <span className="fw-semibold text-primary">@{item.githubUsername}</span>
                      ) : (
                        <span className="text-muted small">Not Linked</span>
                      )}
                    </td>
                    <td className="fw-bold">{item.commits}</td>
                    <td className="fw-bold text-primary">{item.prs}</td>
                    <td className="small">
                      <FaClock className="me-1 text-muted" />
                      {typeof item.daysSinceActivity === 'number' ? `${item.daysSinceActivity} day(s)` : 'No Activity'}
                    </td>
                    <td>{getLevelBadge(item.activityLevel)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default StaffActivityMonitoring;
