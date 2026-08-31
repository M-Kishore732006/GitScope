import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { 
  FaUserGraduate, 
  FaGithub, 
  FaCheckCircle, 
  FaExclamationTriangle, 
  FaBook, 
  FaCodeBranch, 
  FaExclamationCircle, 
  FaGlobe, 
  FaTrophy, 
  FaSync,
  FaArrowRight
} from 'react-icons/fa';

const StaffDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const token = JSON.parse(localStorage.getItem('userInfo'))?.token;

  const fetchDashboardData = async () => {
    setLoading(true);
    setError('');
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const res = await axios.get('/api/staff/dashboard', config);
      setData(res.data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to load staff dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    // eslint-disable-next-line
  }, []);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5">
        <div className="spinner-border text-primary me-2" role="status"></div>
        <span className="fw-semibold text-muted">Loading assigned student statistics...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger d-flex align-items-center shadow-sm">
        <FaExclamationTriangle className="me-2 fs-4" />
        <div>{error}</div>
      </div>
    );
  }

  const { summary, topContributors } = data || {};

  return (
    <div className="staff-dashboard">
      {/* Header Banner */}
      <div className="d-flex flex-wrap align-items-center justify-content-between mb-4 gap-3">
        <div>
          <h2 className="fw-bold text-dark mb-1">Staff Overview</h2>
          <p className="text-muted small mb-0">
            Real-time GitHub activity analytics for students assigned to your guidance.
          </p>
        </div>
        <button className="btn btn-outline-primary btn-sm d-flex align-items-center rounded-3 fw-bold shadow-sm" onClick={fetchDashboardData}>
          <FaSync className="me-2" /> Refresh Metrics
        </button>
      </div>

      {/* KPI Cards Grid (Requirement 2: 10 Cards) */}
      <div className="row g-3 mb-4">
        {/* Card 1: Total Assigned */}
        <div className="col-12 col-sm-6 col-lg-4 col-xl-2.4">
          <div className="saas-card h-100 border-start border-primary border-4">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="text-muted small fw-semibold">Assigned Students</span>
              <div className="icon-box primary">
                <FaUserGraduate />
              </div>
            </div>
            <h3 className="fw-bold text-dark mb-0">{summary?.totalAssignedStudents || 0}</h3>
            <span className="text-muted extra-small">Total guidance allocation</span>
          </div>
        </div>

        {/* Card 2: GitHub Connected */}
        <div className="col-12 col-sm-6 col-lg-4 col-xl-2.4">
          <div className="saas-card h-100 border-start border-success border-4">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="text-muted small fw-semibold">Connected</span>
              <div className="icon-box success">
                <FaGithub />
              </div>
            </div>
            <h3 className="fw-bold text-success mb-0">{summary?.connectedStudents || 0}</h3>
            <span className="text-muted extra-small">GitHub profile linked</span>
          </div>
        </div>

        {/* Card 3: GitHub Not Connected */}
        <div className="col-12 col-sm-6 col-lg-4 col-xl-2.4">
          <div className="saas-card h-100 border-start border-warning border-4">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="text-muted small fw-semibold">Not Connected</span>
              <div className="icon-box warning">
                <FaExclamationTriangle />
              </div>
            </div>
            <h3 className="fw-bold text-warning mb-0">{summary?.notConnectedStudents || 0}</h3>
            <span className="text-muted extra-small">Pending GitHub connection</span>
          </div>
        </div>

        {/* Card 4: Active Students */}
        <div className="col-12 col-sm-6 col-lg-4 col-xl-2.4">
          <div className="saas-card h-100 border-start border-info border-4">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="text-muted small fw-semibold">Active Students</span>
              <div className="icon-box secondary">
                <FaCheckCircle />
              </div>
            </div>
            <h3 className="fw-bold text-primary mb-0">{summary?.activeStudents || 0}</h3>
            <span className="text-muted extra-small">Active in last 14 days</span>
          </div>
        </div>

        {/* Card 5: Inactive Students */}
        <div className="col-12 col-sm-6 col-lg-4 col-xl-2.4">
          <div className="saas-card h-100 border-start border-danger border-4">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="text-muted small fw-semibold">Inactive Students</span>
              <div className="icon-box danger">
                <FaExclamationCircle />
              </div>
            </div>
            <h3 className="fw-bold text-danger mb-0">{summary?.inactiveStudents || 0}</h3>
            <span className="text-muted extra-small">No activity &gt; 14 days</span>
          </div>
        </div>
      </div>

      {/* Activity Aggregates Row */}
      <div className="row g-3 mb-4">
        {/* Card 6: Total Repositories */}
        <div className="col-12 col-sm-6 col-lg-3">
          <div className="saas-card d-flex align-items-center">
            <div className="icon-box primary me-3">
              <FaBook />
            </div>
            <div>
              <div className="text-muted small fw-semibold">Repositories</div>
              <h4 className="fw-bold text-dark mb-0">{summary?.totalRepositories || 0}</h4>
            </div>
          </div>
        </div>

        {/* Card 7: Total Commits */}
        <div className="col-12 col-sm-6 col-lg-3">
          <div className="saas-card d-flex align-items-center">
            <div className="icon-box success me-3">
              <FaCodeBranch />
            </div>
            <div>
              <div className="text-muted small fw-semibold">Total Commits</div>
              <h4 className="fw-bold text-dark mb-0">{summary?.totalCommits || 0}</h4>
            </div>
          </div>
        </div>

        {/* Card 8: Pull Requests */}
        <div className="col-12 col-sm-6 col-lg-3">
          <div className="saas-card d-flex align-items-center">
            <div className="icon-box secondary me-3">
              <FaCodeBranch />
            </div>
            <div>
              <div className="text-muted small fw-semibold">Pull Requests</div>
              <h4 className="fw-bold text-dark mb-0">{summary?.totalPullRequests || 0}</h4>
            </div>
          </div>
        </div>

        {/* Card 9: Issues */}
        <div className="col-12 col-sm-6 col-lg-3">
          <div className="saas-card d-flex align-items-center">
            <div className="icon-box warning me-3">
              <FaExclamationCircle />
            </div>
            <div>
              <div className="text-muted small fw-semibold">Total Issues</div>
              <h4 className="fw-bold text-dark mb-0">{summary?.totalIssues || 0}</h4>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Top Contributors & Quick Links */}
      <div className="row g-4">
        {/* Top Contributors Table */}
        <div className="col-12 col-lg-8">
          <div className="saas-card h-100">
            <div className="d-flex align-items-center justify-content-between mb-3 border-bottom pb-2">
              <div className="d-flex align-items-center">
                <FaTrophy className="text-warning fs-4 me-2" />
                <h5 className="fw-bold text-dark mb-0">Top Performing Assigned Students</h5>
              </div>
              <Link to="/staff/rankings" className="btn btn-sm btn-link text-decoration-none fw-bold">
                Full Rankings <FaArrowRight className="ms-1" />
              </Link>
            </div>

            {topContributors && topContributors.length > 0 ? (
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th style={{ width: '60px' }}>Rank</th>
                      <th>Student</th>
                      <th>GitHub</th>
                      <th>Commits</th>
                      <th>PRs</th>
                      <th>Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topContributors.map((c, idx) => (
                      <tr key={idx}>
                        <td>
                          <span className={`badge ${idx === 0 ? 'bg-warning text-dark' : idx === 1 ? 'bg-secondary' : idx === 2 ? 'bg-danger-subtle text-danger' : 'bg-light text-dark'} rounded-pill`}>
                            #{idx + 1}
                          </span>
                        </td>
                        <td>
                          <Link to={`/staff/students?search=${c.name}`} className="text-decoration-none fw-semibold text-dark">
                            {c.name}
                          </Link>
                          <div className="text-muted extra-small">{c.department}</div>
                        </td>
                        <td>
                          {c.githubUsername ? (
                            <span className="badge bg-light text-dark border">@{c.githubUsername}</span>
                          ) : (
                            <span className="text-muted small">Not Linked</span>
                          )}
                        </td>
                        <td className="fw-bold">{c.commits}</td>
                        <td className="fw-bold text-primary">{c.prs}</td>
                        <td>
                          <span className="badge bg-primary px-2 py-1">{c.score} pts</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-4 text-muted">
                No telemetry recorded for assigned students yet.
              </div>
            )}
          </div>
        </div>

        {/* Open-Source Highlight & Quick Actions */}
        <div className="col-12 col-lg-4">
          <div className="saas-card bg-gradient text-white mb-4" style={{ background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)' }}>
            <div className="d-flex align-items-center mb-3">
              <FaGlobe className="fs-2 me-3" />
              <div>
                <h6 className="fw-bold mb-0">Open-Source Highlights</h6>
                <small className="opacity-75">External Repos &amp; PR Contributions</small>
              </div>
            </div>
            <div className="display-6 fw-extrabold mb-2">{summary?.openSourceContributions || 0}</div>
            <p className="small mb-3 opacity-90">
              External Pull Requests submitted by assigned students to external repositories.
            </p>
            <Link to="/staff/open-source" className="btn btn-light text-primary btn-sm fw-bold w-100 rounded-3">
              Track Open-Source Activity
            </Link>
          </div>

          <div className="saas-card">
            <h6 className="fw-bold text-dark mb-3">Quick Navigation</h6>
            <div className="d-grid gap-2">
              <Link to="/staff/students" className="btn btn-outline-secondary btn-sm text-start py-2 px-3 rounded-3 fw-medium">
                👥 View Assigned Students List
              </Link>
              <Link to="/staff/monitoring" className="btn btn-outline-secondary btn-sm text-start py-2 px-3 rounded-3 fw-medium">
                ⚡ Check Inactive Students Threshold
              </Link>
              <Link to="/staff/reports" className="btn btn-outline-secondary btn-sm text-start py-2 px-3 rounded-3 fw-medium">
                📄 Export Activity Reports
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffDashboard;
