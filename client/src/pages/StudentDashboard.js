import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, Link, useOutletContext } from 'react-router-dom';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend, LineChart, Line, XAxis, YAxis, CartesianGrid, AreaChart, Area, BarChart, Bar } from 'recharts';
import { FaGithub, FaTrophy, FaFire, FaBook, FaCodeBranch, FaStar, FaSyncAlt } from 'react-icons/fa';
import ActivityTimeline from '../components/dashboard/ActivityTimeline';
import '../styles/dashboard.css';

const COLORS = ['#6D5EF5', '#2563EB', '#16A34A', '#F59E0B', '#EF4444'];

const ContributionHeatmap = ({ calendar }) => {
  if (!calendar || calendar.length === 0) return <div className="text-muted text-center py-5">No contribution data.</div>;

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

const StudentDashboard = () => {
  const { user, stats, clientId, fetchDashboardData } = useOutletContext();
  const [refreshing, setRefreshing] = useState(false);
  const [showGithubWarning, setShowGithubWarning] = useState(false);

  const userInfoStr = localStorage.getItem('userInfo');
  const userInfo = userInfoStr ? JSON.parse(userInfoStr) : null;
  const token = userInfo?.token;

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.post('/api/student/github/refresh', {}, config);
      await fetchDashboardData(); 
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to refresh GitHub data.');
    } finally {
      setRefreshing(false);
    }
  };

  const handleLinkGithub = () => {
    if (!clientId) {
       alert("Error: GitHub OAuth Client ID is missing. Please configure it in your backend .env file.");
       return;
    }
    const redirectUri = encodeURIComponent(`${window.location.origin}/student/github/callback`);
    window.location.href = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=read:user,repo`;
  };

  const hasGithub = user?.githubLinked;

  const monthlyCommits = React.useMemo(() => {
    if (!stats?.contributionCalendar) return [];
    const monthly = {};
    stats.contributionCalendar.forEach(day => {
        const d = new Date(day.date);
        const key = d.toLocaleString('default', { month: 'short', year: '2-digit' });
        monthly[key] = (monthly[key] || 0) + day.count;
    });
    return Object.keys(monthly).map(k => ({ month: k, commits: monthly[k] }));
  }, [stats?.contributionCalendar]);

  const prData = [
    { name: 'Pull Requests', Total: stats?.totalPullRequests || 0, Merged: stats?.mergedPullRequests || 0 }
  ];

  const contributionBreakdown = [
    { name: 'Commits', count: stats?.totalCommits || 0 },
    { name: 'Issues', count: stats?.totalIssues || 0 },
    { name: 'PRs', count: stats?.totalPullRequests || 0 }
  ];

  const repoGrowth = React.useMemo(() => {
    if (!stats?.repositoriesList) return [];
    const sorted = [...stats.repositoriesList].filter(r => r.createdAt).sort((a,b) => new Date(a.createdAt) - new Date(b.createdAt));
    const monthlyGrowth = {};
    let currentTotal = 0;
    sorted.forEach(r => {
        currentTotal++;
        const d = new Date(r.createdAt).toLocaleString('default', { month: 'short', year: 'numeric' });
        monthlyGrowth[d] = currentTotal;
    });
    return Object.keys(monthlyGrowth).map(k => ({ date: k, repositories: monthlyGrowth[k] }));
  }, [stats?.repositoriesList]);

  return (
      <div className="container-fluid p-4 p-md-5">
         
         {/* Hero Section */}
         <div className="saas-card mb-4 bg-white">
                <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center">
                    <div>
                       <h2 className="fw-bold mb-1">Welcome back, {user?.fullName?.split(' ')[0] || user?.username} 👋</h2>
                       <p className="text-muted mb-3 mb-lg-0">Here's your open-source journey with GitScope.</p>
                       
                       {!hasGithub && (
                            <div>
                              <button 
                                 className="btn btn-primary fw-semibold px-4 mt-3 d-flex align-items-center mb-1" 
                                 onClick={() => setShowGithubWarning(v => !v)}
                              >
                                 <FaGithub className="me-2 fs-5" /> Connect with GitHub
                              </button>
                              {showGithubWarning && (
                                <div className="alert alert-warning border-warning mt-3 mb-0 p-3" style={{maxWidth: '420px'}}>
                                  <p className="fw-bold mb-2" style={{fontSize: '0.85rem'}}>⚠️ Important — Before you connect:</p>
                                  <p className="mb-3" style={{fontSize: '0.82rem'}}>
                                    GitHub will use whichever account you're <strong>currently logged into</strong> in your browser.
                                    Make sure you're signed in to your <strong>own GitHub account</strong> before continuing.
                                  </p>
                                  <div className="d-flex gap-2 flex-wrap">
                                    <a 
                                      href="https://github.com/login" 
                                      target="_blank" 
                                      rel="noreferrer"
                                      className="btn btn-sm btn-outline-dark fw-semibold"
                                    >
                                      Switch GitHub Account →
                                    </a>
                                    <button 
                                      className="btn btn-sm btn-dark fw-semibold"
                                      onClick={handleLinkGithub}
                                    >
                                      I'm signed in, Continue
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                       )}
                    </div>
                    
                    <div className="d-flex gap-4 mt-4 mt-lg-0">
                       <div className="text-center px-4 border-end">
                          <p className="text-muted small fw-bold text-uppercase mb-1">Score</p>
                          <h3 className="fw-bold text-primary mb-0">{stats?.contributionScore || 0}</h3>
                       </div>
                       <div className="text-center px-4 border-end">
                          <p className="text-muted small fw-bold text-uppercase mb-1">Rank</p>
                          <h3 className="fw-bold text-dark mb-0">#{stats?.overallRank > 0 ? stats.overallRank : '-'}</h3>
                       </div>
                       <div className="text-center px-4">
                          <p className="text-muted small fw-bold text-uppercase mb-1">Level</p>
                          <h3 className="fw-bold text-warning mb-0">{stats?.level || 'Bronze'}</h3>
                       </div>
                    </div>
                </div>
             </div>

             {/* Stat Cards Row */}
             <div className="row g-4 mb-4">
                {[
                  { label: 'Total Commits', value: stats?.totalCommits, icon: FaCodeBranch, color: 'primary' },
                  { label: 'Merged PRs', value: stats?.mergedPullRequests, icon: FaGithub, color: 'success' },
                  { label: 'Issue Contributions', value: stats?.totalIssues, icon: FaBook, color: 'danger' },
                  { label: 'Stars Earned', value: stats?.totalStars, icon: FaStar, color: 'warning' }
                ].map((stat, i) => (
                  <div key={i} className="col-12 col-sm-6 col-xl-3">
                     <div className="saas-card d-flex align-items-center">
                         <div className={`icon-box ${stat.color} me-3`}>
                             <stat.icon />
                         </div>
                         <div>
                             <p className="text-muted small fw-semibold text-uppercase mb-1">{stat.label}</p>
                             <h3 className="fw-bold mb-0">{stat.value || 0}</h3>
                         </div>
                     </div>
                  </div>
                ))}
             </div>

             <div className="row g-4 mb-4">
                <div className="col-12 col-xl-8">
                   <div className="saas-card mb-4">
                      <div className="d-flex justify-content-between align-items-center mb-4">
                         <h5 className="fw-bold mb-0">Continuous Contributions</h5>
                         <button 
                           className="btn btn-sm btn-outline-primary d-flex align-items-center" 
                           onClick={handleRefresh} 
                           disabled={refreshing}
                         >
                           <FaSyncAlt className={`me-2 ${refreshing ? 'fa-spin' : ''}`} /> 
                           Sync Data
                         </button>
                      </div>
                      <ContributionHeatmap calendar={stats?.contributionCalendar} />
                   </div>

                   <div className="row g-4">
                      <div className="col-12 col-md-6">
                         <div className="saas-card">
                            <h5 className="fw-bold mb-4">Commit History</h5>
                            {monthlyCommits.length > 0 ? (
                               <div style={{ height: '220px' }}>
                                 <ResponsiveContainer width="100%" height="100%">
                                   <LineChart data={monthlyCommits}>
                                      <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3}/>
                                      <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fontSize: 12}} />
                                      <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12}} />
                                      <RechartsTooltip cursor={{fill: '#f8f9fa'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'}}/>
                                      <Line type="monotone" dataKey="commits" stroke="var(--primary)" strokeWidth={3} dot={{r: 3}} activeDot={{r: 5}} />
                                   </LineChart>
                                 </ResponsiveContainer>
                               </div>
                            ) : (
                               <div className="d-flex align-items-center justify-content-center text-muted h-100 pb-5">No commit data</div>
                            )}
                         </div>
                      </div>

                      <div className="col-12 col-md-6">
                         <div className="saas-card">
                            <h5 className="fw-bold mb-4">Languages</h5>
                            {stats?.languageUsage?.length > 0 ? (
                               <div style={{ height: '220px' }}>
                                 <ResponsiveContainer width="100%" height="100%">
                                   <PieChart>
                                     <Pie data={stats.languageUsage} cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={5} dataKey="count" nameKey="language">
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
                               <div className="d-flex align-items-center justify-content-center text-muted h-100 pb-5">No language data</div>
                            )}
                         </div>
                      </div>
                   </div>
                </div>

                <div className="col-12 col-xl-4 d-flex flex-column">
                   <div className="flex-grow-1">
                       <ActivityTimeline recentActivity={stats?.recentActivity} />
                   </div>
                </div>
             </div>

             <div className="row g-4 mb-4">
                {/* Repositories Growth Chart */}
                <div className="col-12 col-lg-6">
                   <div className="saas-card">
                      <h5 className="fw-bold mb-4">Repository Growth</h5>
                      {repoGrowth.length > 0 ? (
                         <div style={{ height: '250px' }}>
                           <ResponsiveContainer width="100%" height="100%">
                             <AreaChart data={repoGrowth}>
                                <defs>
                                  <linearGradient id="colorRepo" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="var(--secondary)" stopOpacity={0.8}/>
                                    <stop offset="95%" stopColor="var(--secondary)" stopOpacity={0}/>
                                  </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3}/>
                                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 12}} />
                                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12}} />
                                <RechartsTooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'}}/>
                                <Area type="monotone" dataKey="repositories" stroke="var(--secondary)" fillOpacity={1} fill="url(#colorRepo)" />
                             </AreaChart>
                           </ResponsiveContainer>
                         </div>
                      ) : (
                         <div className="d-flex align-items-center justify-content-center text-muted h-100 pb-5">No repositories</div>
                      )}
                   </div>
                </div>

                {/* PR Grouped Bar Chart */}
                <div className="col-12 col-lg-6">
                   <div className="saas-card">
                      <h5 className="fw-bold mb-4">Pull Request Analytics</h5>
                      <div style={{ height: '250px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={prData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3}/>
                            <XAxis dataKey="name" axisLine={false} tickLine={false}/>
                            <YAxis axisLine={false} tickLine={false}/>
                            <RechartsTooltip cursor={{fill: '#f5f7fb'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'}}/>
                            <Legend iconType="circle" wrapperStyle={{fontSize: '12px'}} />
                            <Bar dataKey="Total" fill="var(--secondary)" radius={[4,4,0,0]} barSize={40} />
                            <Bar dataKey="Merged" fill="var(--success)" radius={[4,4,0,0]} barSize={40} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                   </div>
                </div>
             </div>
             
             <div className="row g-4 mb-4">
                {/* Achievements Section */}
                <div className="col-12">
                    <div className="saas-card">
                      <h5 className="fw-bold mb-4 d-flex align-items-center">
                          <FaTrophy className="me-2 text-warning"/> Achievements
                      </h5>
                      <div className="row g-3">
                         {stats?.achievements?.length > 0 ? (
                            stats.achievements.map((ach, i) => (
                               <div key={i} className="col-4 col-sm-3 col-md-4 col-xl-3" title={ach.description}>
                                   <div className={`achievement-badge ${ach.name ? 'unlocked' : 'locked'}`}>
                                      <FaTrophy className="mx-auto fs-3 text-warning mb-2" />
                                      <p className="small fw-bold mb-0 text-truncate">{ach.name}</p>
                                   </div>
                               </div>
                            ))
                         ) : (
                            <div className="col-12 py-5 text-center text-muted">
                               No achievements earned yet. Keep coding!
                            </div>
                         )}
                      </div>
                   </div>
                </div>
             </div>

             <div className="saas-card mb-5">
                <h5 className="fw-bold mb-4">Your Repositories</h5>
                <div className="table-responsive" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                  <table className="table table-hover align-middle mb-0">
                    <thead className="table-light">
                      <tr>
                        <th scope="col" className="text-muted text-uppercase small fw-semibold border-0 rounded-start">Project Name</th>
                        <th scope="col" className="text-muted text-uppercase small fw-semibold border-0">Primary Language</th>
                        <th scope="col" className="text-muted text-uppercase small fw-semibold border-0">Impact</th>
                        <th scope="col" className="text-muted text-uppercase small fw-semibold border-0 text-end rounded-end">Action</th>
                      </tr>
                    </thead>
                    <tbody className="border-top-0">
                       {stats?.repositoriesList?.length > 0 ? (
                          stats.repositoriesList.map((repo, idx) => (
                             <tr key={idx} className="border-bottom">
                                <td className="py-3 px-2">
                                  <Link to={`/student/repository/${repo.name}`} className="text-decoration-none fw-bold text-dark">{repo.name}</Link>
                                  <p className="text-muted small mb-0 mt-1 text-truncate" style={{maxWidth: '300px'}}>{repo.description || 'No description available'}</p>
                                </td>
                                <td>
                                   <span className="badge bg-light text-dark border px-3 py-2 fw-medium rounded-pill">
                                     {repo.primaryLanguage || 'Unknown'}
                                   </span>
                                </td>
                                <td>
                                   <div className="d-flex align-items-center gap-3">
                                      <span className="text-muted small"><FaStar className="text-warning mb-1 me-1"/> {repo.stars}</span>
                                      <span className="text-muted small"><FaCodeBranch className="text-secondary mb-1 me-1"/> {repo.forks}</span>
                                   </div>
                                </td>
                                <td className="text-end">
                                   <Link to={`/student/repository/${repo.name}`} className="text-primary-custom text-decoration-none fw-semibold small">View Stats <span aria-hidden="true">&rarr;</span></Link>
                                </td>
                             </tr>
                          ))
                       ) : (
                          <tr>
                             <td colSpan="4" className="text-center py-5 text-muted border-0">No repositories synced yet. Connect your GitHub to see them here!</td>
                          </tr>
                       )}
                    </tbody>
                  </table>
                </div>
             </div>

         </div>
  );
};

export default StudentDashboard;
