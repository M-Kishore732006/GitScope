import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaBell, FaExclamationCircle, FaCheckCircle, FaUserGraduate } from 'react-icons/fa';

const StaffNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = JSON.parse(localStorage.getItem('userInfo'))?.token;

  useEffect(() => {
    const fetchNotifs = async () => {
      setLoading(true);
      try {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const res = await axios.get('/api/staff/notifications', config);
        setNotifications(res.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchNotifs();
  }, [token]);

  return (
    <div className="staff-notifications">
      <div className="d-flex flex-wrap align-items-center justify-content-between mb-4 gap-3">
        <div>
          <h2 className="fw-bold text-dark mb-1">Student Alerts &amp; Notifications</h2>
          <p className="text-muted small mb-0">
            Real-time updates regarding GitHub connections, sync status, and inactivity thresholds for assigned students.
          </p>
        </div>
      </div>

      <div className="saas-card">
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary me-2" role="status"></div>
            <span className="fw-semibold text-muted">Loading notification history...</span>
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-5 text-muted">
            <FaBell className="fs-1 opacity-25 mb-3" />
            <h6 className="fw-bold">No Pending Alerts</h6>
            <p className="small mb-0">All assigned student activities are up to date.</p>
          </div>
        ) : (
          <div className="list-group list-group-flush">
            {notifications.map((n, idx) => (
              <div key={idx} className="list-group-item p-3 d-flex align-items-start border-bottom">
                <div className="avatar-circle me-3 bg-primary-subtle text-primary mt-1">
                  <FaUserGraduate />
                </div>
                <div className="flex-grow-1">
                  <div className="d-flex justify-content-between align-items-center">
                    <h6 className="fw-bold text-dark mb-1">{n.title || 'Student Update'}</h6>
                    <small className="text-muted">{new Date(n.createdAt || Date.now()).toLocaleString()}</small>
                  </div>
                  <p className="text-muted small mb-0">{n.message}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StaffNotifications;
