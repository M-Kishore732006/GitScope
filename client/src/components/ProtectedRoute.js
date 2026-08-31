import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = ({ allowedRoles }) => {
  const userInfoStr = localStorage.getItem('userInfo');
  const userInfo = userInfoStr ? JSON.parse(userInfoStr) : null;

  if (!userInfo) {
    return <Navigate to="/login" replace />;
  }

  const userRole = userInfo.role;
  const expandedAllowedRoles = allowedRoles ? allowedRoles.flatMap(r => r === 'staff' || r === 'teacher' ? ['staff', 'teacher'] : [r]) : null;

  if (expandedAllowedRoles && !expandedAllowedRoles.includes(userRole)) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
