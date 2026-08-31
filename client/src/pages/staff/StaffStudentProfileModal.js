import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  FaTimes, 
  FaUser, 
  FaGithub, 
  FaBook, 
  FaCodeBranch, 
  FaExclamationCircle, 
  FaExternalLinkAlt, 
  FaGlobe, 
  FaHistory, 
  FaSync,
  FaCheckCircle,
  FaStar,
  FaCode
} from 'react-icons/fa';

const StaffStudentProfileModal = ({ studentId, onClose }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [profileData, setProfileData] = useState(null);
  const [activityTimeline, setActivityTimeline] = useState([]);
  const [repos, setRepos] = useState([]);
  const [openSourceData, setOpenSourceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const token = JSON.parse(localStorage.getItem('userInfo'))?.token;

  useEffect(() => {
    const fetchAllStudentDetails = async () => {
      setLoading(true);
      setError('');
      try {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const [profileRes, activityRes, reposRes, openSourceRes] = await Promise.all([
          axios.get(`/api/staff/students/${studentId}`, config),
          axios.get(`/api/staff/students/${studentId}/activity`, config),
          axios.get(`/api/staff/students/${studentId}/repositories`, config),
          axios.get(`/api/staff/students/${studentId}/open-source`, config)
        ]);

        setProfileData(profileRes.data);
        setActivityTimeline(activityRes.data || []);
        setRepos(reposRes.data || []);
        setOpenSourceData(openSourceRes.data || {});
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.message || 'Failed to load student details');
      } finally {
        setLoading(false);
      }
    };

    if (studentId) fetchAllStudentDetails();
  }, [studentId, token]);

  const { student, stats } = profileData || {};

  return (
    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1060 }}>
      <div className="modal-dialog modal-xl modal-dialog-scrollable">
        <div className="modal-content rounded-4 border-0 shadow-lg">
          {/* Header */}
          <div className="modal-header bg-dark text-white rounded-top-4 py-3">
            <div className="d-flex align-items-center">
              <div className="avatar-circle me-3 bg-primary text-white fw-bold fs-5" style={{ width: 44, height: 44 }}>
                {student?.fullName?.charAt(0) || 'S'}
              </div>
              <div>
                <h5 className="modal-title fw-bold mb-0">{student?.fullName || student?.username}</h5>
                <small className="text-light opacity-75">
                  Roll: {student?.rollNumber} &bull; {student?.department} (Year {student?.year} - Sec {student?.section})
                </small>
              </div>
            </div>
            <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
          </div>

          {/* Navigation Tabs */}
          <div className="bg-light border-bottom px-4 pt-2">
            <ul className="nav nav-tabs border-0 gap-2">
              <li className="nav-item">
                <button className={`nav-link border-0 fw-semibold ${activeTab === 'overview' ? 'active border-bottom border-primary border-3 text-primary' : 'text-muted'}`} onClick={() => setActiveTab('overview')}>
                  <FaUser className="me-2" /> Overview
                </button>
              </li>
              <li className="nav-item">
                <button className={`nav-link border-0 fw-semibold ${activeTab === 'activity' ? 'active border-bottom border-primary border-3 text-primary' : 'text-muted'}`} onClick={() => setActiveTab('activity')}>
                  <FaHistory className="me-2" /> Activity Timeline
                </button>
              </li>
              <li className="nav-item">
                <button className={`nav-link border-0 fw-semibold ${activeTab === 'repositories' ? 'active border-bottom border-primary border-3 text-primary' : 'text-muted'}`} onClick={() => setActiveTab('repositories')}>
                  <FaBook className="me-2" /> Repositories ({repos.length})
                </button>
              </li>
              <li className="nav-item">
                <button className={`nav-link border-0 fw-semibold ${activeTab === 'opensource' ? 'active border-bottom border-primary border-3 text-primary' : 'text-muted'}`} onClick={() => setActiveTab('opensource')}>
                  <FaGlobe className="me-2" /> Open-Source Contributions
                </button>
              </li>
            </ul>
          </div>

          {/* Body */}
          <div className="modal-body p-4">
            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary me-2" role="status"></div>
                <span className="fw-semibold text-muted">Retrieving GitHub telemetry...</span>
              </div>
            ) : error ? (
              <div className="alert alert-danger">{error}</div>
            ) : (
              <>
                {/* TAB 1: OVERVIEW */}
                {activeTab === 'overview' && (
                  <div>
                    {/* Student Info Card */}
                    <div className="row g-3 mb-4">
                      <div className="col-12 col-md-6">
                        <div className="saas-card h-100">
                          <h6 className="fw-bold text-dark mb-3 border-bottom pb-2">Academic &amp; Student Information</h6>
                          <div className="row g-2 small">
                            <div className="col-5 text-muted">Student Name:</div>
                            <div className="col-7 fw-bold text-dark">{student?.fullName}</div>
                            
                            <div className="col-5 text-muted">Roll Number:</div>
                            <div className="col-7 fw-semibold">{student?.rollNumber}</div>
                            
                            <div className="col-5 text-muted">Department:</div>
                            <div className="col-7 fw-semibold">{student?.department}</div>
                            
                            <div className="col-5 text-muted">Year &amp; Section:</div>
                            <div className="col-7">Year {student?.year} - Section {student?.section}</div>
                            
                            <div className="col-5 text-muted">Email Address:</div>
                            <div className="col-7 text-truncate">{student?.email}</div>

                            <div className="col-5 text-muted">Account Status:</div>
                            <div className="col-7">
                              <span className={`badge ${student?.status === 'active' ? 'bg-success' : 'bg-danger'}`}>
                                {student?.status?.toUpperCase()}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="col-12 col-md-6">
                        <div className="saas-card h-100">
                          <h6 className="fw-bold text-dark mb-3 border-bottom pb-2">GitHub Connection Profile</h6>
                          <div className="row g-2 small">
                            <div className="col-5 text-muted">GitHub Username:</div>
                            <div className="col-7">
                              {student?.githubLinked ? (
                                <a href={`https://github.com/${student?.githubUsername}`} target="_blank" rel="noreferrer" className="fw-bold text-primary text-decoration-none">
                                  @{student?.githubUsername} <FaExternalLinkAlt className="ms-1 extra-small" />
                                </a>
                              ) : (
                                <span className="text-muted">Not Connected</span>
                              )}
                            </div>

                            <div className="col-5 text-muted">Connection Status:</div>
                            <div className="col-7">
                              {student?.githubLinked ? (
                                <span className="badge bg-success-subtle text-success border border-success-subtle">
                                  <FaCheckCircle className="me-1" /> Connected
                                </span>
                              ) : (
                                <span className="badge bg-warning-subtle text-warning border border-warning-subtle">Not Connected</span>
                              )}
                            </div>

                            <div className="col-5 text-muted">Contribution Level:</div>
                            <div className="col-7">
                              <span className="badge bg-primary px-2 py-1">{stats?.level || 'Bronze'}</span>
                            </div>

                            <div className="col-5 text-muted">Score:</div>
                            <div className="col-7 fw-extrabold text-primary">{stats?.contributionScore || 0} Points</div>

                            <div className="col-5 text-muted">Last Synced:</div>
                            <div className="col-7 text-muted">{stats?.lastUpdated ? new Date(stats.lastUpdated).toLocaleString() : 'Never'}</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Stat Metrics Grid */}
                    <div className="row g-3">
                      <div className="col-6 col-md-3">
                        <div className="saas-card text-center p-3">
                          <div className="icon-box primary mx-auto mb-2"><FaBook /></div>
                          <h4 className="fw-bold mb-0">{stats?.totalRepositories || 0}</h4>
                          <span className="text-muted extra-small">Repositories</span>
                        </div>
                      </div>

                      <div className="col-6 col-md-3">
                        <div className="saas-card text-center p-3">
                          <div className="icon-box success mx-auto mb-2"><FaCodeBranch /></div>
                          <h4 className="fw-bold mb-0">{stats?.totalCommits || 0}</h4>
                          <span className="text-muted extra-small">Commits</span>
                        </div>
                      </div>

                      <div className="col-6 col-md-3">
                        <div className="saas-card text-center p-3">
                          <div className="icon-box secondary mx-auto mb-2"><FaCodeBranch /></div>
                          <h4 className="fw-bold mb-0">{stats?.mergedPullRequests || stats?.totalPullRequests || 0}</h4>
                          <span className="text-muted extra-small">Pull Requests</span>
                        </div>
                      </div>

                      <div className="col-6 col-md-3">
                        <div className="saas-card text-center p-3">
                          <div className="icon-box warning mx-auto mb-2"><FaExclamationCircle /></div>
                          <h4 className="fw-bold mb-0">{stats?.totalIssues || 0}</h4>
                          <span className="text-muted extra-small">Issues</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 2: ACTIVITY TIMELINE */}
                {activeTab === 'activity' && (
                  <div>
                    <h6 className="fw-bold text-dark mb-3">Chronological Activity History</h6>
                    {activityTimeline.length === 0 ? (
                      <div className="text-center py-4 text-muted">No activity events recorded yet for this student.</div>
                    ) : (
                      <div className="timeline-container">
                        {activityTimeline.map((item, idx) => (
                          <div key={idx} className="timeline-item">
                            <div className="timeline-icon">
                              {item.type === 'PULL_REQUEST' ? <FaCodeBranch className="text-primary" /> : item.type === 'REPOSITORY' ? <FaBook className="text-success" /> : <FaHistory className="text-warning" />}
                            </div>
                            <div className="timeline-content">
                              <div className="d-flex justify-content-between align-items-center mb-1">
                                <span className="fw-bold text-dark small">{item.title}</span>
                                <span className="extra-small text-muted">{new Date(item.date).toLocaleDateString()}</span>
                              </div>
                              <div className="text-muted small">{item.details}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 3: REPOSITORIES */}
                {activeTab === 'repositories' && (
                  <div>
                    <h6 className="fw-bold text-dark mb-3">Repositories ({repos.length})</h6>
                    {repos.length === 0 ? (
                      <div className="text-center py-4 text-muted">No repositories found for this student.</div>
                    ) : (
                      <div className="row g-3">
                        {repos.map((repo, idx) => (
                          <div key={idx} className="col-12 col-md-6">
                            <div className="saas-card h-100">
                              <div className="d-flex justify-content-between align-items-start mb-2">
                                <h6 className="fw-bold text-dark mb-0">{repo.name}</h6>
                                <span className="badge bg-light text-dark border extra-small">{repo.visibility || 'Public'}</span>
                              </div>
                              <p className="text-muted small mb-3">{repo.description || 'No description available.'}</p>
                              <div className="d-flex align-items-center justify-content-between text-muted extra-small">
                                <div>
                                  <span className="me-3"><FaCode className="me-1" />{repo.language || 'Code'}</span>
                                  <span className="me-3"><FaStar className="text-warning me-1" />{repo.stars || 0}</span>
                                  <span><FaCodeBranch className="me-1" />{repo.forks || 0}</span>
                                </div>
                                {repo.htmlUrl && (
                                  <a href={repo.htmlUrl} target="_blank" rel="noreferrer" className="btn btn-sm btn-outline-primary extra-small py-1">
                                    GitHub <FaExternalLinkAlt className="ms-1" />
                                  </a>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 4: OPEN SOURCE */}
                {activeTab === 'opensource' && (
                  <div>
                    <div className="alert alert-info border-0 shadow-sm mb-4">
                      <strong>Open-Source Telemetry Classification:</strong> Distinguishes contributions made to external projects owned by other users or organizations versus personal student repositories.
                    </div>

                    <div className="row g-3 mb-4">
                      <div className="col-6 col-md-3">
                        <div className="saas-card text-center p-3">
                          <h4 className="fw-bold text-primary mb-0">{openSourceData?.summary?.externalProjects || 0}</h4>
                          <span className="text-muted extra-small">External Projects</span>
                        </div>
                      </div>

                      <div className="col-6 col-md-3">
                        <div className="saas-card text-center p-3">
                          <h4 className="fw-bold text-success mb-0">{openSourceData?.summary?.externalPRs || 0}</h4>
                          <span className="text-muted extra-small">External PRs</span>
                        </div>
                      </div>

                      <div className="col-6 col-md-3">
                        <div className="saas-card text-center p-3">
                          <h4 className="fw-bold text-info mb-0">{openSourceData?.summary?.mergedPRs || 0}</h4>
                          <span className="text-muted extra-small">Merged PRs</span>
                        </div>
                      </div>

                      <div className="col-6 col-md-3">
                        <div className="saas-card text-center p-3">
                          <h4 className="fw-bold text-warning mb-0">{openSourceData?.summary?.externalIssues || 0}</h4>
                          <span className="text-muted extra-small">External Issues</span>
                        </div>
                      </div>
                    </div>

                    <h6 className="fw-bold text-dark mb-3">External Contributions List</h6>
                    {!openSourceData?.contributions || openSourceData.contributions.length === 0 ? (
                      <div className="text-center py-4 text-muted">No external open-source contributions recorded yet.</div>
                    ) : (
                      <div className="table-responsive">
                        <table className="table table-hover align-middle mb-0">
                          <thead className="table-light">
                            <tr>
                              <th>External Repository</th>
                              <th>Type</th>
                              <th>Contribution Title</th>
                              <th>Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {openSourceData.contributions.map((c, idx) => (
                              <tr key={idx}>
                                <td className="fw-bold">{c.repoName}</td>
                                <td><span className="badge bg-light text-dark border">{c.type}</span></td>
                                <td className="small">{c.title}</td>
                                <td>
                                  {c.isMerged ? (
                                    <span className="badge bg-success">Merged</span>
                                  ) : (
                                    <span className="badge bg-primary">Open</span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
          <div className="modal-footer bg-light rounded-bottom-4">
            <button type="button" className="btn btn-secondary btn-sm rounded-3 fw-bold" onClick={onClose}>
              Close Window
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffStudentProfileModal;
