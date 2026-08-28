import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useOutletContext } from 'react-router-dom';
import axios from 'axios';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  Legend 
} from 'recharts';
import { 
  FaUserGraduate, 
  FaUserTie, 
  FaGithub, 
  FaExclamationTriangle, 
  FaBook, 
  FaCodeBranch, 
  FaCode, 
  FaCheckCircle, 
  FaPlus, 
  FaFileDownload, 
  FaChartLine, 
  FaTrophy,
  FaShieldAlt
} from 'react-icons/fa';
import '../../styles/dashboard.css';

const COLORS = ['#6D5EF5', '#2563EB', '#16A34A', '#F59E0B', '#EF4444', '#8B5CF6'];

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user } = useOutletContext();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const token = JSON.parse(localStorage.getItem('userInfo'))?.token;

  const fetchOverview = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const res = await axios.get('/api/admin/dashboard', config);
      setData(res.data);
    } catch (err) {
      console.error('Error loading dashboard overview:', err);
      setError(err.response?.data?.message || 'Failed to load dashboard overview data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, [token]);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5 min-vh-50">
        <div className="spinner-border text-primary me-2" role="status"></div>
        <span className="fw-semibold text-muted">Loading System Intelligence...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger d-flex align-items-center rounded-3 p-3">
        <FaExclamationTriangle className="me-2 fs-4" />
        <div>{error}</div>
      </div>
    );
  }

  const { summary, charts, topContributors, recentActivity } = data || {};

  const activeInactivePie = [
    { name: 'Active Students', value: summary?.activeStudents || 0 },
    { name: 'Inactive Students', value: summary?.inactiveStudents || 0 }
  ];

  return (
    <div className="container-fluid px-0">
      {/* Hero Welcome Card */}
      <div className="saas-card mb-4 bg-white">
        <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center">
          <div>
            <div className="d-flex align-items-center gap-2 mb-1">
              <h2 className="fw-extrabold mb-0">System Control Center 👋</h2>
              <span className="badge bg-primary px-3 py-2 rounded-pill small">Admin Access</span>
            </div>
            <p className="text-muted mb-3 mb-lg-0">
              Institution-wide GitHub telemetry, student progress monitoring, and staff governance.
            </p>
          </div>

          <div className="d-flex flex-wrap gap-2">
            <Link to="/admin/staff" className="btn btn-primary fw-semibold px-3 py-2 d-flex align-items-center shadow-sm">
              <FaPlus className="me-2" /> Add Staff
            </Link>
            <Link to="/admin/students" className="btn btn-outline-primary fw-semibold px-3 py-2 d-flex align-items-center">
              <FaUserGraduate className="me-2" /> View Students
            </Link>
            <Link to="/admin/github-accounts" className="btn btn-outline-dark fw-semibold px-3 py-2 d-flex align-items-center">
              <FaGithub className="me-2" /> GitHub Accounts
            </Link>
            <Link to="/admin/reports" className="btn btn-outline-success fw-semibold px-3 py-2 d-flex align-items-center">
              <FaFileDownload className="me-2" /> Generate Report
            </Link>
          </div>
        </div>
      </div>

      {/* Summary Cards Grid (8 Cards) */}
      <div className="row g-3 mb-4">
        {[
          { label: 'Total Students', value: summary?.totalStudents, Icon: FaUserGraduate, color: 'primary' },
          { label: 'Total Staff', value: summary?.totalStaff, Icon: FaUserTie, color: 'secondary' },
          { label: 'GitHub Connected', value: summary?.connectedStudents, Icon: FaGithub, color: 'success' },
          { label: 'GitHub Pending', value: summary?.notConnectedStudents, Icon: FaExclamationTriangle, color: 'warning' },
          { label: 'Total Repositories', value: summary?.totalRepositories, Icon: FaBook, color: 'secondary' },
          { label: 'Total Commits', value: summary?.totalCommits, Icon: FaCodeBranch, color: 'primary' },
          { label: 'Merged PRs', value: summary?.totalPullRequests, Icon: FaCheckCircle, color: 'success' },
          { label: 'Total Issues', value: summary?.totalIssues, Icon: FaCode, color: 'danger' }
        ].map((card, i) => (
          <div key={i} className="col-12 col-sm-6 col-md-3">
            <div className="saas-card d-flex align-items-center p-3 h-100">
              <div className={`icon-box ${card.color} me-3`}>
                <card.Icon />
              </div>
              <div>
                <p className="text-muted small fw-semibold text-uppercase mb-1" style={{ fontSize: '0.7rem' }}>
                  {card.label}
                </p>
                <h3 className="fw-bold mb-0">{card.value || 0}</h3>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Analytics Charts Row */}
      <div className="row g-4 mb-4">
        {/* Monthly GitHub Activity Trend */}
        <div className="col-12 col-xl-8">
          <div className="saas-card h-100">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div>
                <h5 className="fw-bold mb-1 d-flex align-items-center">
                  <FaChartLine className="me-2 text-primary" /> Student GitHub Activity Trend
                </h5>
                <p className="text-muted small mb-0">Monthly aggregate commits, pull requests, and issues across all cohorts.</p>
              </div>
            </div>

            {charts?.monthlyTrends?.length > 0 ? (
              <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={charts.monthlyTrends}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                    <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                    <Line type="monotone" name="Commits" dataKey="commits" stroke="var(--primary)" strokeWidth={3} dot={{ r: 3 }} />
                    <Line type="monotone" name="Pull Requests" dataKey="prs" stroke="var(--success)" strokeWidth={3} dot={{ r: 3 }} />
                    <Line type="monotone" name="Issues" dataKey="issues" stroke="var(--danger)" strokeWidth={3} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="d-flex align-items-center justify-content-center text-muted py-5" style={{ height: '300px' }}>
                No activity trend data available yet.
              </div>
            )}
          </div>
        </div>

        {/* Active vs Inactive Pie */}
        <div className="col-12 col-xl-4">
          <div className="saas-card h-100">
            <h5 className="fw-bold mb-1">Active vs Inactive Ratio</h5>
            <p className="text-muted small mb-4">Based on GitHub sync activity within the last 14 days.</p>

            <div style={{ width: '100%', height: 240 }}>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={activeInactivePie} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={5} dataKey="value">
                    <Cell fill="#16A34A" />
                    <Cell fill="#EF4444" />
                  </Pie>
                  <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            <div className="d-flex justify-content-around mt-3 border-top pt-3 text-center">
              <div>
                <span className="text-muted small fw-bold text-uppercase">Active</span>
                <h4 className="fw-bold text-success mb-0">{summary?.activeStudents || 0}</h4>
              </div>
              <div>
                <span className="text-muted small fw-bold text-uppercase">Inactive</span>
                <h4 className="fw-bold text-danger mb-0">{summary?.inactiveStudents || 0}</h4>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Department Breakdown & Top Contributors Row */}
      <div className="row g-4 mb-4">
        {/* Department Activity */}
        <div className="col-12 col-lg-7">
          <div className="saas-card h-100">
            <h5 className="fw-bold mb-4">Department-wise GitHub Activity</h5>
            {charts?.departmentActivity?.length > 0 ? (
              <div style={{ width: '100%', height: 260 }}>
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={charts.departmentActivity}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                    <XAxis dataKey="department" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                    <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                    <Bar name="Commits" dataKey="commits" fill="var(--primary)" radius={[4, 4, 0, 0]} barSize={30} />
                    <Bar name="Pull Requests" dataKey="prs" fill="var(--success)" radius={[4, 4, 0, 0]} barSize={30} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="text-center text-muted py-5">No department data available.</div>
            )}
          </div>
        </div>

        {/* Top Contributors */}
        <div className="col-12 col-lg-5">
          <div className="saas-card h-100">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h5 className="fw-bold mb-0 d-flex align-items-center">
                <FaTrophy className="text-warning me-2" /> Top Contributors
              </h5>
              <Link to="/admin/rankings" className="text-primary-custom text-decoration-none fw-semibold small">
                Full Leaderboard &rarr;
              </Link>
            </div>

            <div className="d-flex flex-column gap-3">
              {topContributors && topContributors.length > 0 ? (
                topContributors.map((c, i) => (
                  <div key={i} className="d-flex align-items-center justify-content-between p-2 rounded-3 border bg-light">
                    <div className="d-flex align-items-center">
                      <div className="fw-bold me-3 text-muted" style={{ width: '20px' }}>#{i + 1}</div>
                      <div className="avatar-circle me-3 bg-primary text-white" style={{ width: 36, height: 36, fontSize: '0.85rem' }}>
                        {c.name.charAt(0)}
                      </div>
                      <div>
                        <div className="fw-bold text-dark small">{c.name}</div>
                        <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                          @{c.githubUsername} • {c.department || 'N/A'}
                        </div>
                      </div>
                    </div>
                    <div className="text-end">
                      <span className="badge bg-primary text-white fw-bold">{c.score} pts</span>
                      <div className="text-muted" style={{ fontSize: '0.7rem' }}>{c.commits} Commits</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-muted py-4">No top contributors found.</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Audit Log / Recent Activity Timeline Table */}
      <div className="saas-card mb-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h5 className="fw-bold mb-1">System Audit & Governance Activity</h5>
            <p className="text-muted small mb-0">Live audit events recorded by the platform engine.</p>
          </div>
          <Link to="/admin/audit-logs" className="btn btn-sm btn-outline-primary fw-semibold">
            View All Logs
          </Link>
        </div>

        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th scope="col" className="text-muted text-uppercase small fw-semibold border-0">Timestamp</th>
                <th scope="col" className="text-muted text-uppercase small fw-semibold border-0">Action</th>
                <th scope="col" className="text-muted text-uppercase small fw-semibold border-0">Target</th>
                <th scope="col" className="text-muted text-uppercase small fw-semibold border-0">Description</th>
              </tr>
            </thead>
            <tbody>
              {recentActivity && recentActivity.length > 0 ? (
                recentActivity.map((log, idx) => (
                  <tr key={idx} className="border-bottom">
                    <td className="small text-muted py-3">
                      {new Date(log.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                    </td>
                    <td>
                      <span className="badge bg-dark text-white fw-bold px-2 py-1" style={{ fontSize: '0.7rem' }}>
                        {log.action}
                      </span>
                    </td>
                    <td className="fw-semibold text-dark small">{log.target}</td>
                    <td className="text-muted small">{log.description}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="text-center py-4 text-muted">No audit activity logged yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
