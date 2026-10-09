import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  FaExclamationTriangle, 
  FaHeartbeat, 
  FaSearch, 
  FaFilter, 
  FaBell, 
  FaCheckCircle, 
  FaExclamationCircle, 
  FaUserGraduate, 
  FaDownload,
  FaComments,
  FaEye,
  FaSync,
  FaTimes,
  FaGithub,
  FaInfoCircle
} from 'react-icons/fa';
import StaffStudentProfileModal from './StaffStudentProfileModal';
import { toTitleCase } from '../../utils/formatters';

const StaffAtRiskAnalytics = () => {
  const navigate = useNavigate();

  const [students, setStudents] = useState([]);
  const [summary, setSummary] = useState({
    totalStudents: 0,
    highRiskCount: 0,
    modRiskCount: 0,
    healthyCount: 0,
    notConnectedCount: 0
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filterRisk, setFilterRisk] = useState('ALL'); // ALL, HIGH, MODERATE, HEALTHY, NOT_CONNECTED
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMsg, setToastMsg] = useState('');

  // Modals state
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [warningTargetStudent, setWarningTargetStudent] = useState(null);
  const [warningNoticeTitle, setWarningNoticeTitle] = useState('');
  const [warningNoticeMessage, setWarningNoticeMessage] = useState('');
  const [sendingWarning, setSendingWarning] = useState(false);

  const userInfo = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('userInfo') || '{}');
    } catch {
      return {};
    }
  }, []);

  const token = userInfo?.token;
  const staffName = userInfo?.fullName || userInfo?.username || 'Faculty Mentor';

  // Fetch At-Risk Analytics from Backend
  const fetchAtRiskData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const res = await axios.get('/api/staff/at-risk', config);

      if (res.data) {
        setStudents(res.data.students || []);
        if (res.data.summary) {
          setSummary(res.data.summary);
        }
      }
    } catch (err) {
      console.warn('Backend at-risk route fallback, attempting /api/staff/students:', err);
      // Fallback to /api/staff/students with client-side enrichment if route is offline
      try {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const res = await axios.get('/api/staff/students', config);
        const now = new Date();

        const enriched = (res.data || []).map(st => {
          const isConnected = Boolean(st.githubLinked && st.githubUsername && st.githubUsername !== 'Not Connected');
          const lastActivity = st.lastGithubActivity ? new Date(st.lastGithubActivity) : null;
          let daysInactive = 0;

          if (!isConnected) {
            daysInactive = 999;
          } else if (lastActivity) {
            daysInactive = Math.max(0, Math.floor((now - lastActivity) / (1000 * 60 * 60 * 24)));
          } else {
            daysInactive = (st.totalCommits || 0) > 0 ? 8 : 28;
          }

          const riskFactors = [];
          let riskLevel = 'HEALTHY';

          if (!isConnected) {
            riskLevel = 'HIGH';
            riskFactors.push('GitHub account not linked');
          } else {
            if (daysInactive >= 14) {
              riskLevel = 'HIGH';
              riskFactors.push(`Inactive for ${daysInactive} days (14+ day limit)`);
            } else if (daysInactive >= 7) {
              riskLevel = 'MODERATE';
              riskFactors.push(`No commits in ${daysInactive} days`);
            }

            if ((st.totalCommits || 0) === 0) {
              riskLevel = 'HIGH';
              riskFactors.push('Zero recorded commits');
            } else if ((st.totalCommits || 0) < 5 && daysInactive >= 5) {
              if (riskLevel !== 'HIGH') riskLevel = 'MODERATE';
              riskFactors.push(`Low commit volume (${st.totalCommits} commits)`);
            }
          }

          if (riskFactors.length === 0) {
            riskFactors.push('Normal lab progression');
          }

          return {
            _id: st._id,
            fullName: st.fullName || st.username,
            username: st.username,
            email: st.email,
            rollNumber: st.rollNumber || 'N/A',
            department: st.department || 'CSE',
            year: st.year || '3rd',
            section: st.section || 'A',
            githubUsername: st.githubUsername || '',
            githubLinked: isConnected,
            totalCommits: st.totalCommits || 0,
            totalPRs: st.totalPRs || 0,
            totalIssues: st.totalIssues || 0,
            lastActivityDate: lastActivity,
            daysInactive: daysInactive === 999 ? 'N/A' : daysInactive,
            daysInactiveNum: daysInactive,
            riskLevel,
            riskFactors,
            lastWarningSentAt: null,
            lastWarningTitle: null
          };
        });

        const high = enriched.filter(s => s.riskLevel === 'HIGH').length;
        const mod = enriched.filter(s => s.riskLevel === 'MODERATE').length;
        const healthy = enriched.filter(s => s.riskLevel === 'HEALTHY').length;
        const unlinked = enriched.filter(s => !s.githubLinked).length;

        setStudents(enriched);
        setSummary({
          totalStudents: enriched.length,
          highRiskCount: high,
          modRiskCount: mod,
          healthyCount: healthy,
          notConnectedCount: unlinked
        });
      } catch (fallbackErr) {
        console.error('Failed to load students for at-risk telemetry:', fallbackErr);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token]);

  useEffect(() => {
    fetchAtRiskData();
  }, [fetchAtRiskData]);

  // Open Warning Notice Modal
  const handleOpenWarningModal = (student) => {
    setWarningTargetStudent(student);
    setWarningNoticeTitle('⚠️ Academic Early Warning Notice: Lab GitHub Inactivity');
    const daysText = student.daysInactive !== 'N/A' ? `${student.daysInactive} days` : 'several days';
    setWarningNoticeMessage(
      `Dear ${toTitleCase(student.fullName)},\n\n` +
      `Your GitHub lab activity has been recorded as inactive for ${daysText}. ` +
      `Regular code commits and repository progression are essential requirements of your continuous laboratory coursework evaluation.\n\n` +
      `Please push your latest lab commits and verify your repository status before the upcoming evaluation review.\n\n` +
      `Regards,\n${staffName}`
    );
  };

  // Dispatch Warning Notice
  const handleDispatchWarning = async (e) => {
    e.preventDefault();
    if (!warningTargetStudent?._id) return;

    setSendingWarning(true);
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.post(
        '/api/staff/at-risk/warning',
        {
          studentId: warningTargetStudent._id,
          title: warningNoticeTitle,
          message: warningNoticeMessage
        },
        config
      );

      // Record dispatch time locally
      setStudents(prev => prev.map(s => 
        s._id === warningTargetStudent._id 
          ? { ...s, lastWarningSentAt: new Date(), lastWarningTitle: warningNoticeTitle } 
          : s
      ));

      setToastMsg(`Early warning notice successfully dispatched to ${warningTargetStudent.fullName}`);
      setTimeout(() => setToastMsg(''), 5000);
      setWarningTargetStudent(null);
    } catch (err) {
      console.error('Failed to dispatch warning notice:', err);
      alert(err.response?.data?.message || 'Failed to dispatch early warning notice.');
    } finally {
      setSendingWarning(false);
    }
  };

  // CSV Export
  const handleExportCSV = () => {
    if (!filteredStudents.length) return;
    const headers = ['Full Name', 'Roll Number', 'Department', 'Year', 'Section', 'GitHub Username', 'Risk Level', 'Days Inactive', 'Total Commits', 'Total PRs', 'Risk Factors', 'Last Notice Sent'];
    
    const rows = filteredStudents.map(s => [
      `"${s.fullName || ''}"`,
      `"${s.rollNumber || ''}"`,
      `"${s.department || ''}"`,
      `"${s.year || ''}"`,
      `"${s.section || ''}"`,
      `"${s.githubUsername || 'Not Connected'}"`,
      `"${s.riskLevel}"`,
      `"${s.daysInactive}"`,
      s.totalCommits || 0,
      s.totalPRs || 0,
      `"${(s.riskFactors || []).join('; ')}"`,
      `"${s.lastWarningSentAt ? new Date(s.lastWarningSentAt).toLocaleDateString() : 'None'}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `gitscope_at_risk_students_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtered Students
  const filteredStudents = useMemo(() => {
    return students.filter(st => {
      // Risk Tier Filter
      if (filterRisk === 'HIGH' && st.riskLevel !== 'HIGH') return false;
      if (filterRisk === 'MODERATE' && st.riskLevel !== 'MODERATE') return false;
      if (filterRisk === 'HEALTHY' && st.riskLevel !== 'HEALTHY') return false;
      if (filterRisk === 'NOT_CONNECTED' && st.githubLinked) return false;

      // Search Query
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        (st.fullName || '').toLowerCase().includes(q) ||
        (st.rollNumber || '').toLowerCase().includes(q) ||
        (st.department || '').toLowerCase().includes(q) ||
        (st.githubUsername || '').toLowerCase().includes(q)
      );
    });
  }, [students, filterRisk, searchQuery]);

  return (
    <div className="container-fluid py-4">
      {/* Toast Alert Feedback */}
      {toastMsg && (
        <div className="alert alert-success alert-dismissible fade show shadow-sm mb-4 d-flex align-items-center gap-2" role="alert">
          <FaCheckCircle className="text-success fs-5 flex-shrink-0" />
          <div className="flex-grow-1 small fw-medium">{toastMsg}</div>
          <button type="button" className="btn-close" onClick={() => setToastMsg('')} aria-label="Close"></button>
        </div>
      )}

      {/* Header Banner */}
      <div className="d-flex align-items-center justify-content-between flex-wrap mb-4 gap-3">
        <div>
          <div className="d-flex align-items-center gap-2 mb-2">
            <span className="badge bg-danger-subtle text-danger border border-danger-subtle px-3 py-1 rounded-pill fw-bold text-uppercase">
              Proactive Faculty Intervention
            </span>
            <span className="badge bg-light text-muted border px-2 py-1 rounded-pill small">
              Real-time Inactivity Tracker
            </span>
          </div>
          <h2 className="fw-extrabold text-main mb-1 d-flex align-items-center gap-2">
            <FaExclamationTriangle className="text-danger" /> Early Warning & At-Risk Analytics
          </h2>
          <p className="text-muted mb-0">
            Identify inactive students, monitor GitHub commit drop-offs, and dispatch official early academic warning notices.
          </p>
        </div>

        <div className="d-flex align-items-center gap-2">
          <button
            onClick={() => fetchAtRiskData(true)}
            disabled={refreshing || loading}
            className="btn btn-outline-secondary rounded-pill px-3 d-flex align-items-center gap-2 small fw-semibold shadow-sm"
            title="Refresh analytics data"
          >
            <FaSync className={refreshing ? 'fa-spin' : ''} />
            <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
          </button>

          <button
            onClick={handleExportCSV}
            disabled={loading || students.length === 0}
            className="btn btn-primary rounded-pill px-3 d-flex align-items-center gap-2 small fw-semibold shadow-sm"
            title="Export filtered records to CSV"
          >
            <FaDownload />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* Summary Metric Cards */}
      <div className="row g-3 mb-4">
        {/* Total Assigned */}
        <div className="col-12 col-sm-6 col-xl">
          <div className="saas-card h-100">
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <span className="text-muted extra-small fw-semibold text-uppercase">Assigned Students</span>
                <h3 className="fw-bold text-main mb-0">{summary.totalStudents}</h3>
                <span className="text-muted extra-small">Total mentee cohort</span>
              </div>
              <div className="icon-box primary">
                <FaUserGraduate />
              </div>
            </div>
          </div>
        </div>

        {/* High Risk */}
        <div className="col-12 col-sm-6 col-xl">
          <div className="saas-card h-100">
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <span className="text-danger extra-small fw-bold text-uppercase">High Risk (14+ Days)</span>
                <h3 className="fw-bold text-danger mb-0">{summary.highRiskCount}</h3>
                <span className="text-danger extra-small">Critical attention required</span>
              </div>
              <div className="icon-box danger">
                <FaExclamationCircle />
              </div>
            </div>
          </div>
        </div>

        {/* Moderate Risk */}
        <div className="col-12 col-sm-6 col-xl">
          <div className="saas-card h-100">
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <span className="text-warning extra-small fw-bold text-uppercase">Moderate Risk (7-13 Days)</span>
                <h3 className="fw-bold text-warning mb-0">{summary.modRiskCount}</h3>
                <span className="text-warning extra-small">Approaching threshold</span>
              </div>
              <div className="icon-box warning">
                <FaExclamationTriangle />
              </div>
            </div>
          </div>
        </div>

        {/* Healthy Activity */}
        <div className="col-12 col-sm-6 col-xl">
          <div className="saas-card h-100">
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <span className="text-success extra-small fw-bold text-uppercase">Healthy Activity</span>
                <h3 className="fw-bold text-success mb-0">{summary.healthyCount}</h3>
                <span className="text-success extra-small">Consistent lab commits</span>
              </div>
              <div className="icon-box success">
                <FaHeartbeat />
              </div>
            </div>
          </div>
        </div>

        {/* Missing GitHub Link */}
        <div className="col-12 col-sm-6 col-xl">
          <div className="saas-card h-100">
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <span className="text-muted extra-small fw-semibold text-uppercase">GitHub Unlinked</span>
                <h3 className="fw-bold text-main mb-0">{summary.notConnectedCount}</h3>
                <span className="text-muted extra-small">No account integrated</span>
              </div>
              <div className="icon-box secondary">
                <FaGithub />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="saas-card mb-4 p-3">
        <div className="row g-3 align-items-center">
          <div className="col-12 col-lg-5">
            <div className="search-bar">
              <FaSearch className="text-muted" />
              <input 
                type="text" 
                placeholder="Search by student name, roll number, department, or GitHub username..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button 
                  className="btn btn-sm text-muted p-0 border-0 me-2" 
                  onClick={() => setSearchQuery('')}
                  title="Clear search"
                >
                  <FaTimes />
                </button>
              )}
            </div>
          </div>

          <div className="col-12 col-lg-7 d-flex align-items-center justify-content-lg-end gap-1 flex-wrap">
            <span className="text-muted small fw-semibold me-2 d-none d-sm-inline-flex align-items-center gap-1">
              <FaFilter /> Risk Tier:
            </span>

            <button
              onClick={() => setFilterRisk('ALL')}
              className={`btn btn-sm rounded-pill px-3 ${filterRisk === 'ALL' ? 'btn-primary' : 'btn-light border text-muted'}`}
            >
              All ({students.length})
            </button>
            <button
              onClick={() => setFilterRisk('HIGH')}
              className={`btn btn-sm rounded-pill px-3 ${filterRisk === 'HIGH' ? 'btn-danger' : 'btn-light border text-danger'}`}
            >
              High Risk ({summary.highRiskCount})
            </button>
            <button
              onClick={() => setFilterRisk('MODERATE')}
              className={`btn btn-sm rounded-pill px-3 ${filterRisk === 'MODERATE' ? 'btn-warning text-dark' : 'btn-light border text-warning'}`}
            >
              Moderate ({summary.modRiskCount})
            </button>
            <button
              onClick={() => setFilterRisk('HEALTHY')}
              className={`btn btn-sm rounded-pill px-3 ${filterRisk === 'HEALTHY' ? 'btn-success' : 'btn-light border text-success'}`}
            >
              Healthy ({summary.healthyCount})
            </button>
            <button
              onClick={() => setFilterRisk('NOT_CONNECTED')}
              className={`btn btn-sm rounded-pill px-3 ${filterRisk === 'NOT_CONNECTED' ? 'btn-secondary' : 'btn-light border text-muted'}`}
            >
              Unlinked ({summary.notConnectedCount})
            </button>
          </div>
        </div>
      </div>

      {/* Main Student Telemetry Table */}
      <div className="saas-card p-0 overflow-hidden shadow-sm">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th className="ps-4">Student Info</th>
                <th>Roll No</th>
                <th>Department</th>
                <th>Commits</th>
                <th>Inactivity Duration</th>
                <th>Risk Diagnosis</th>
                <th className="text-end pe-4">Faculty Intervention</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-5">
                    <div className="spinner-border text-primary spinner-border-sm mb-2" role="status"></div>
                    <div className="text-muted small">Scanning assigned student lab telemetry...</div>
                  </td>
                </tr>
              ) : filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-5 text-muted">
                    <FaInfoCircle className="fs-3 text-muted opacity-50 mb-2" />
                    <div className="fw-semibold small">No students matched the selected filters</div>
                    <div className="extra-small text-muted">Try clearing the search query or switching to 'All' risk tier.</div>
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => {
                  const isHigh = student.riskLevel === 'HIGH';
                  const isMod = student.riskLevel === 'MODERATE';
                  const hasNotice = Boolean(student.lastWarningSentAt);

                  return (
                    <tr key={student._id}>
                      {/* Student Info */}
                      <td className="ps-4">
                        <div className="d-flex align-items-center gap-3">
                          <div 
                            className="avatar-circle"
                            style={{
                              width: '38px',
                              height: '38px',
                              fontSize: '0.9rem',
                              background: isHigh 
                                ? 'linear-gradient(135deg, #ef4444, #b91c1c)' 
                                : isMod 
                                  ? 'linear-gradient(135deg, #f59e0b, #d97706)' 
                                  : 'linear-gradient(135deg, #10b981, #059669)'
                            }}
                          >
                            {(student.fullName || 'S').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="fw-bold text-main small lh-sm">
                              {toTitleCase(student.fullName)}
                            </div>
                            <div className="extra-small text-muted">
                              {student.githubLinked && student.githubUsername ? (
                                <a 
                                  href={`https://github.com/${student.githubUsername}`} 
                                  target="_blank" 
                                  rel="noreferrer" 
                                  className="text-primary text-decoration-none d-inline-flex align-items-center gap-1"
                                >
                                  <FaGithub style={{ fontSize: '0.75rem' }} /> @{student.githubUsername}
                                </a>
                              ) : (
                                <span className="text-danger fw-semibold d-inline-flex align-items-center gap-1">
                                  <FaExclamationTriangle style={{ fontSize: '0.7rem' }} /> GitHub Not Connected
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Roll Number */}
                      <td className="small fw-semibold text-main">
                        {student.rollNumber || 'N/A'}
                      </td>

                      {/* Department & Year */}
                      <td>
                        <span className="badge bg-light text-dark border small">
                          {student.department || 'CSE'} • {student.year || '3rd'}
                        </span>
                      </td>

                      {/* Total Commits */}
                      <td>
                        <div className="fw-bold text-main small">
                          {student.totalCommits || 0}
                        </div>
                        <div className="extra-small text-muted">
                          {student.totalPRs || 0} PRs
                        </div>
                      </td>

                      {/* Inactivity Duration */}
                      <td>
                        {student.githubLinked ? (
                          <div>
                            <span className={`fw-bold small ${isHigh ? 'text-danger' : isMod ? 'text-warning' : 'text-success'}`}>
                              {student.daysInactive} Days
                            </span>
                            <div className="extra-small text-muted">
                              {student.lastActivityDate ? `Last: ${new Date(student.lastActivityDate).toLocaleDateString([], { month: 'short', day: 'numeric' })}` : 'No recent commits'}
                            </div>
                          </div>
                        ) : (
                          <span className="badge bg-danger-subtle text-danger border border-danger-subtle">
                            No telemetry
                          </span>
                        )}
                      </td>

                      {/* Risk Assessment & Diagnosis */}
                      <td style={{ maxWidth: '240px' }}>
                        <div className="mb-1">
                          <span 
                            className={`badge rounded-pill border px-2 py-1 fw-bold ${
                              isHigh 
                                ? 'bg-danger-subtle text-danger border-danger-subtle' 
                                : isMod 
                                  ? 'bg-warning-subtle text-warning border-warning-subtle' 
                                  : 'bg-success-subtle text-success border-success-subtle'
                            }`}
                            style={{ fontSize: '0.65rem' }}
                          >
                            {student.riskLevel} RISK
                          </span>
                        </div>
                        <div className="extra-small text-muted text-truncate" title={(student.riskFactors || []).join(', ')}>
                          {(student.riskFactors || []).join(' • ')}
                        </div>
                      </td>

                      {/* Faculty Action Buttons */}
                      <td className="text-end pe-4">
                        <div className="d-flex align-items-center justify-content-end gap-1">
                          {/* Send / View Notice */}
                          <button
                            onClick={() => handleOpenWarningModal(student)}
                            className={`btn btn-xs rounded-pill px-3 py-1 fw-semibold d-inline-flex align-items-center gap-1 ${
                              hasNotice 
                                ? 'btn-outline-success' 
                                : isHigh 
                                  ? 'btn-danger' 
                                  : isMod 
                                    ? 'btn-warning text-dark' 
                                    : 'btn-outline-secondary'
                            }`}
                            title={hasNotice ? `Notice sent on ${new Date(student.lastWarningSentAt).toLocaleDateString()}` : 'Dispatch early warning notification'}
                          >
                            {hasNotice ? (
                              <><FaCheckCircle style={{ fontSize: '0.7rem' }} /> Notice Sent</>
                            ) : (
                              <><FaBell style={{ fontSize: '0.7rem' }} /> Send Warning</>
                            )}
                          </button>

                          {/* Instant Chat */}
                          <button
                            onClick={() => navigate('/staff/messages')}
                            className="btn btn-xs btn-light border rounded-circle p-2 text-primary shadow-sm"
                            title="Direct Message in Chat"
                          >
                            <FaComments style={{ fontSize: '0.75rem' }} />
                          </button>

                          {/* Inspect Profile / Repositories */}
                          <button
                            onClick={() => setSelectedStudentId(student._id)}
                            className="btn btn-xs btn-light border rounded-circle p-2 text-muted shadow-sm"
                            title="Inspect Student Profile & Lab Repositories"
                          >
                            <FaEye style={{ fontSize: '0.75rem' }} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* WARNING NOTICE DISPATCH MODAL */}
      {warningTargetStudent && (
        <div 
          className="modal-backdrop-custom"
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.55)',
            zIndex: 1060,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem'
          }}
        >
          <div 
            className="saas-card bg-card shadow-lg p-4" 
            style={{ width: '100%', maxWidth: '540px', borderRadius: '16px' }}
          >
            {/* Modal Header */}
            <div className="d-flex align-items-center justify-content-between mb-3 border-bottom pb-3">
              <div className="d-flex align-items-center gap-2">
                <div className="rounded-circle bg-danger-subtle p-2 text-danger">
                  <FaExclamationTriangle />
                </div>
                <div>
                  <h5 className="fw-bold text-main mb-0">Dispatch Academic Early Warning</h5>
                  <span className="text-muted extra-small">Official Notification & Telemetry Alert</span>
                </div>
              </div>
              <button 
                type="button" 
                className="btn btn-sm btn-light border rounded-circle p-2"
                onClick={() => setWarningTargetStudent(null)}
              >
                <FaTimes />
              </button>
            </div>

            {/* Target Student Telemetry Pill */}
            <div className="p-3 bg-light rounded-3 mb-3 border">
              <div className="d-flex align-items-center justify-content-between mb-1">
                <span className="fw-bold text-main small">{toTitleCase(warningTargetStudent.fullName)}</span>
                <span className={`badge rounded-pill ${warningTargetStudent.riskLevel === 'HIGH' ? 'bg-danger' : 'bg-warning text-dark'}`}>
                  {warningTargetStudent.riskLevel} RISK
                </span>
              </div>
              <div className="extra-small text-muted d-flex gap-3">
                <span>Roll: {warningTargetStudent.rollNumber}</span>
                <span>Dept: {warningTargetStudent.department}</span>
                <span>Inactive: {warningTargetStudent.daysInactive} Days</span>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleDispatchWarning}>
              <div className="mb-3">
                <label className="form-label small fw-semibold text-main mb-1">Notice Subject</label>
                <input 
                  type="text" 
                  className="form-control form-control-sm"
                  value={warningNoticeTitle}
                  onChange={(e) => setWarningNoticeTitle(e.target.value)}
                  required
                />
              </div>

              <div className="mb-4">
                <label className="form-label small fw-semibold text-main mb-1">Official Message Body</label>
                <textarea 
                  className="form-control form-control-sm"
                  rows={6}
                  value={warningNoticeMessage}
                  onChange={(e) => setWarningNoticeMessage(e.target.value)}
                  required
                />
                <span className="extra-small text-muted mt-1 d-block">
                  This message will be dispatched directly to the student's notification center and in-app alerts.
                </span>
              </div>

              <div className="d-flex align-items-center justify-content-end gap-2 border-top pt-3">
                <button 
                  type="button" 
                  className="btn btn-sm btn-light border rounded-pill px-3"
                  onClick={() => setWarningTargetStudent(null)}
                  disabled={sendingWarning}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-sm btn-danger rounded-pill px-4 fw-semibold shadow-sm"
                  disabled={sendingWarning}
                >
                  {sendingWarning ? (
                    <span className="spinner-border spinner-border-sm me-1" role="status"></span>
                  ) : (
                    <FaBell className="me-1" />
                  )}
                  {sendingWarning ? 'Dispatching...' : 'Dispatch Warning'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* STUDENT PROFILE & LAB TELEMETRY MODAL */}
      {selectedStudentId && (
        <StaffStudentProfileModal 
          studentId={selectedStudentId} 
          onClose={() => setSelectedStudentId(null)} 
        />
      )}
    </div>
  );
};

export default StaffAtRiskAnalytics;
