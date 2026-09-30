import React, { useState } from 'react';
import axios from 'axios';
import { useOutletContext, Link } from 'react-router-dom';
import ProfileWidget from '../components/dashboard/ProfileWidget';
import SkillRadar from '../components/dashboard/SkillRadar';
import { 
  FaEye, FaEyeSlash, FaLock, FaExclamationTriangle, 
  FaGithub, FaUnlink, FaEdit, FaCheckCircle, FaUserEdit, FaCog, FaExternalLinkAlt, FaPrint 
} from 'react-icons/fa';
import { toTitleCase } from '../utils/formatters';
import '../styles/dashboard.css';

const StudentProfile = () => {
    const { user, stats, fetchDashboardData } = useOutletContext();
    
    // Modal State
    const [activeModal, setActiveModal] = useState(null); // 'editProfile', 'password', 'delete', 'unsync', null

    // Edit Profile form states
    const [fullName, setFullName] = useState(user?.fullName || '');
    const [department, setDepartment] = useState(user?.department || '');
    const [year, setYear] = useState(user?.year || '');
    const [section, setSection] = useState(user?.section || '');
    const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || '');
    const [editMsg, setEditMsg] = useState({ text: '', type: '' });
    const [editLoading, setEditLoading] = useState(false);

    // Password States
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [deletePassword, setDeletePassword] = useState('');
    
    // Visibility States
    const [showOldPwd, setShowOldPwd] = useState(false);
    const [showNewPwd, setShowNewPwd] = useState(false);
    const [showDelPwd, setShowDelPwd] = useState(false);
    
    const [pwdMsg, setPwdMsg] = useState({ text: '', type: '' });
    const [delMsg, setDelMsg] = useState({ text: '', type: '' });
    const [unsyncMsg, setUnsyncMsg] = useState({ text: '', type: '' });
    const [unsyncLoading, setUnsyncLoading] = useState(false);

    const token = JSON.parse(localStorage.getItem('userInfo'))?.token;
    
    const [githubLinked, setGithubLinked] = useState(user?.githubLinked ?? false);
    const [githubUsername, setGithubUsername] = useState(user?.githubUsername ?? '');

    const handleEditProfileSubmit = async (e) => {
        e.preventDefault();
        setEditLoading(true);
        setEditMsg({ text: '', type: '' });
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.put('/api/student/profile', {
                fullName, department, year, section, phoneNumber
            }, config);

            setEditMsg({ text: 'Profile details updated successfully!', type: 'success' });
            await fetchDashboardData();
            setTimeout(() => {
                setActiveModal(null);
                setEditMsg({ text: '', type: '' });
            }, 1200);
        } catch (error) {
            setEditMsg({ text: error.response?.data?.message || 'Error updating profile', type: 'danger' });
        } finally {
            setEditLoading(false);
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        setPwdMsg({ text: 'Updating...', type: 'info' });
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const res = await axios.put('/api/student/password', { currentPassword: oldPassword, newPassword: newPassword }, config);
            setPwdMsg({ text: res.data.message, type: 'success' });
            setOldPassword('');
            setNewPassword('');
        } catch (error) {
            setPwdMsg({ text: error.response?.data?.message || 'Error updating password', type: 'danger' });
        }
    };

    const handleDeleteAccount = async (e) => {
        e.preventDefault();
        setDelMsg({ text: 'Deleting...', type: 'info' });
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.post('/api/student/account/delete', { password: deletePassword }, config);
            
            localStorage.removeItem('userInfo');
            window.location.href = '/login';
        } catch (error) {
            setDelMsg({ text: error.response?.data?.message || 'Error deleting account', type: 'danger' });
        }
    };

    const handleUnsyncGithub = async () => {
        setUnsyncLoading(true);
        setUnsyncMsg({ text: '', type: '' });
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const res = await axios.post('/api/student/github/unlink', {}, config);
            setGithubLinked(false);
            setGithubUsername('');
            
            const userInfoStr = localStorage.getItem('userInfo');
            if (userInfoStr) {
                const info = JSON.parse(userInfoStr);
                info.githubLinked = false;
                info.githubUsername = '';
                localStorage.setItem('userInfo', JSON.stringify(info));
            }
            setUnsyncMsg({ text: res.data.message, type: 'success' });
            setActiveModal(null);
            await fetchDashboardData();
        } catch (error) {
            setUnsyncMsg({ text: error.response?.data?.message || 'Error unlinking GitHub', type: 'danger' });
        } finally {
            setUnsyncLoading(false);
        }
    };

    return (
        <main className="p-4 p-md-5">
            <div className="container-fluid max-w-7xl mx-auto">
                
                {/* Header */}
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
                    <div>
                        <h2 className="fw-bold mb-1">Student Profile</h2>
                        <p className="text-muted mb-0">View and manage your academic identity and GitScope integration profile.</p>
                    </div>
                    <div className="d-flex gap-2">
                        <button 
                            className="btn btn-primary fw-bold d-flex align-items-center gap-2"
                            onClick={() => {
                                setFullName(user?.fullName || '');
                                setDepartment(user?.department || '');
                                setYear(user?.year || '');
                                setSection(user?.section || '');
                                setPhoneNumber(user?.phoneNumber || '');
                                setActiveModal('editProfile');
                            }}
                        >
                            <FaUserEdit /> Edit Profile
                        </button>
                        <Link to="/student/settings" className="btn btn-outline-secondary fw-bold d-flex align-items-center gap-2">
                            <FaCog /> Settings
                        </Link>
                    </div>
                </div>

                {/* AI Skill Radar & Code Health (Full Container Width) */}
                <div className="row mb-4">
                    <div className="col-12">
                        <SkillRadar stats={stats} />
                    </div>
                </div>

                <div className="row g-4">
                    {/* Left Column: Widget + GitHub connection + Security */}
                    <div className="col-12 col-md-5 col-lg-4">
                        <ProfileWidget user={user} />
                        
                        {/* Performance Summary Widget */}
                        <div className="card saas-card mt-4">
                            <h5 className="fw-bold mb-3">GitScope Status</h5>
                            <div className="d-flex flex-column gap-2 text-muted small">
                                <div className="d-flex justify-content-between align-items-center p-2 bg-light rounded-3">
                                    <span className="fw-bold text-dark">Contribution Score</span>
                                    <span className="fw-extrabold text-primary">{stats?.contributionScore || 0} PTS</span>
                                </div>
                                <div className="d-flex justify-content-between align-items-center p-2 bg-light rounded-3">
                                    <span className="fw-bold text-dark">Overall Rank</span>
                                    <span className="fw-extrabold text-dark">#{stats?.overallRank > 0 ? stats.overallRank : '-'}</span>
                                </div>
                                <div className="d-flex justify-content-between align-items-center p-2 bg-light rounded-3">
                                    <span className="fw-bold text-dark">Level Tier</span>
                                    <span className="badge bg-warning text-dark fw-bold">{stats?.level || 'Bronze'}</span>
                                </div>
                            </div>
                        </div>

                        {/* GitHub Integration Card */}
                        <div className="card saas-card mt-4">
                            <h5 className="fw-bold mb-3"><FaGithub className="me-2" />GitHub Connection</h5>
                            {unsyncMsg.text && (
                                <div className={`alert alert-${unsyncMsg.type} small fw-bold py-2 mb-3`}>{unsyncMsg.text}</div>
                            )}
                            {githubLinked ? (
                                <div className="d-flex flex-column gap-2">
                                    <div className="alert alert-success d-flex align-items-center mb-0 p-2 text-center justify-content-center">
                                        <span className="fw-medium small">Linked to @{githubUsername?.toUpperCase()}</span>
                                    </div>
                                    <button
                                        className="btn btn-outline-warning fw-bold w-100 d-flex align-items-center justify-content-center gap-2"
                                        onClick={() => { setUnsyncMsg({ text: '', type: '' }); setActiveModal('unsync'); }}
                                    >
                                        <FaUnlink /> Unsync GitHub Account
                                    </button>
                                </div>
                            ) : (
                                <div className="alert alert-secondary d-flex align-items-center mb-0 p-2 text-center justify-content-center">
                                    <span className="fw-medium small">Not linked. Go to Dashboard to connect.</span>
                                </div>
                            )}
                        </div>

                        {/* Security Quick Actions */}
                        <div className="card saas-card mt-4">
                            <h5 className="fw-bold mb-3 text-dark"><FaLock className="me-2" /> Security Quick Actions</h5>
                            <div className="d-flex flex-column gap-2">
                                <button className="btn btn-dark fw-bold w-100" onClick={() => setActiveModal('password')}>
                                    Change Password
                                </button>
                                <button className="btn btn-outline-danger fw-bold w-100" onClick={() => setActiveModal('delete')}>
                                    <FaExclamationTriangle className="me-2" /> Delete Account
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    {/* Right Column: Account & Academic Details */}
                    <div className="col-12 col-md-7 col-lg-8">
                        <div className="card saas-card mb-4">
                            <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-3 flex-wrap gap-2">
                                <div>
                                    <h5 className="fw-bold mb-0">Academic & Identity Details</h5>
                                    <small className="text-muted">Verified student credentials & performance profile</small>
                                </div>
                                <div className="d-flex align-items-center gap-2">
                                    <Link 
                                        to={`/portfolio/${user?.username}`} 
                                        target="_blank" 
                                        className="btn btn-sm btn-primary fw-bold d-flex align-items-center gap-1 rounded-pill px-3"
                                    >
                                        <FaExternalLinkAlt /> View Portfolio / PDF Resume
                                    </Link>
                                    <button 
                                        className="btn btn-sm btn-outline-primary fw-semibold d-flex align-items-center gap-1 rounded-pill"
                                        onClick={() => setActiveModal('editProfile')}
                                    >
                                        <FaEdit /> Edit
                                    </button>
                                </div>
                            </div>
                            
                            <div className="row g-4 mb-4">
                                <div className="col-12 col-sm-6">
                                    <label className="form-label text-muted small fw-bold text-uppercase">FULL NAME</label>
                                    <p className="fw-bold text-dark fs-5 mb-0">{toTitleCase(user?.fullName || user?.username || 'Not provided')}</p>
                                </div>

                                <div className="col-12 col-sm-6">
                                    <label className="form-label text-muted small fw-bold text-uppercase">USERNAME</label>
                                    <p className="fw-bold text-dark fs-5 mb-0">@{user?.username?.toUpperCase()}</p>
                                </div>

                                <div className="col-12 col-sm-6">
                                    <label className="form-label text-muted small fw-bold text-uppercase">EMAIL ADDRESS</label>
                                    <p className="fw-medium text-dark mb-0">{user?.email}</p>
                                </div>

                                <div className="col-12 col-sm-6">
                                    <label className="form-label text-muted small fw-bold text-uppercase">PHONE NUMBER</label>
                                    <p className="fw-medium text-dark mb-0">{user?.phoneNumber || 'Not provided'}</p>
                                </div>

                                <div className="col-12 col-sm-6">
                                    <label className="form-label text-muted small fw-bold text-uppercase">DEPARTMENT</label>
                                    <p className="fw-medium text-dark mb-0">{user?.department || 'N/A'}</p>
                                </div>

                                <div className="col-12 col-sm-6">
                                    <label className="form-label text-muted small fw-bold text-uppercase">YEAR & SECTION</label>
                                    <p className="fw-medium text-dark mb-0">{user?.year ? `${user.year} - ${user.section || 'N/A'}` : 'N/A'}</p>
                                </div>

                                {user?.rollNumber && (
                                    <div className="col-12 col-sm-6">
                                        <label className="form-label text-muted small fw-bold text-uppercase">ROLL NUMBER</label>
                                        <p className="fw-medium text-dark mb-0">{user.rollNumber}</p>
                                    </div>
                                )}

                                <div className="col-12 col-sm-6">
                                    <label className="form-label text-muted small fw-bold text-uppercase">ACCOUNT ROLE</label>
                                    <p className="mb-0">
                                        <span className="badge bg-primary bg-opacity-10 text-primary px-3 py-2 rounded-pill fw-bold text-uppercase">
                                            {user?.role || 'student'}
                                        </span>
                                    </p>
                                </div>
                            </div>
                        </div>



                        <div className="card saas-card">
                            <h5 className="fw-bold mb-3">Repositories & Contribution Summary</h5>
                            <div className="row g-3 text-center">
                                <div className="col-4">
                                    <div className="p-3 bg-light rounded-3">
                                        <h4 className="fw-bold mb-1 text-primary">{stats?.repositoriesList?.length || 0}</h4>
                                        <span className="small text-muted fw-bold">Repositories</span>
                                    </div>
                                </div>
                                <div className="col-4">
                                    <div className="p-3 bg-light rounded-3">
                                        <h4 className="fw-bold mb-1 text-success">{stats?.totalCommits || 0}</h4>
                                        <span className="small text-muted fw-bold">Commits</span>
                                    </div>
                                </div>
                                <div className="col-4">
                                    <div className="p-3 bg-light rounded-3">
                                        <h4 className="fw-bold mb-1 text-warning">{stats?.totalStars || 0}</h4>
                                        <span className="small text-muted fw-bold">Stars</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal Overlay */}
            {activeModal && (
                <div className="modal-backdrop fade show" style={{ zIndex: 1040, background: 'rgba(0,0,0,0.5)' }}></div>
            )}
            
            {/* Edit Profile Modal */}
            {activeModal === 'editProfile' && (
                <div className="modal d-block" tabIndex="-1" style={{ zIndex: 1050, marginTop: '5vh' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content border-0 shadow-lg rounded-4">
                            <div className="modal-header border-0 pb-0 px-4 pt-4">
                                <h5 className="modal-title fw-bold">Edit Profile Details</h5>
                                <button type="button" className="btn-close" onClick={() => setActiveModal(null)}></button>
                            </div>
                            <div className="modal-body p-4">
                                {editMsg.text && <div className={`alert alert-${editMsg.type} small fw-bold py-2`}>{editMsg.text}</div>}
                                <form onSubmit={handleEditProfileSubmit}>
                                    <div className="mb-3">
                                        <label className="form-label text-muted small fw-bold">FULL NAME</label>
                                        <input 
                                            type="text" 
                                            className="form-control bg-light border-0 py-2"
                                            value={fullName}
                                            onChange={e => setFullName(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="row g-2 mb-3">
                                        <div className="col-6">
                                            <label className="form-label text-muted small fw-bold">DEPARTMENT</label>
                                            <input 
                                                type="text" 
                                                className="form-control bg-light border-0 py-2"
                                                value={department}
                                                onChange={e => setDepartment(e.target.value)}
                                            />
                                        </div>
                                        <div className="col-6">
                                            <label className="form-label text-muted small fw-bold">YEAR</label>
                                            <input 
                                                type="text" 
                                                className="form-control bg-light border-0 py-2"
                                                value={year}
                                                onChange={e => setYear(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <div className="row g-2 mb-3">
                                        <div className="col-6">
                                            <label className="form-label text-muted small fw-bold">SECTION</label>
                                            <input 
                                                type="text" 
                                                className="form-control bg-light border-0 py-2"
                                                value={section}
                                                onChange={e => setSection(e.target.value)}
                                            />
                                        </div>
                                        <div className="col-6">
                                            <label className="form-label text-muted small fw-bold">PHONE NUMBER</label>
                                            <input 
                                                type="text" 
                                                className="form-control bg-light border-0 py-2"
                                                value={phoneNumber}
                                                onChange={e => setPhoneNumber(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <div className="d-flex justify-content-end gap-2 pt-2">
                                        <button type="button" className="btn btn-light fw-bold" onClick={() => setActiveModal(null)}>Cancel</button>
                                        <button type="submit" className="btn btn-primary fw-bold" disabled={editLoading}>
                                            {editLoading ? 'Saving...' : 'Save Profile'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Password Change Modal */}
            {activeModal === 'password' && (
                <div className="modal d-block" tabIndex="-1" style={{ zIndex: 1050, marginTop: '10vh' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content border-0 shadow-lg rounded-4">
                            <div className="modal-header border-0 pb-0">
                                <h5 className="modal-title fw-bold">Update Password</h5>
                                <button type="button" className="btn-close" onClick={() => {setActiveModal(null); setPwdMsg({text:'', type:''});}}></button>
                            </div>
                            <div className="modal-body p-4">
                                {pwdMsg.text && <div className={`alert alert-${pwdMsg.type} small fw-bold py-2`}>{pwdMsg.text}</div>}
                                <form onSubmit={handlePasswordChange}>
                                    <div className="mb-3 position-relative">
                                        <label className="form-label text-muted small fw-bold">CURRENT PASSWORD</label>
                                        <input 
                                            type={showOldPwd ? "text" : "password"} 
                                            className="form-control bg-light border-0 py-2" 
                                            value={oldPassword} 
                                            onChange={(e) => setOldPassword(e.target.value)}
                                            required 
                                        />
                                        <button type="button" className="btn btn-link text-muted position-absolute end-0 bottom-0 mb-1 pe-3 text-decoration-none" onClick={() => setShowOldPwd(!showOldPwd)}>
                                            {showOldPwd ? <FaEyeSlash /> : <FaEye />}
                                        </button>
                                    </div>
                                    <div className="mb-4 position-relative">
                                        <label className="form-label text-muted small fw-bold">NEW PASSWORD</label>
                                        <input 
                                            type={showNewPwd ? "text" : "password"} 
                                            className="form-control bg-light border-0 py-2" 
                                            value={newPassword} 
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            required 
                                        />
                                        <button type="button" className="btn btn-link text-muted position-absolute end-0 bottom-0 mb-1 pe-3 text-decoration-none" onClick={() => setShowNewPwd(!showNewPwd)}>
                                            {showNewPwd ? <FaEyeSlash /> : <FaEye />}
                                        </button>
                                    </div>
                                    <button type="submit" className="btn btn-dark fw-bold w-100 py-2">Confirm Update</button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Unsync GitHub Confirmation Modal */}
            {activeModal === 'unsync' && (
                <div className="modal d-block" tabIndex="-1" style={{ zIndex: 1050, marginTop: '10vh' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content border-0 shadow-lg border-top border-warning border-4 rounded-4">
                            <div className="modal-header border-0 pb-0">
                                <h5 className="modal-title fw-bold text-warning"><FaUnlink className="me-2" /> Unsync GitHub</h5>
                                <button type="button" className="btn-close" onClick={() => { setActiveModal(null); setUnsyncMsg({ text: '', type: '' }); }}></button>
                            </div>
                            <div className="modal-body p-4">
                                <p className="text-muted small fw-medium mb-4">
                                    Unsyncing your GitHub account will remove all your GitHub statistics, repositories, and contribution data from GitScope.
                                </p>
                                {unsyncMsg.text && <div className={`alert alert-${unsyncMsg.type} small fw-bold py-2`}>{unsyncMsg.text}</div>}
                                <div className="d-flex justify-content-end gap-2">
                                    <button type="button" className="btn btn-light fw-bold" onClick={() => setActiveModal(null)} disabled={unsyncLoading}>Cancel</button>
                                    <button
                                        type="button"
                                        className="btn btn-warning fw-bold d-flex align-items-center gap-2"
                                        onClick={handleUnsyncGithub}
                                        disabled={unsyncLoading}
                                    >
                                        {unsyncLoading ? 'Unlinking...' : 'Confirm Unsync'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Permanent Deletion Modal */}
            {activeModal === 'delete' && (
                <div className="modal d-block" tabIndex="-1" style={{ zIndex: 1050, marginTop: '10vh' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content border-0 shadow-lg border-top border-danger border-4 rounded-4">
                            <div className="modal-header border-0 pb-0">
                                <h5 className="modal-title fw-bold text-danger"><FaExclamationTriangle className="me-2" /> Danger Zone</h5>
                                <button type="button" className="btn-close" onClick={() => {setActiveModal(null); setDelMsg({text:'', type:''});}}></button>
                            </div>
                            <div className="modal-body p-4">
                                <p className="text-muted small fw-medium mb-4">
                                    Deleting your account will irreversibly remove all your data, records, and GitHub statistics from GitScope.
                                </p>
                                
                                {delMsg.text && <div className={`alert alert-${delMsg.type} small fw-bold py-2`}>{delMsg.text}</div>}
                                
                                <form onSubmit={handleDeleteAccount}>
                                    <div className="position-relative mb-4">
                                        <label className="form-label text-danger small fw-bold">CONFIRM PASSWORD</label>
                                        <input 
                                            type={showDelPwd ? "text" : "password"} 
                                            className="form-control border-danger bg-danger bg-opacity-10 py-2" 
                                            value={deletePassword} 
                                            onChange={(e) => setDeletePassword(e.target.value)}
                                            required 
                                        />
                                        <button type="button" className="btn btn-link text-danger position-absolute end-0 bottom-0 mb-1 pe-3 text-decoration-none" onClick={() => setShowDelPwd(!showDelPwd)}>
                                            {showDelPwd ? <FaEyeSlash /> : <FaEye />}
                                        </button>
                                    </div>
                                    <div className="d-flex justify-content-end gap-2">
                                        <button type="button" className="btn btn-light fw-bold" onClick={() => setActiveModal(null)}>Cancel</button>
                                        <button type="submit" className="btn btn-danger fw-bold">Delete Instantly</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </main>
    );
};

export default StudentProfile;
