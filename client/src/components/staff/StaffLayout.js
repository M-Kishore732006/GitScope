import React, { useEffect, useState } from 'react';
import { useNavigate, Outlet } from 'react-router-dom';
import StaffSidebar from './StaffSidebar';
import StaffTopNav from './StaffTopNav';
import '../../styles/dashboard.css';

const StaffLayout = () => {
  const navigate = useNavigate();
  const [staffUser, setStaffUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [inactiveError, setInactiveError] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const userInfoStr = localStorage.getItem('userInfo');
    const userInfo = userInfoStr ? JSON.parse(userInfoStr) : null;
    const token = userInfo?.token;

    if (!token) {
      localStorage.removeItem('userInfo');
      navigate('/login');
      return;
    }

    // Role check: Only 'teacher' or 'staff' allowed
    const isStaffRole = userInfo?.role === 'teacher' || userInfo?.role === 'staff';
    if (!isStaffRole) {
      // Prevent access & redirect
      localStorage.removeItem('userInfo');
      navigate('/login');
      return;
    }

    // Account status check
    if (userInfo?.status === 'deactivated' || userInfo?.status === 'inactive') {
      setInactiveError(true);
      setLoading(false);
      return;
    }

    setStaffUser(userInfo);
    setLoading(false);
  }, [navigate]);

  const toggleSidebar = () => setSidebarOpen(prev => !prev);
  const closeSidebar = () => setSidebarOpen(false);

  const handleLogout = () => {
    localStorage.removeItem('userInfo');
    window.location.href = '/login';
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100 bg-light">
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status"></div>
          <p className="fw-semibold text-muted mb-0">Initializing Staff Workspace...</p>
        </div>
      </div>
    );
  }

  if (inactiveError) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100 bg-light p-4">
        <div className="card shadow border-0 rounded-4 p-4 text-center max-w-md" style={{ maxWidth: '450px' }}>
          <div className="avatar-circle mx-auto mb-3 bg-danger-subtle text-danger" style={{ width: 64, height: 64, fontSize: '1.8rem' }}>
            ⚠️
          </div>
          <h4 className="fw-bold text-dark mb-2">Account Inactive</h4>
          <p className="text-muted mb-4 small">
            Your Staff account is currently inactive or deactivated. Please contact your system administrator to reactivate your access.
          </p>
          <button className="btn btn-primary w-100 fw-bold py-2 rounded-3" onClick={handleLogout}>
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-wrapper">
      <StaffSidebar mobileOpen={sidebarOpen} closeSidebar={closeSidebar} />
      {sidebarOpen && <div className="sidebar-backdrop d-lg-none" onClick={closeSidebar}></div>}
      <div className="main-content">
        <StaffTopNav user={staffUser} handleLogout={handleLogout} toggleSidebar={toggleSidebar} />
        <main className="p-3 p-md-4 p-lg-5">
          <Outlet context={{ user: staffUser }} />
        </main>
      </div>
    </div>
  );
};

export default StaffLayout;
