import React from 'react';
import { FaEnvelope, FaIdBadge, FaGraduationCap } from 'react-icons/fa';

const ProfileWidget = ({ user }) => {
  if (!user) return null;

  return (
    <div className="saas-card mb-4 text-center">
       <div className="d-flex justify-content-center mb-3">
          <div className="rounded-circle bg-primary bg-opacity-10 d-flex align-items-center justify-content-center text-primary fw-bold shadow-sm" style={{width: '90px', height: '90px', fontSize: '2.5rem', border: '4px solid white'}}>
             {user.fullName?.charAt(0) || user.username?.charAt(0) || 'U'}
          </div>
       </div>
       <h4 className="fw-bold mb-1">{user.fullName || user.username}</h4>
       <p className="text-muted small mb-3">@{user.username}</p>
       
       <div className="d-flex flex-column text-start gap-2 pt-3 border-top">
          <div className="d-flex align-items-center text-muted small">
             <FaEnvelope className="me-3 text-secondary" style={{width: '16px'}} />
             <span className="text-truncate fw-medium">{user.email}</span>
          </div>
          {user.rollNumber && (
             <div className="d-flex align-items-center text-muted small">
                <FaIdBadge className="me-3 text-secondary" style={{width: '16px'}} />
                <span className="fw-medium">{user.rollNumber}</span>
             </div>
          )}
          {user.department && (
             <div className="d-flex align-items-center text-muted small">
                <FaGraduationCap className="me-3 text-secondary" style={{width: '16px'}} />
                <span className="fw-medium">{user.department} {user.year ? `- ${user.year}` : ''}</span>
             </div>
          )}
       </div>
    </div>
  );
};

export default ProfileWidget;
