import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaCog, FaShieldAlt, FaGithub, FaSlidersH, FaSave, FaCheckCircle } from 'react-icons/fa';
import '../../styles/dashboard.css';

const AdminSettings = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Form states
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');

  // Scoring rules state
  const [commitPoints, setCommitPoints] = useState(1);
  const [prPoints, setPrPoints] = useState(5);
  const [mergedPrPoints, setMergedPrPoints] = useState(7);
  const [issuePoints, setIssuePoints] = useState(2);
  const [reviewPoints, setReviewPoints] = useState(3);
  const [inactivityThresholdDays, setInactivityThresholdDays] = useState(14);

  const [msg, setMsg] = useState({ text: '', type: '' });

  const token = JSON.parse(localStorage.getItem('userInfo'))?.token;

  const fetchSettings = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const res = await axios.get('/api/admin/settings', config);
      setData(res.data);
      if (res.data?.adminProfile) {
        setFullName(res.data.adminProfile.fullName || '');
        setEmail(res.data.adminProfile.email || '');
      }
      if (res.data?.settings) {
        setCommitPoints(res.data.settings.commitPoints || 1);
        setPrPoints(res.data.settings.prPoints || 5);
        setMergedPrPoints(res.data.settings.mergedPrPoints || 7);
        setIssuePoints(res.data.settings.issuePoints || 2);
        setReviewPoints(res.data.settings.reviewPoints || 3);
        setInactivityThresholdDays(res.data.settings.inactivityThresholdDays || 14);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      setMsg({ text: 'Failed to fetch system settings.', type: 'danger' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, [token]);

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setMsg({ text: 'Saving settings...', type: 'info' });
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.put('/api/admin/settings', {
        fullName,
        email,
        commitPoints: Number(commitPoints),
        prPoints: Number(prPoints),
        mergedPrPoints: Number(mergedPrPoints),
        issuePoints: Number(issuePoints),
        reviewPoints: Number(reviewPoints),
        inactivityThresholdDays: Number(inactivityThresholdDays)
      }, config);

      setMsg({ text: 'System settings & scoring rules updated successfully!', type: 'success' });
      fetchSettings();
    } catch (error) {
      setMsg({ text: error.response?.data?.message || 'Error saving settings', type: 'danger' });
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5 min-vh-50">
        <div className="spinner-border text-primary" role="status"></div>
        <span className="text-muted ms-2">Loading System Configuration...</span>
      </div>
    );
  }

  return (
    <div className="container-fluid px-0">
      {/* Header Banner */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 pb-2 border-bottom">
        <div>
          <h2 className="fw-bold mb-1 d-flex align-items-center">
            <FaCog className="me-2 text-primary" /> Admin & System Settings
          </h2>
          <p className="text-muted mb-0">Configure scoring rules, inactivity thresholds, OAuth integration status, and admin credentials.</p>
        </div>
      </div>

      {msg.text && (
        <div className={`alert alert-${msg.type} alert-dismissible fade show mb-4`} role="alert">
          {msg.text}
          <button type="button" className="btn-close" onClick={() => setMsg({ text: '', type: '' })}></button>
        </div>
      )}

      <form onSubmit={handleSaveSettings}>
        <div className="row g-4">
          {/* Admin Profile Settings */}
          <div className="col-12 col-lg-6">
            <div className="saas-card h-100">
              <h5 className="fw-bold mb-3 border-bottom pb-2 d-flex align-items-center">
                <FaShieldAlt className="me-2 text-dark" /> Admin Profile
              </h5>

              <div className="mb-3">
                <label className="form-label text-muted small fw-bold">ADMIN FULL NAME</label>
                <input 
                  type="text" 
                  className="form-control bg-light border-0 py-2"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>

              <div className="mb-3">
                <label className="form-label text-muted small fw-bold">ADMIN EMAIL ADDRESS</label>
                <input 
                  type="email" 
                  className="form-control bg-light border-0 py-2"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="mt-4 pt-3 border-top">
                <h6 className="fw-bold mb-2 d-flex align-items-center">
                  <FaGithub className="me-2" /> GitHub System OAuth Status
                </h6>
                <div className="d-flex align-items-center justify-content-between p-3 bg-light rounded-3 border">
                  <div>
                    <div className="fw-bold text-dark small">Personal Access Token / OAuth Client</div>
                    <div className="text-muted" style={{ fontSize: '0.75rem' }}>Configured via environment security variables.</div>
                  </div>
                  <span className={`badge px-3 py-2 rounded-pill fw-bold ${data?.githubConfigStatus?.hasToken ? 'bg-success' : 'bg-danger'}`}>
                    {data?.githubConfigStatus?.hasToken ? 'Active & Configured' : 'Missing Token'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Contribution Scoring & Activity Threshold Rules */}
          <div className="col-12 col-lg-6">
            <div className="saas-card h-100">
              <h5 className="fw-bold mb-3 border-bottom pb-2 d-flex align-items-center">
                <FaSlidersH className="me-2 text-primary" /> Contribution Scoring & Activity Rules
              </h5>

              <div className="row g-3 mb-3">
                <div className="col-6">
                  <label className="form-label text-muted small fw-bold">COMMIT POINTS</label>
                  <input 
                    type="number" 
                    className="form-control bg-light border-0 py-2 fw-bold text-primary"
                    value={commitPoints}
                    onChange={(e) => setCommitPoints(e.target.value)}
                  />
                </div>

                <div className="col-6">
                  <label className="form-label text-muted small fw-bold">OPEN PR POINTS</label>
                  <input 
                    type="number" 
                    className="form-control bg-light border-0 py-2 fw-bold text-primary"
                    value={prPoints}
                    onChange={(e) => setPrPoints(e.target.value)}
                  />
                </div>
              </div>

              <div className="row g-3 mb-3">
                <div className="col-6">
                  <label className="form-label text-muted small fw-bold">MERGED PR POINTS</label>
                  <input 
                    type="number" 
                    className="form-control bg-light border-0 py-2 fw-bold text-success"
                    value={mergedPrPoints}
                    onChange={(e) => setMergedPrPoints(e.target.value)}
                  />
                </div>

                <div className="col-6">
                  <label className="form-label text-muted small fw-bold">ISSUE POINTS</label>
                  <input 
                    type="number" 
                    className="form-control bg-light border-0 py-2 fw-bold text-warning"
                    value={issuePoints}
                    onChange={(e) => setIssuePoints(e.target.value)}
                  />
                </div>
              </div>

              <div className="row g-3 mb-4">
                <div className="col-6">
                  <label className="form-label text-muted small fw-bold">CODE REVIEW POINTS</label>
                  <input 
                    type="number" 
                    className="form-control bg-light border-0 py-2 fw-bold text-info"
                    value={reviewPoints}
                    onChange={(e) => setReviewPoints(e.target.value)}
                  />
                </div>

                <div className="col-6">
                  <label className="form-label text-muted small fw-bold">INACTIVITY THRESHOLD (DAYS)</label>
                  <input 
                    type="number" 
                    className="form-control bg-light border-0 py-2 fw-bold text-danger"
                    value={inactivityThresholdDays}
                    onChange={(e) => setInactivityThresholdDays(e.target.value)}
                  />
                </div>
              </div>

              <div className="text-end">
                <button type="submit" className="btn btn-primary fw-bold px-4 py-2 d-inline-flex align-items-center">
                  <FaSave className="me-2" /> Save System Settings
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AdminSettings;
