import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaCodeBranch, FaGithub, FaCheckCircle, FaExclamationCircle, FaExternalLinkAlt, FaBook } from 'react-icons/fa';
import '../../styles/dashboard.css';

const OpenSourceTracking = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const token = JSON.parse(localStorage.getItem('userInfo'))?.token;

  useEffect(() => {
    const fetchOpenSource = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const res = await axios.get('/api/admin/open-source', config);
        setData(res.data);
      } catch (error) {
        console.error('Error fetching open source data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchOpenSource();
  }, [token]);

  const totals = data?.totals || {};
  const students = data?.students || [];

  return (
    <div className="container-fluid px-0">
      {/* Header Banner */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 pb-2 border-bottom">
        <div>
          <h2 className="fw-bold mb-1 d-flex align-items-center">
            <FaCodeBranch className="me-2 text-success" /> Open-Source Contribution Tracker
          </h2>
          <p className="text-muted mb-0">Differentiate personal repositories from open-source external project pull requests & merged contributions.</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="row g-3 mb-4">
        {[
          { label: 'External Open-Source Projects', value: totals.openSourceProjects, icon: FaBook, color: 'primary' },
          { label: 'External Pull Requests Submitted', value: totals.externalPRs, icon: FaCodeBranch, color: 'secondary' },
          { label: 'Merged Open-Source PRs', value: totals.mergedPRs, icon: FaCheckCircle, color: 'success' },
          { label: 'External Issues Logged', value: totals.totalIssues, icon: FaExclamationCircle, color: 'warning' }
        ].map((item, idx) => (
          <div key={idx} className="col-12 col-sm-6 col-md-3">
            <div className="saas-card d-flex align-items-center p-3 h-100">
              <div className={`icon-box ${item.color} me-3`}>
                <item.icon />
              </div>
              <div>
                <p className="text-muted small fw-semibold text-uppercase mb-1" style={{ fontSize: '0.7rem' }}>{item.label}</p>
                <h3 className="fw-bold mb-0">{item.value || 0}</h3>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Student Open-Source Breakdown Table */}
      <div className="saas-card overflow-hidden p-0 mb-4">
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-success" role="status"></div>
            <p className="text-muted small mt-2">Analyzing Open-Source Metrics...</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th scope="col" className="text-muted text-uppercase small fw-bold px-4 py-3 border-0">Student</th>
                  <th scope="col" className="text-muted text-uppercase small fw-bold py-3 border-0">GitHub ID</th>
                  <th scope="col" className="text-muted text-uppercase small fw-bold py-3 border-0">Department</th>
                  <th scope="col" className="text-muted text-uppercase small fw-bold text-center py-3 border-0">Personal Repos</th>
                  <th scope="col" className="text-muted text-uppercase small fw-bold text-center py-3 border-0">External PRs Submitted</th>
                  <th scope="col" className="text-muted text-uppercase small fw-bold text-center py-3 border-0">Merged Open-Source PRs</th>
                  <th scope="col" className="text-muted text-uppercase small fw-bold text-end px-4 py-3 border-0">Contribution Score</th>
                </tr>
              </thead>
              <tbody>
                {students.length > 0 ? (
                  students.map((st, idx) => (
                    <tr key={idx} className="border-bottom">
                      <td className="px-4 py-3 fw-bold text-dark">{st.name}</td>

                      <td>
                        {st.githubUsername ? (
                          <a href={`https://github.com/${st.githubUsername}`} target="_blank" rel="noreferrer" className="text-dark fw-bold text-decoration-none small">
                            @{st.githubUsername} <FaExternalLinkAlt className="ms-1 text-muted" style={{ fontSize: '0.65rem' }} />
                          </a>
                        ) : 'Not Connected'}
                      </td>

                      <td className="fw-semibold text-dark small">{st.department}</td>
                      <td className="text-center fw-bold text-dark">{st.personalRepos}</td>
                      <td className="text-center fw-bold text-primary">{st.externalPRs}</td>
                      <td className="text-center fw-bold text-success">{st.mergedPRs}</td>

                      <td className="text-end px-4">
                        <span className="badge bg-primary text-white fw-bold px-3 py-2">{st.contributionScore} pts</span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center py-5 text-muted">No student open-source records found.</td>
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

export default OpenSourceTracking;
