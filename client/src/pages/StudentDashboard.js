import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';
import { FaGithub, FaTrophy, FaFire, FaBook, FaCodeBranch, FaStar, FaSyncAlt } from 'react-icons/fa';

const COLORS = ['#0d6efd', '#198754', '#ffc107', '#dc3545', '#6f42c1'];

const ContributionHeatmap = ({ calendar }) => {
  if (!calendar || calendar.length === 0) return <div className="text-muted">No contribution data.</div>;

  const getColor = (count) => {
    if (count === 0) return '#ebedf0';
    if (count <= 2) return '#9be9a8';
    if (count <= 5) return '#40c463';
    if (count <= 10) return '#30a14e';
    return '#216e39';
  };

  // Group into weeks
  const weeks = [];
  for (let i = 0; i < calendar.length; i += 7) {
    weeks.push(calendar.slice(i, i + 7));
  }

  return (
    <div className="d-flex" style={{ overflowX: 'auto', gap: '4px', paddingBottom: '10px' }}>
      {weeks.map((week, wIdx) => (
        <div key={wIdx} className="d-flex flex-column" style={{ gap: '4px' }}>
          {week.map((day, dIdx) => (
            <div
              key={dIdx}
              title={`${new Date(day.date).toDateString()}: ${day.count} contributions`}
              style={{
                width: '12px',
                height: '12px',
                backgroundColor: getColor(day.count),
                borderRadius: '2px'
              }}
            ></div>
          ))}
        </div>
      ))}
    </div>
  );
};

const StudentDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const userInfoStr = localStorage.getItem('userInfo');
  const userInfo = userInfoStr ? JSON.parse(userInfoStr) : null;
  const token = userInfo?.token;

  const fetchDashboardData = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await axios.get('/api/student/dashboard', config);
      setData(response.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    // eslint-disable-next-line
  }, [token]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.post('/api/student/github/refresh', {}, config);
      await fetchDashboardData(); // Re-fetch the newly synced data
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to refresh GitHub data.');
    } finally {
      setRefreshing(false);
    }
  };

  if (loading) {
    return <div className="d-flex justify-content-center align-items-center min-vh-100">Loading Dashboard...</div>;
  }

  const { user, stats } = data || {};
  const hasGithub = user?.githubLinked;

  return (
    <div className="bg-light min-vh-100 py-5">
      <div className="container">
        
        {/* Header / Profile Card */}
        <div className="card shadow-sm border-0 mb-4 p-4">
           <div className="d-flex flex-column flex-md-row justify-content-between align-items-center">
               <div className="d-flex align-items-center mb-4 mb-md-0">
                  <div className="rounded-circle bg-primary bg-opacity-10 d-flex align-items-center justify-content-center text-primary fw-bold" style={{width: '80px', height: '80px', fontSize: '2rem'}}>
                     {user?.fullName?.charAt(0) || user?.username?.charAt(0)}
                  </div>
                  <div className="ms-4">
                     <h2 className="mb-0 fw-bold">{user?.fullName || user?.username}</h2>
                     <p className="text-muted mb-1">{user?.department} - {user?.year}</p>
                     <div className="d-flex align-items-center small text-muted">
                        <FaGithub className="me-2" />
                        <span>{hasGithub ? user.githubUsername : 'Not Linked'}</span>
                     </div>
                  </div>
               </div>
               
               <div className="d-flex align-items-center text-center">
                  <div className="me-4 px-3 d-none d-sm-block">
                     <p className="text-muted text-uppercase small fw-semibold mb-1">Rank</p>
                     <p className="display-6 fw-bold text-dark mb-0">#{stats?.overallRank > 0 ? stats.overallRank : '-'}</p>
                  </div>
                  <div className="me-4 px-3 border-start">
                     <p className="text-muted text-uppercase small fw-semibold mb-1">Score</p>
                     <p className="display-6 fw-bold text-primary mb-0">{stats?.contributionScore || 0}</p>
                  </div>
                  <div className="px-3 border-start">
                     <p className="text-muted text-uppercase small fw-semibold mb-1">Level</p>
                     <p className="display-6 fw-bold text-warning mb-0">{stats?.level || 'Bronze'}</p>
                  </div>
               </div>
           </div>
        </div>

        {!hasGithub ? (
           <div className="alert alert-warning border-start border-warning border-4 p-4 shadow-sm">
              <p className="mb-0 text-dark">Please complete your profile to link your GitHub account and see your stats.</p>
           </div>
        ) : (
          <>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h4 className="fw-bold mb-0">Overview</h4>
              <button 
                className="btn btn-primary shadow-sm d-flex align-items-center" 
                onClick={handleRefresh} 
                disabled={refreshing}
              >
                <FaSyncAlt className={`me-2 ${refreshing ? 'fa-spin' : ''}`} /> 
                {refreshing ? 'Refreshing...' : 'Refresh GitHub Data'}
              </button>
            </div>

            {/* Quick Stats Grid */}
            <div className="row g-3 mb-4">
              {[
                { label: 'Commits', value: stats?.totalCommits, icon: FaCodeBranch, color: 'text-primary' },
                { label: 'Merged PRs', value: stats?.mergedPullRequests, icon: FaGithub, color: 'text-success' },
                { label: 'Issues', value: stats?.totalIssues, icon: FaBook, color: 'text-danger' },
                { label: 'Repositories', value: stats?.totalRepositories, icon: FaBook, color: 'text-primary' },
                { label: 'Stars Earned', value: stats?.totalStars, icon: FaStar, color: 'text-warning' },
                { label: 'Streak', value: stats?.contributionStreak, icon: FaFire, color: 'text-danger' }
              ].map((stat, i) => (
                <div key={i} className="col-6 col-md-4 col-lg-2">
                   <div className="card shadow-sm border-0 h-100 text-center p-3">
                       <div className="card-body p-0 d-flex flex-column justify-content-center">
                           <stat.icon className={`display-6 mb-2 mx-auto ${stat.color}`} />
                           <h4 className="fw-bold mb-0">{stat.value || 0}</h4>
                           <small className="text-muted text-uppercase fw-semibold" style={{fontSize: '0.7rem'}}>{stat.label}</small>
                       </div>
                   </div>
                </div>
              ))}
            </div>

            {/* Heatmap Section */}
            <div className="card shadow-sm border-0 p-4 mb-4">
               <h5 className="fw-bold mb-3">Contribution Calendar</h5>
               <ContributionHeatmap calendar={stats?.contributionCalendar} />
            </div>

            {/* Charts Section */}
            <div className="row g-4 mb-4">
               
               {/* Language Pie Chart */}
               <div className="col-lg-6">
                  <div className="card shadow-sm border-0 h-100 p-4">
                     <h5 className="fw-bold mb-4">Overall Language Usage</h5>
                     {stats?.languageUsage?.length > 0 ? (
                        <div style={{ height: '300px' }}>
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={stats.languageUsage}
                                cx="50%"
                                cy="50%"
                                innerRadius={70}
                                outerRadius={90}
                                paddingAngle={5}
                                dataKey="count"
                                nameKey="language"
                              >
                                {stats.languageUsage.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                              </Pie>
                              <RechartsTooltip />
                              <Legend />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                     ) : (
                        <div className="d-flex align-items-center justify-content-center text-muted" style={{ height: '300px' }}>
                           Not enough data to display chart
                        </div>
                     )}
                  </div>
               </div>

               {/* Achievements Section */}
               <div className="col-lg-6">
                  <div className="card shadow-sm border-0 h-100 p-4">
                     <h5 className="fw-bold mb-4 d-flex align-items-center">
                         <FaTrophy className="me-2 text-warning"/> Achievements
                     </h5>
                     <div className="row g-3">
                        {stats?.achievements?.length > 0 ? (
                           stats.achievements.map((ach, i) => (
                              <div key={i} className="col-4" title={ach.description}>
                                  <div className="text-center p-3 border rounded bg-warning bg-opacity-10 border-warning border-opacity-25 h-100 d-flex flex-column justify-content-center">
                                     <FaTrophy className="mx-auto fs-3 text-warning mb-2" />
                                     <p className="small fw-bold mb-0">{ach.name}</p>
                                  </div>
                              </div>
                           ))
                        ) : (
                           <div className="col-12 py-5 text-center text-muted">
                              No achievements earned yet. Start contributing!
                           </div>
                        )}
                     </div>
                  </div>
               </div>
            </div>
            
            {/* Repositories Table */}
            <div className="card shadow-sm border-0 p-4 mb-5">
               <h5 className="fw-bold mb-4">Recent Repositories</h5>
               <div className="table-responsive">
                 <table className="table table-hover align-middle mb-0">
                   <thead className="table-light">
                     <tr>
                       <th scope="col" className="text-muted text-uppercase small fw-semibold">Repository</th>
                       <th scope="col" className="text-muted text-uppercase small fw-semibold">Language</th>
                       <th scope="col" className="text-muted text-uppercase small fw-semibold">Stars</th>
                       <th scope="col" className="text-muted text-uppercase small fw-semibold">Forks</th>
                     </tr>
                   </thead>
                   <tbody>
                      {stats?.repositoriesList?.length > 0 ? (
                         stats.repositoriesList.map((repo, idx) => (
                            <tr key={idx}>
                               <td className="fw-semibold">
                                 <a href={repo.url} target="_blank" rel="noreferrer" className="text-decoration-none text-primary fw-bold">{repo.name}</a>
                                 <br/><small className="text-muted fw-normal">{repo.description}</small>
                               </td>
                               <td><span className="badge bg-light text-dark border">{repo.primaryLanguage || 'Unknown'}</span></td>
                               <td><FaStar className="text-warning mb-1 me-1"/> {repo.stars}</td>
                               <td><FaCodeBranch className="text-secondary mb-1 me-1"/> {repo.forks}</td>
                            </tr>
                         ))
                      ) : (
                         <tr>
                            <td colSpan="4" className="text-center py-5 text-muted">No repositories synced yet.</td>
                         </tr>
                      )}
                   </tbody>
                 </table>
               </div>
            </div>
          </>
        )}

      </div>
    </div>
  );
};

export default StudentDashboard;
