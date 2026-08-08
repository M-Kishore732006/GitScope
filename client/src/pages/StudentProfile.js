import React, { useState } from 'react';
import axios from 'axios';
import { useOutletContext } from 'react-router-dom';
import ProfileWidget from '../components/dashboard/ProfileWidget';
import { FaEye, FaEyeSlash, FaLock, FaExclamationTriangle } from 'react-icons/fa';
import '../styles/dashboard.css';

const StudentProfile = () => {
    const { user } = useOutletContext();
    
    // Modal State
    const [activeModal, setActiveModal] = useState(null); // 'password', 'delete', or null

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

    const token = JSON.parse(localStorage.getItem('userInfo'))?.token;

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
            const res = await axios.post('/api/student/account/delete', { password: deletePassword }, config);
            
            // On success, force logout
            localStorage.removeItem('userInfo');
            window.location.href = '/login';
        } catch (error) {
            setDelMsg({ text: error.response?.data?.message || 'Error deleting account', type: 'danger' });
        }
    };

    return (
        <main className="p-4 p-md-5">
            <div className="container-fluid max-w-7xl mx-auto">
                        <div className="d-flex justify-content-between align-items-end mb-4">
                            <div>
                                <h2 className="fw-bold mb-1">My Profile</h2>
                                <p className="text-muted mb-0">Manage your personal information and GitScope identity.</p>
                            </div>
                        </div>

                        <div className="row">
                            <div className="col-12 col-md-6 col-lg-4">
                                <ProfileWidget user={user} />
                                
                                <div className="card saas-card mt-4">
                                    <h5 className="fw-bold mb-3">GitHub Connection</h5>
                                    {user?.githubLinked ? (
                                        <div className="alert alert-success d-flex align-items-center mb-0 p-2 text-center justify-content-center">
                                            <span className="fw-medium small">Linked to @{user.githubUsername}</span>
                                        </div>
                                    ) : (
                                        <div className="alert alert-secondary d-flex align-items-center mb-0 p-2 text-center justify-content-center">
                                            <span className="fw-medium small">Not linked. Go to Dashboard.</span>
                                        </div>
                                    )}
                                </div>

                                <div className="card saas-card mt-4">
                                    <h5 className="fw-bold mb-4 text-dark"><FaLock className="me-2" /> Security</h5>
                                    <div className="d-flex flex-column gap-3">
                                        <button className="btn btn-dark fw-bold w-100" onClick={() => setActiveModal('password')}>
                                            Change Password
                                        </button>
                                        <button className="btn btn-outline-danger fw-bold w-100" onClick={() => setActiveModal('delete')}>
                                            <FaExclamationTriangle className="me-2" /> Delete Account
                                        </button>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="col-12 col-md-6 col-lg-8">
                                <div className="card saas-card">
                                    <h5 className="fw-bold mb-4">Account Details</h5>
                                    
                                    <div className="mb-4">
                                        <label className="form-label text-muted small fw-bold">FULL NAME</label>
                                        <p className="fw-medium text-dark">{user?.fullName || 'Not provided'}</p>
                                    </div>
                                    <div className="mb-4">
                                        <label className="form-label text-muted small fw-bold">EMAIL ADDRESS</label>
                                        <p className="fw-medium text-dark">{user?.email}</p>
                                    </div>
                                    <div className="row mb-4">
                                        <div className="col-6">
                                            <label className="form-label text-muted small fw-bold">DEPARTMENT</label>
                                            <p className="fw-medium text-dark">{user?.department || 'N/A'}</p>
                                        </div>
                                        <div className="col-6">
                                            <label className="form-label text-muted small fw-bold">YEAR & SECTION</label>
                                            <p className="fw-medium text-dark">{user?.year ? `${user.year} - ${user.section || 'N/A'}` : 'N/A'}</p>
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
            
            {/* Password Change Modal */}
            {activeModal === 'password' && (
                <div className="modal d-block" tabIndex="-1" style={{ zIndex: 1050, marginTop: '10vh' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '1rem' }}>
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

            {/* Permanent Deletion Modal */}
            {activeModal === 'delete' && (
                <div className="modal d-block" tabIndex="-1" style={{ zIndex: 1050, marginTop: '10vh' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content border-0 shadow-lg border-top border-danger border-4" style={{ borderRadius: '1rem' }}>
                            <div className="modal-header border-0 pb-0">
                                <h5 className="modal-title fw-bold text-danger"><FaExclamationTriangle className="me-2" /> Danger Zone</h5>
                                <button type="button" className="btn-close" onClick={() => {setActiveModal(null); setDelMsg({text:'', type:''});}}></button>
                            </div>
                            <div className="modal-body p-4">
                                <p className="text-muted small fw-medium mb-4">
                                    Deleting your account will irreversibly remove all your data, records, and GitHub statistics from the GitScope servers. This action cannot be undone. Enter your password to proceed.
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
