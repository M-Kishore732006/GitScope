import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const PublicRoute = () => {
  const userInfoStr = localStorage.getItem('userInfo');
  const userInfo = userInfoStr ? JSON.parse(userInfoStr) : null;

  if (userInfo) {
     if (userInfo.role === 'student' && !userInfo.profileCompleted) {
        return <Navigate to="/student/profile" replace />;
     }
     return <Navigate to={`/${userInfo.role}/dashboard`} replace />;
  }

  return <Outlet />;
};

export default PublicRoute;
