import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaUser, FaLock, FaSave, FaCheckCircle, FaUserTie, FaShieldAlt } from 'react-icons/fa';

const StaffProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [profileMsg, setProfileMsg] = useState({ text: '', type: '' });
  const [passMsg, setPassMsg] = useState({ text: '', type: '' });

  const token = JSON.parse(localStorage.getItem('userInfo'))?.token;

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const res = await axios.get('/api/staff/profile', config);
      setProfile(res.data);
      setFullName(res.data.fullName || '');
      setPhoneNumber(res.data.phoneNumber || '');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
    // eslint-disable-next-line
  }, [token]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileMsg({ text: '', type: '' });
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.put('/api/staff/profile', { fullName, phoneNumber }, config);
      setProfileMsg({ text: 'Profile details updated successfully!', type: 'success' });
      // Update local storage name if present
      const info = JSON.parse(localStorage.getItem('userInfo'));
      if (info) {
        info.fullName = fullName;
        localStorage.setItem('userInfo', JSON.stringify(info));
      }
    } catch (err) {
      setProfileMsg({ text: err.response?.data?.message || 'Failed to update profile.', type: 'danger' });
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPassMsg({ text: '', type: '' });
    if (newPassword !== confirmPassword) {
      setPassMsg({ text: 'New passwords do not match.', type: 'danger' });
      return;
    }
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.put('/api/staff/change-password', { currentPassword, newPassword }, config);
      setPassMsg({ text: 'Password changed successfully!', type: 'success' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPassMsg({ text: err.response?.data?.message || 'Failed to change password.', type: 'danger' });
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5">
        <div className="spinner-border text-primary me-2" role="status"></div>
        <span className="fw-semibold text-muted">Loading profile details...</span>
      </div>
    );
  }

  return (
    <div className="staff-profile-page">
      <div className="d-flex flex-wrap align-items-center justify-content-between mb-4 gap-3">
        <div>
          <h2 className="fw-bold text-dark mb-1">Staff Profile Settings</h2>
          <p className="text-muted small mb-0">Manage your personal details, guidance allocations, and account credentials.</p>
        </div>
      </div>

      <div className="row g-4">
        {/* Profile Card */}
        <div className="col-12 col-lg-6">
          <div className="saas-card h-100">
            <div className="d-flex align-items-center mb-4 pb-3 border-bottom">
              <div className="avatar-circle me-3 bg-primary text-white fw-bold fs-4" style={{ width: 56, height: 56 }}>
                <FaUserTie />
              </div>
              <div>
                <h5 className="fw-bold text-dark mb-0">{profile?.fullName}</h5>
                <span className="badge bg-primary me-2">{profile?.role?.toUpperCase()}</span>
                <span className="badge bg-success-subtle text-success border border-success-subtle">{profile?.status?.toUpperCase()}</span>
              </div>
            </div>

            {profileMsg.text && (
              <div className={`alert alert-${profileMsg.type} p-2 small mb-3`}>{profileMsg.text}</div>
            )}

            <form onSubmit={handleUpdateProfile}>
              <div className="mb-3">
                <label className="form-label small fw-bold text-muted">Full Name</label>
                <input 
                  type="text" 
                  className="form-control bg-light" 
                  value={fullName} 
                  onChange={(e) => setFullName(e.target.value)} 
                  required 
                />
              </div>

              <div className="mb-3">
                <label className="form-label small fw-bold text-muted">Phone Number</label>
                <input 
                  type="text" 
                  className="form-control bg-light" 
                  value={phoneNumber} 
                  onChange={(e) => setPhoneNumber(e.target.value)} 
                />
              </div>

              <div className="mb-3">
                <label className="form-label small fw-bold text-muted">Staff ID / Roll Number (Read-only)</label>
                <input type="text" className="form-control bg-light text-muted" value={profile?.rollNumber || ''} disabled />
              </div>

              <div className="mb-3">
                <label className="form-label small fw-bold text-muted">Email Address (Read-only)</label>
                <input type="email" className="form-control bg-light text-muted" value={profile?.email || ''} disabled />
              </div>

              <div className="mb-3">
                <label className="form-label small fw-bold text-muted">Department (Read-only)</label>
                <input type="text" className="form-control bg-light text-muted" value={profile?.department || ''} disabled />
              </div>

              <div className="mb-4">
                <label className="form-label small fw-bold text-muted">Assigned Students Count (Read-only)</label>
                <input type="text" className="form-control bg-light text-muted" value={`${profile?.assignedStudentsCount || 0} Students Allocated`} disabled />
              </div>

              <button type="submit" className="btn btn-primary fw-bold w-100 py-2 rounded-3">
                <FaSave className="me-2" /> Save Profile Details
              </button>
            </form>
          </div>
        </div>

        {/* Change Password Card */}
        <div className="col-12 col-lg-6">
          <div className="saas-card h-100">
            <h5 className="fw-bold text-dark mb-3 pb-2 border-bottom d-flex align-items-center">
              <FaLock className="me-2 text-primary" /> Security &amp; Password Management
            </h5>

            {passMsg.text && (
              <div className={`alert alert-${passMsg.type} p-2 small mb-3`}>{passMsg.text}</div>
            )}

            <form onSubmit={handleChangePassword}>
              <div className="mb-3">
                <label className="form-label small fw-bold text-muted">Current Password</label>
                <input 
                  type="password" 
                  className="form-control bg-light" 
                  value={currentPassword} 
                  onChange={(e) => setCurrentPassword(e.target.value)} 
                  required 
                />
              </div>

              <div className="mb-3">
                <label className="form-label small fw-bold text-muted">New Password (Min 6 characters)</label>
                <input 
                  type="password" 
                  className="form-control bg-light" 
                  value={newPassword} 
                  onChange={(e) => setNewPassword(e.target.value)} 
                  required 
                  minLength={6}
                />
              </div>

              <div className="mb-4">
                <label className="form-label small fw-bold text-muted">Confirm New Password</label>
                <input 
                  type="password" 
                  className="form-control bg-light" 
                  value={confirmPassword} 
                  onChange={(e) => setConfirmPassword(e.target.value)} 
                  required 
                />
              </div>

              <button type="submit" className="btn btn-outline-primary fw-bold w-100 py-2 rounded-3">
                <FaShieldAlt className="me-2" /> Change Password
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffProfile;
