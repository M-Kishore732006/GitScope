import React, { useState, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { 
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip as RechartsTooltip, PieChart, Pie, Cell, Legend 
} from 'recharts';
import { 
  FaChartLine, FaCodeBranch, FaGithub, FaBook, FaCheckCircle, 
  FaExclamationCircle, FaFire, FaCalendarAlt, FaFilter, FaSyncAlt 
} from 'react-icons/fa';
import ActivityTimeline from '../components/dashboard/ActivityTimeline';
import '../styles/dashboard.css';

const COLORS = ['#6D5EF5', '#2563EB', '#16A34A', '#F59E0B', '#EF4444', '#8B5CF6'];

const ContributionHeatmap = ({ calendar }) => {
  if (!calendar || calendar.length === 0) return <div className="text-muted text-center py-5">No contribution calendar data recorded.</div>;

  const getColor = (count) => {
    if (count === 0) return '#E5E7EB';
    if (count <= 2) return 'rgba(109, 94, 245, 0.4)';
    if (count <= 5) return 'rgba(109, 94, 245, 0.6)';
    if (count <= 10) return 'rgba(109, 94, 245, 0.8)';
    return '#6D5EF5';
  };

  const weeks = [];
  for (let i = 0; i < calendar.length; i += 7) {
    weeks.push(calendar.slice(i, i + 7));
  }

  return (
    <div className="d-flex justify-content-center" style={{ overflowX: 'auto', gap: '4px', paddingBottom: '10px' }}>
      {weeks.map((week, wIdx) => (
        <div key={wIdx} className="d-flex flex-column" style={{ gap: '4px' }}>
          {week.map((day, dIdx) => (
            <div
              key={dIdx}
              title={`${new Date(day.date).toDateString()}: ${day.count} contributions`}
              style={{
                width: '14px',
                height: '14px',
                backgroundColor: getColor(day.count),
                borderRadius: '3px',
                cursor: 'pointer'
              }}
            ></div>
          ))}
        </div>
      ))}
    </div>
  );
};

const StudentContributions = () => {
  const { stats, fetchDashboardData } = useOutletContext();
  const [refreshing, setRefreshing] = useState(false);
  const [activityFilter, setActivityFilter] = useState('ALL'); // ALL, PushEvent, PullRequestEvent, IssuesEvent

  const monthlyCommits = useMemo(() => {
    if (!stats?.contributionCalendar) return [];
    const monthly = {};
    stats.contributionCalendar.forEach(day => {
      const d = new Date(day.date);
      const key = d.toLocaleString('default', { month: 'short', year: '2-digit' });
      monthly[key] = (monthly[key] || 0) + day.count;
    });
    return Object.keys(monthly).map(k => ({ month: k, commits: monthly[k] }));
  }, [stats?.contributionCalendar]);

  const filteredActivity = useMemo(() => {
    if (!stats?.recentActivity) return [];
    if (activityFilter === 'ALL') return stats.recentActivity;
    return stats.recentActivity.filter(a => a.type === activityFilter);
  }, [stats?.recentActivity, activityFilter]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchDashboardData();
    } catch (e) {
      console.error(e);
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <main className="p-4 p-md-5">
      <div className="container-fluid max-w-7xl mx-auto">
        
        {/* Title Header */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
          <div>
            <h2 className="fw-bold mb-1 d-flex align-items-center gap-2">
              <FaChartLine className="text-primary" /> Contributions & Activity
            </h2>
            <p className="text-muted mb-0">Detailed breakdown of your commits, pull requests, issue contributions, and streak history.</p>
          </div>
          <button 
            className="btn btn-outline-primary d-flex align-items-center gap-2 fw-semibold"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <FaSyncAlt className={refreshing ? 'fa-spin' : ''} />
            {refreshing ? 'Refreshing...' : 'Refresh Activity'}
          </button>
        </div>

        {/* Stats Metrics Cards */}
        <div className="row g-4 mb-4">
          <div className="col-12 col-sm-6 col-xl-3">
            <div className="saas-card d-flex align-items-center">
              <div className="icon-box me-3 bg-primary bg-opacity-10 text-primary">
                <FaCodeBranch />
              </div>
              <div>
                <p className="text-muted small fw-semibold text-uppercase mb-1">Total Commits</p>
                <h3 className="fw-bold mb-0">{stats?.totalCommits || 0}</h3>
              </div>
            </div>
          </div>

          <div className="col-12 col-sm-6 col-xl-3">
            <div className="saas-card d-flex align-items-center">
              <div className="icon-box me-3 bg-success bg-opacity-10 text-success">
                <FaCheckCircle />
              </div>
              <div>
                <p className="text-muted small fw-semibold text-uppercase mb-1">Merged PRs</p>
                <h3 className="fw-bold mb-0">{stats?.mergedPullRequests || 0} <span className="fs-6 text-muted font-normal">/ {stats?.totalPullRequests || 0} Total</span></h3>
              </div>
            </div>
          </div>

          <div className="col-12 col-sm-6 col-xl-3">
            <div className="saas-card d-flex align-items-center">
              <div className="icon-box me-3 bg-danger bg-opacity-10 text-danger">
                <FaBook />
              </div>
              <div>
                <p className="text-muted small fw-semibold text-uppercase mb-1">Issues Contributed</p>
                <h3 className="fw-bold mb-0">{stats?.totalIssues || 0}</h3>
              </div>
            </div>
          </div>

          <div className="col-12 col-sm-6 col-xl-3">
            <div className="saas-card d-flex align-items-center">
              <div className="icon-box me-3 bg-warning bg-opacity-10 text-warning">
                <FaFire />
              </div>
              <div>
                <p className="text-muted small fw-semibold text-uppercase mb-1">Current Streak</p>
                <h3 className="fw-bold mb-0">{stats?.contributionStreak || 0} <span className="fs-6 text-muted">days</span></h3>
              </div>
            </div>
          </div>
        </div>

        {/* Heatmap Section */}
        <div className="saas-card mb-4">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h5 className="fw-bold mb-1 d-flex align-items-center gap-2">
                <FaCalendarAlt className="text-primary" /> Annual Contribution Grid
              </h5>
              <p className="text-muted small mb-0">Daily commit and activity intensity calendar across past months.</p>
            </div>
            <span className="badge bg-primary bg-opacity-10 text-primary px-3 py-2 rounded-pill fw-semibold">
              Score: {stats?.contributionScore || 0} PTS
            </span>
          </div>
          <ContributionHeatmap calendar={stats?.contributionCalendar} />
        </div>

        {/* Charts Row */}
        <div className="row g-4 mb-4">
          <div className="col-12 col-lg-7">
            <div className="saas-card h-100">
              <h5 className="fw-bold mb-4">Monthly Commit Trend</h5>
              {monthlyCommits.length > 0 ? (
                <div style={{ height: '260px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={monthlyCommits}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3}/>
                      <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fontSize: 12}} />
                      <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12}} />
                      <RechartsTooltip cursor={{fill: '#f8f9fa'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'}}/>
                      <Line type="monotone" dataKey="commits" stroke="var(--primary)" strokeWidth={3} dot={{r: 4}} activeDot={{r: 6}} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="d-flex align-items-center justify-content-center text-muted py-5">
                  No monthly commit trends recorded yet.
                </div>
              )}
            </div>
          </div>

          <div className="col-12 col-lg-5">
            <div className="saas-card h-100">
              <h5 className="fw-bold mb-4">Language Usage Breakdown</h5>
              {stats?.languageUsage?.length > 0 ? (
                <div style={{ height: '260px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={stats.languageUsage} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={4} dataKey="count" nameKey="language">
                        {stats.languageUsage.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'}}/>
                      <Legend iconType="circle" wrapperStyle={{fontSize: '12px'}}/>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="d-flex align-items-center justify-content-center text-muted py-5">
                  No language data available.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Activity Timeline & External Contributions */}
        <div className="row g-4 mb-5">
          <div className="col-12 col-lg-7">
            <div className="saas-card">
              <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center mb-4 gap-2">
                <h5 className="fw-bold mb-0">Detailed Activity Feed</h5>
                <div className="d-flex align-items-center gap-1">
                  <span className="small text-muted me-1 fw-bold"><FaFilter /> Filter:</span>
                  {['ALL', 'PushEvent', 'PullRequestEvent', 'IssuesEvent'].map((type, i) => (
                    <button 
                      key={i}
                      className={`btn btn-xs btn-sm ${activityFilter === type ? 'btn-primary' : 'btn-light border'}`}
                      onClick={() => setActivityFilter(type)}
                    >
                      {type === 'ALL' ? 'All' : type === 'PushEvent' ? 'Commits' : type === 'PullRequestEvent' ? 'PRs' : 'Issues'}
                    </button>
                  ))}
                </div>
              </div>

              <ActivityTimeline recentActivity={filteredActivity} />
            </div>
          </div>

          <div className="col-12 col-lg-5">
            <div className="saas-card h-100">
              <h5 className="fw-bold mb-4 d-flex align-items-center gap-2">
                <FaGithub className="text-dark" /> Open Source & External PRs
              </h5>
              
              {stats?.externalContributions?.length > 0 ? (
                <div className="d-flex flex-column gap-3" style={{ maxHeight: '450px', overflowY: 'auto' }}>
                  {stats.externalContributions.map((item, idx) => (
                    <div key={idx} className="p-3 border rounded-3 bg-light d-flex flex-column gap-1">
                      <div className="d-flex justify-content-between align-items-start">
                        <span className="fw-bold text-dark text-truncate" style={{ maxWidth: '75%' }}>
                          {item.title || item.repoName}
                        </span>
                        <span className={`badge ${item.isMerged ? 'bg-success' : 'bg-warning text-dark'} rounded-pill`}>
                          {item.isMerged ? 'Merged' : 'Open'}
                        </span>
                      </div>
                      <p className="text-muted small mb-1">{item.repoOwner}/{item.repoName}</p>
                      {item.url && (
                        <a href={item.url} target="_blank" rel="noopener noreferrer" className="small text-primary text-decoration-none fw-semibold">
                          View Pull Request &rarr;
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-5 text-muted">
                  <FaExclamationCircle className="fs-2 opacity-50 mb-2" />
                  <p className="small mb-0">No external open-source PRs detected yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </main>
  );
};

export default StudentContributions;
