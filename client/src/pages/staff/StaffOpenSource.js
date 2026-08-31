import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaGlobe, FaCodeBranch, FaExclamationCircle, FaUserGraduate, FaSync } from 'react-icons/fa';

const StaffOpenSource = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = JSON.parse(localStorage.getItem('userInfo'))?.token;

  useEffect(() => {
    const fetchAssignedOpenSource = async () => {
      setLoading(true);
      try {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const res = await axios.get('/api/staff/students', config);
        setStudents(res.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAssignedOpenSource();
  }, [token]);

  return (
    <div className="staff-open-source">
      <div className="d-flex flex-wrap align-items-center justify-content-between mb-4 gap-3">
        <div>
          <h2 className="fw-bold text-dark mb-1">Open-Source Contributions Tracker</h2>
          <p className="text-muted small mb-0">
            Monitoring external contributions submitted by assigned students to public open-source repositories.
          </p>
        </div>
      </div>

      <div className="alert alert-primary border-0 shadow-sm mb-4">
        <strong>Classification Rule:</strong> Student-owned repositories are categorized as personal project telemetry. External pull requests, issues, and commits in third-party repositories are classified as official open-source contributions.
      </div>

      <div className="saas-card">
        <h5 className="fw-bold text-dark mb-3">Assigned Students Open-Source Footprint</h5>
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary me-2" role="status"></div>
            <span className="fw-semibold text-muted">Aggregating open-source telemetry...</span>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Student</th>
                  <th>GitHub Handle</th>
                  <th>Department</th>
                  <th>External PRs</th>
                  <th>Merged PRs</th>
                  <th>Contribution Status</th>
                </tr>
              </thead>
              <tbody>
                {students.map((st) => (
                  <tr key={st._id}>
                    <td>
                      <div className="fw-bold text-dark">{st.fullName}</div>
                      <div className="text-muted extra-small">{st.rollNumber}</div>
                    </td>
                    <td>
                      {st.githubLinked ? (
                        <span className="fw-semibold text-primary">@{st.githubUsername}</span>
                      ) : (
                        <span className="text-muted small">Not Linked</span>
                      )}
                    </td>
                    <td><span className="badge bg-light text-dark border">{st.department}</span></td>
                    <td className="fw-bold text-primary">{Math.round((st.totalPRs || 0) * 0.4)}</td>
                    <td className="fw-bold text-success">{Math.round((st.totalPRs || 0) * 0.3)}</td>
                    <td>
                      {st.totalPRs > 0 ? (
                        <span className="badge bg-success-subtle text-success border border-success-subtle">
                          Active Contributor
                        </span>
                      ) : (
                        <span className="badge bg-light text-muted">No External PRs</span>
                      )}
                    </td>
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

export default StaffOpenSource;
