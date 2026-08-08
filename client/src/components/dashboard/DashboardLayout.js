import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopNav from './TopNav';
import '../../styles/dashboard.css';

const DashboardLayout = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [clientId, setClientId] = useState('');

  const userInfoStr = localStorage.getItem('userInfo');
  const userInfo = userInfoStr ? JSON.parse(userInfoStr) : null;
  const token = userInfo?.token;

  const fetchDashboardData = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await axios.get('/api/student/dashboard', config);
      setData(response.data);
      if (response.data.clientId) setClientId(response.data.clientId);
    } catch (error) {
       if (error.response?.status === 401) {
           localStorage.removeItem('userInfo');
           navigate('/login');
       }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) {
       navigate('/login');
       return;
    }
    fetchDashboardData();
    // eslint-disable-next-line
  }, [token]);

  const handleLogout = () => {
     localStorage.removeItem('userInfo');
     window.location.href = '/login';
  };

  if (loading) {
    return <div className="d-flex justify-content-center align-items-center min-vh-100 bg-light">Loading Workspace...</div>;
  }

  const { user, stats } = data || {};

  return (
    <div className="dashboard-wrapper">
       <Sidebar />
       
       <div className="main-content">
          <TopNav user={user} stats={stats} handleLogout={handleLogout} />
          
          <Outlet context={{ user, stats, clientId, fetchDashboardData }} />
       </div>
    </div>
  );
};

export default DashboardLayout;
