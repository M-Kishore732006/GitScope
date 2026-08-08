import React from 'react';
import { FaCodeBranch, FaExclamationCircle, FaCode, FaGithub, FaStar } from 'react-icons/fa';

const ActivityTimeline = ({ recentActivity }) => {
  if (!recentActivity || recentActivity.length === 0) {
    return (
       <div className="card shadow-sm border-0 h-100 p-4 d-flex align-items-center justify-content-center text-muted">
          <p className="mb-0">No recent activity detected.</p>
       </div>
    );
  }

  const getEventDetails = (event) => {
    switch (event.type) {
      case 'PushEvent': return { icon: FaCode, color: 'primary', label: 'Pushed commits to' };
      case 'PullRequestEvent': return { icon: FaCodeBranch, color: 'success', label: `Pull request ${event.action} in` };
      case 'IssuesEvent': return { icon: FaExclamationCircle, color: 'danger', label: `Issue ${event.action} in` };
      case 'CreateEvent': return { icon: FaStar, color: 'warning', label: 'Created repository/branch in' };
      default: return { icon: FaGithub, color: 'secondary', label: `Activity in` };
    }
  };

  return (
    <div className="card saas-card">
       <h5 className="fw-bold mb-4">Recent Activity Timeline</h5>
       <div className="timeline-container px-2">
          {recentActivity.map((activity, idx) => {
             const details = getEventDetails(activity);
             const Icon = details.icon;
             return (
                <div key={idx} className="timeline-item">
                   <div className={`timeline-icon text-${details.color}`}>
                      <Icon />
                   </div>
                   <div className="timeline-content">
                      <div className="d-flex justify-content-between align-items-start">
                         <p className="mb-1 fw-semibold small text-dark">
                            <span className="text-muted fw-normal">{details.label}</span> {activity.repoName}
                         </p>
                         <span className="badge bg-light text-muted border" style={{fontSize: '0.65rem'}}>
                            {new Date(activity.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                         </span>
                      </div>
                   </div>
                </div>
             );
          })}
       </div>
    </div>
  );
};

export default ActivityTimeline;
