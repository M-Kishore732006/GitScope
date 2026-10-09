import React, { useEffect, useState } from 'react';
import { useNavigate, Outlet } from 'react-router-dom';
import axios from 'axios';
import AdminSidebar from './AdminSidebar';
import AdminTopNav from './AdminTopNav';
import '../../styles/dashboard.css';

const AdminLayout = () => {
  const navigate = useNavigate();
  const [adminUser, setAdminUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userInfoStr = localStorage.getItem('userInfo');
    const userInfo = userInfoStr ? JSON.parse(userInfoStr) : null;
    const token = userInfo?.token;

    if (!token || userInfo?.role !== 'admin') {
      localStorage.removeItem('userInfo');
      navigate('/login');
      return;
    }
    setAdminUser(userInfo);
    setLoading(false);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('userInfo');
    window.location.href = '/login';
  };

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    return localStorage.getItem('sidebar_collapsed') === 'true';
  });

  const toggleSidebar = () => {
    if (window.innerWidth < 992) {
      setSidebarOpen(prev => !prev);
    } else {
      setSidebarCollapsed(prev => {
        const next = !prev;
        localStorage.setItem('sidebar_collapsed', String(next));
        return next;
      });
    }
  };

  const closeSidebar = () => setSidebarOpen(false);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100 bg-light">
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status"></div>
          <p className="fw-semibold text-muted mb-0">Initializing Admin Control Portal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-wrapper">
      <AdminSidebar 
        mobileOpen={sidebarOpen} 
        collapsed={sidebarCollapsed} 
        closeSidebar={closeSidebar} 
        toggleSidebar={toggleSidebar} 
      />
      {sidebarOpen && <div className="sidebar-backdrop d-lg-none" onClick={closeSidebar}></div>}
      <div className={`main-content ${sidebarCollapsed ? 'expanded-full' : ''}`}>
        <AdminTopNav 
          user={adminUser} 
          handleLogout={handleLogout} 
          toggleSidebar={toggleSidebar} 
          sidebarCollapsed={sidebarCollapsed}
        />
        <main className="p-3 p-md-4 p-lg-5">
          <Outlet context={{ user: adminUser }} />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
