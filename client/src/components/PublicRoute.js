import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const PublicRoute = () => {
  const userInfoStr = localStorage.getItem('userInfo');
  const userInfo = userInfoStr ? JSON.parse(userInfoStr) : null;

  if (userInfo) {
     return <Navigate to={`/${userInfo.role}/dashboard`} replace />;
  }

  return <Outlet />;
};

export default PublicRoute;
