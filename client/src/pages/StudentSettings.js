import React, { useState } from 'react';
import axios from 'axios';
import { useOutletContext } from 'react-router-dom';
import { 
  FaCog, FaUser, FaLock, FaGithub, FaBell, FaExclamationTriangle, 
  FaEye, FaEyeSlash, FaUnlink, FaSave, FaSpinner, FaCheckCircle 
} from 'react-icons/fa';
import { toTitleCase } from '../utils/formatters';
import '../styles/dashboard.css';

const StudentSettings = () => {
  const { user, fetchDashboardData } = useOutletContext();
  const [activeTab, setActiveTab] = useState('account'); // account, github, notifications, security, danger

  // Account form states
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [department, setDepartment] = useState(user?.department || '');
  const [year, setYear] = useState(user?.year || '');
  const [section, setSection] = useState(user?.section || '');
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || '');
  const [profileMsg, setProfileMsg] = useState({ text: '', type: '' });
  const [profileLoading, setProfileLoading] = useState(false);

  // Security / Password states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showCurrentPwd, setShowCurrentPwd] = useState(false);
  const [showNewPwd, setShowNewPwd] = useState(false);
  const [pwdMsg, setPwdMsg] = useState({ text: '', type: '' });
  const [pwdLoading, setPwdLoading] = useState(false);

  // Notification Preferences states
  const [notifyLeaderboard, setNotifyLeaderboard] = useState(true);
  const [notifyAchievements, setNotifyAchievements] = useState(true);
  const [notifyWeeklyDigest, setNotifyWeeklyDigest] = useState(false);
  const [notifMsg, setNotifMsg] = useState('');

  // Unsync GitHub state
  const [unsyncLoading, setUnsyncLoading] = useState(false);
  const [unsyncMsg, setUnsyncMsg] = useState({ text: '', type: '' });
  const [githubLinked, setGithubLinked] = useState(user?.githubLinked ?? false);

  // Danger Zone Account Deletion
  const [deletePassword, setDeletePassword] = useState('');
  const [showDeletePwd, setShowDeletePwd] = useState(false);
  const [deleteMsg, setDeleteMsg] = useState({ text: '', type: '' });
  const [deleteLoading, setDeleteLoading] = useState(false);

  const userInfoStr = localStorage.getItem('userInfo');
  const token = userInfoStr ? JSON.parse(userInfoStr)?.token : null;

  // Handle Profile Update
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileMsg({ text: '', type: '' });
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.put('/api/student/profile', {
        fullName, department, year, section, phoneNumber
      }, config);

      setProfileMsg({ text: 'Profile preferences saved successfully!', type: 'success' });
      await fetchDashboardData();
    } catch (err) {
      setProfileMsg({ text: err.response?.data?.message || 'Error updating profile', type: 'danger' });
    } finally {
      setProfileLoading(false);
    }
  };

  // Handle Password Change
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwdLoading(true);
    setPwdMsg({ text: '', type: '' });
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const res = await axios.put('/api/student/password', { currentPassword, newPassword }, config);
      setPwdMsg({ text: res.data.message, type: 'success' });
      setCurrentPassword('');
      setNewPassword('');
    } catch (err) {
      setPwdMsg({ text: err.response?.data?.message || 'Failed to update password', type: 'danger' });
    } finally {
      setPwdLoading(false);
    }
  };

  // Handle Notification Save
  const handleSaveNotifications = (e) => {
    e.preventDefault();
    setNotifMsg('Notification preferences updated.');
    setTimeout(() => setNotifMsg(''), 3000);
  };

  // Handle Unlink GitHub
  const handleUnlinkGithub = async () => {
    if (!window.confirm('Are you sure you want to unlink your GitHub account? All synced statistics will be removed.')) return;
    setUnsyncLoading(true);
    setUnsyncMsg({ text: '', type: '' });
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const res = await axios.post('/api/student/github/unlink', {}, config);
      setGithubLinked(false);
      setUnsyncMsg({ text: res.data.message, type: 'success' });
      await fetchDashboardData();
    } catch (err) {
      setUnsyncMsg({ text: err.response?.data?.message || 'Error unlinking GitHub', type: 'danger' });
    } finally {
      setUnsyncLoading(false);
    }
  };

  // Handle Account Deletion
  const handleDeleteAccount = async (e) => {
    e.preventDefault();
    if (!deletePassword) return;
    setDeleteLoading(true);
    setDeleteMsg({ text: '', type: '' });
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.post('/api/student/account/delete', { password: deletePassword }, config);
      localStorage.removeItem('userInfo');
      window.location.href = '/login';
    } catch (err) {
      setDeleteMsg({ text: err.response?.data?.message || 'Error deleting account', type: 'danger' });
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <main className="p-4 p-md-5">
      <div className="container-fluid max-w-7xl mx-auto">
        
        {/* Title */}
        <div className="mb-4">
          <h2 className="fw-bold mb-1 d-flex align-items-center gap-2">
            <FaCog className="text-primary" /> Settings & Preferences
          </h2>
          <p className="text-muted mb-0">Manage account information, integrations, notifications, and security configurations.</p>
        </div>

        <div className="row g-4">
          {/* Sidebar Tabs Navigation */}
          <div className="col-12 col-lg-3">
            <div className="saas-card p-2">
              <div className="nav flex-column nav-pills gap-1">
                {[
                  { id: 'account', label: 'Account Profile', icon: FaUser },
                  { id: 'github', label: 'GitHub Connection', icon: FaGithub },
                  { id: 'notifications', label: 'Notifications', icon: FaBell },
                  { id: 'security', label: 'Password & Security', icon: FaLock },
                  { id: 'danger', label: 'Danger Zone', icon: FaExclamationTriangle, isDanger: true },
                ].map(tab => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      className={`nav-link text-start d-flex align-items-center gap-3 py-3 px-3 rounded-3 fw-semibold border-0 ${
                        isActive 
                          ? tab.isDanger ? 'bg-danger text-white' : 'bg-primary text-white shadow-sm' 
                          : tab.isDanger ? 'text-danger hover-bg-danger' : 'text-dark hover-bg-light'
                      }`}
                      onClick={() => setActiveTab(tab.id)}
                    >
                      <Icon className="fs-5" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Main Settings Content */}
          <div className="col-12 col-lg-9">
            
            {/* Account Settings Tab */}
            {activeTab === 'account' && (
              <div className="saas-card">
                <h4 className="fw-bold mb-3">Account Profile Information</h4>
                <p className="text-muted small mb-4">Update your basic student details and contact information.</p>

                {profileMsg.text && (
                  <div className={`alert alert-${profileMsg.type} fw-semibold py-2 mb-4`}>
                    {profileMsg.text}
                  </div>
                )}

                <form onSubmit={handleUpdateProfile}>
                  <div className="row g-3">
                    <div className="col-12 col-md-6">
                      <label className="form-label text-muted small fw-bold text-uppercase">Full Name</label>
                      <input 
                        type="text" 
                        className="form-control bg-light border py-2"
                        value={fullName}
                        onChange={e => setFullName(e.target.value)}
                        placeholder="John Doe"
                        required
                      />
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="form-label text-muted small fw-bold text-uppercase">Email Address (Read-Only)</label>
                      <input 
                        type="email" 
                        className="form-control bg-light border py-2 text-muted"
                        value={user?.email || ''}
                        disabled
                      />
                    </div>

                    <div className="col-12 col-md-4">
                      <label className="form-label text-muted small fw-bold text-uppercase">Department</label>
                      <input 
                        type="text" 
                        className="form-control bg-light border py-2"
                        value={department}
                        onChange={e => setDepartment(e.target.value)}
                        placeholder="CSE, ECE, IT, etc."
                      />
                    </div>

                    <div className="col-6 col-md-4">
                      <label className="form-label text-muted small fw-bold text-uppercase">Year</label>
                      <select 
                        className="form-select bg-light border py-2"
                        value={year}
                        onChange={e => setYear(e.target.value)}
                      >
                        <option value="">Select Year</option>
                        <option value="1st Year">1st Year</option>
                        <option value="2nd Year">2nd Year</option>
                        <option value="3rd Year">3rd Year</option>
                        <option value="4th Year">4th Year</option>
                      </select>
                    </div>

                    <div className="col-6 col-md-4">
                      <label className="form-label text-muted small fw-bold text-uppercase">Section</label>
                      <input 
                        type="text" 
                        className="form-control bg-light border py-2"
                        value={section}
                        onChange={e => setSection(e.target.value)}
                        placeholder="A, B, C, etc."
                      />
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="form-label text-muted small fw-bold text-uppercase">Phone Number</label>
                      <input 
                        type="text" 
                        className="form-control bg-light border py-2"
                        value={phoneNumber}
                        onChange={e => setPhoneNumber(e.target.value)}
                        placeholder="10-digit mobile number"
                      />
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-top d-flex justify-content-end">
                    <button 
                      type="submit" 
                      className="btn btn-primary fw-bold px-4 d-flex align-items-center gap-2"
                      disabled={profileLoading}
                    >
                      {profileLoading ? <FaSpinner className="fa-spin" /> : <FaSave />}
                      {profileLoading ? 'Saving...' : 'Save Profile Changes'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* GitHub Connection Tab */}
            {activeTab === 'github' && (
              <div className="saas-card">
                <h4 className="fw-bold mb-3 d-flex align-items-center gap-2">
                  <FaGithub /> GitHub Account Integration
                </h4>
                <p className="text-muted small mb-4">Manage authorization and connection status for syncing repositories and commit stats.</p>

                {unsyncMsg.text && (
                  <div className={`alert alert-${unsyncMsg.type} fw-semibold py-2 mb-4`}>
                    {unsyncMsg.text}
                  </div>
                )}

                <div className="p-4 rounded-3 border bg-light mb-4">
                  <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3">
                    <div className="d-flex align-items-center gap-3">
                      <div className="p-3 bg-dark text-white rounded-circle">
                        <FaGithub className="fs-2" />
                      </div>
                      <div>
                        <h6 className="fw-bold mb-1">
                          {githubLinked ? `Linked as @${user?.githubUsername?.toUpperCase()}` : 'GitHub Not Connected'}
                        </h6>
                        <p className="text-muted small mb-0">
                          {githubLinked ? 'Your GitHub activities are automatically synced with GitScope.' : 'Connect your account to enable ranking and repository insights.'}
                        </p>
                      </div>
                    </div>

                    <div>
                      {githubLinked ? (
                        <button 
                          className="btn btn-outline-warning fw-bold d-flex align-items-center gap-2"
                          onClick={handleUnlinkGithub}
                          disabled={unsyncLoading}
                        >
                          {unsyncLoading ? <FaSpinner className="fa-spin" /> : <FaUnlink />}
                          Unlink Account
                        </button>
                      ) : (
                        <a href="/student/dashboard" className="btn btn-dark fw-bold">
                          Go to Dashboard to Connect
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                <div className="border-top pt-3">
                  <h6 className="fw-bold mb-2">Sync Information</h6>
                  <ul className="text-muted small mb-0 ps-3">
                    <li>Repositories list, star counts, and commit streaks update automatically.</li>
                    <li>Only public repository statistics are collected for ranking.</li>
                    <li>Unlinking your GitHub account will clear stored stats from GitScope.</li>
                  </ul>
                </div>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div className="saas-card">
                <h4 className="fw-bold mb-3 d-flex align-items-center gap-2">
                  <FaBell /> Notification Preferences
                </h4>
                <p className="text-muted small mb-4">Configure alerts and digest notifications.</p>

                {notifMsg && (
                  <div className="alert alert-success fw-semibold py-2 mb-4 d-flex align-items-center gap-2">
                    <FaCheckCircle /> {notifMsg}
                  </div>
                )}

                <form onSubmit={handleSaveNotifications}>
                  <div className="d-flex flex-column gap-3 mb-4">
                    <div className="d-flex justify-content-between align-items-center p-3 border rounded-3 bg-light">
                      <div>
                        <h6 className="fw-bold mb-1">Leaderboard & Rank Updates</h6>
                        <p className="text-muted small mb-0">Receive alerts when your departmental or overall rank changes.</p>
                      </div>
                      <div className="form-check form-switch fs-5">
                        <input 
                          className="form-check-input style-pointer" 
                          type="checkbox" 
                          checked={notifyLeaderboard}
                          onChange={e => setNotifyLeaderboard(e.target.checked)}
                        />
                      </div>
                    </div>

                    <div className="d-flex justify-content-between align-items-center p-3 border rounded-3 bg-light">
                      <div>
                        <h6 className="fw-bold mb-1">Achievement & Badge Unlocks</h6>
                        <p className="text-muted small mb-0">Get notified immediately when you unlock new badges or level up.</p>
                      </div>
                      <div className="form-check form-switch fs-5">
                        <input 
                          className="form-check-input style-pointer" 
                          type="checkbox" 
                          checked={notifyAchievements}
                          onChange={e => setNotifyAchievements(e.target.checked)}
                        />
                      </div>
                    </div>

                    <div className="d-flex justify-content-between align-items-center p-3 border rounded-3 bg-light">
                      <div>
                        <h6 className="fw-bold mb-1">Weekly Open Source Digest</h6>
                        <p className="text-muted small mb-0">Receive a weekly summary email of your repository activity and commits.</p>
                      </div>
                      <div className="form-check form-switch fs-5">
                        <input 
                          className="form-check-input style-pointer" 
                          type="checkbox" 
                          checked={notifyWeeklyDigest}
                          onChange={e => setNotifyWeeklyDigest(e.target.checked)}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="d-flex justify-content-end">
                    <button type="submit" className="btn btn-primary fw-bold px-4">
                      Save Preferences
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Password & Security Tab */}
            {activeTab === 'security' && (
              <div className="saas-card">
                <h4 className="fw-bold mb-3 d-flex align-items-center gap-2">
                  <FaLock /> Password & Security
                </h4>
                <p className="text-muted small mb-4">Ensure your account password is strong and updated.</p>

                {pwdMsg.text && (
                  <div className={`alert alert-${pwdMsg.type} fw-semibold py-2 mb-4`}>
                    {pwdMsg.text}
                  </div>
                )}

                <form onSubmit={handleChangePassword}>
                  <div className="mb-3 position-relative max-w-lg">
                    <label className="form-label text-muted small fw-bold text-uppercase">Current Password</label>
                    <input 
                      type={showCurrentPwd ? "text" : "password"}
                      className="form-control bg-light border py-2"
                      value={currentPassword}
                      onChange={e => setCurrentPassword(e.target.value)}
                      required
                    />
                    <button 
                      type="button" 
                      className="btn btn-link text-muted position-absolute end-0 bottom-0 mb-1 pe-3 text-decoration-none"
                      onClick={() => setShowCurrentPwd(!showCurrentPwd)}
                    >
                      {showCurrentPwd ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>

                  <div className="mb-4 position-relative max-w-lg">
                    <label className="form-label text-muted small fw-bold text-uppercase">New Password (Min 6 chars)</label>
                    <input 
                      type={showNewPwd ? "text" : "password"}
                      className="form-control bg-light border py-2"
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      required
                      minLength={6}
                    />
                    <button 
                      type="button" 
                      className="btn btn-link text-muted position-absolute end-0 bottom-0 mb-1 pe-3 text-decoration-none"
                      onClick={() => setShowNewPwd(!showNewPwd)}
                    >
                      {showNewPwd ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>

                  <div className="pt-2">
                    <button 
                      type="submit" 
                      className="btn btn-dark fw-bold px-4 d-flex align-items-center gap-2"
                      disabled={pwdLoading}
                    >
                      {pwdLoading ? <FaSpinner className="fa-spin" /> : <FaLock />}
                      {pwdLoading ? 'Updating...' : 'Update Password'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Danger Zone Tab */}
            {activeTab === 'danger' && (
              <div className="saas-card border-danger border-opacity-50">
                <h4 className="fw-bold text-danger mb-3 d-flex align-items-center gap-2">
                  <FaExclamationTriangle /> Danger Zone
                </h4>
                <p className="text-muted small mb-4">Permanent actions regarding your account and data privacy.</p>

                {deleteMsg.text && (
                  <div className={`alert alert-${deleteMsg.type} fw-semibold py-2 mb-4`}>
                    {deleteMsg.text}
                  </div>
                )}

                <div className="p-4 rounded-3 border border-danger border-opacity-25 bg-danger bg-opacity-10 mb-4">
                  <h6 className="fw-bold text-danger mb-2">Delete Account Permanently</h6>
                  <p className="small text-muted mb-3">
                    Deleting your account will irreversibly remove all your profile details, statistics, and GitHub connection records from GitScope servers.
                  </p>

                  <form onSubmit={handleDeleteAccount} className="max-w-lg">
                    <div className="position-relative mb-3">
                      <label className="form-label text-danger small fw-bold">CONFIRM WITH YOUR PASSWORD</label>
                      <input 
                        type={showDeletePwd ? "text" : "password"}
                        className="form-control border-danger bg-white py-2"
                        value={deletePassword}
                        onChange={e => setDeletePassword(e.target.value)}
                        placeholder="Enter password to confirm"
                        required
                      />
                      <button 
                        type="button" 
                        className="btn btn-link text-danger position-absolute end-0 bottom-0 mb-1 pe-3 text-decoration-none"
                        onClick={() => setShowDeletePwd(!showDeletePwd)}
                      >
                        {showDeletePwd ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>

                    <button 
                      type="submit" 
                      className="btn btn-danger fw-bold d-flex align-items-center gap-2"
                      disabled={deleteLoading || !deletePassword}
                    >
                      {deleteLoading ? <FaSpinner className="fa-spin" /> : <FaExclamationTriangle />}
                      {deleteLoading ? 'Deleting Account...' : 'Permanently Delete Account'}
                    </button>
                  </form>
                </div>
              </div>
            )}

          </div>
        </div>

      </div>
    </main>
  );
};

export default StudentSettings;
