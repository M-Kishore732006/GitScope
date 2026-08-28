import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaHistory, FaShieldAlt, FaSearch } from 'react-icons/fa';
import '../../styles/dashboard.css';

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const token = JSON.parse(localStorage.getItem('userInfo'))?.token;

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const res = await axios.get('/api/admin/audit-logs', config);
        setLogs(res.data || []);
      } catch (error) {
        console.error('Error fetching audit logs:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, [token]);

  const filteredLogs = logs.filter(l => 
    (l.action || '').toLowerCase().includes(search.toLowerCase()) ||
    (l.target || '').toLowerCase().includes(search.toLowerCase()) ||
    (l.userEmail || '').toLowerCase().includes(search.toLowerCase()) ||
    (l.description || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container-fluid px-0">
      {/* Header Banner */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 pb-2 border-bottom">
        <div>
          <h2 className="fw-bold mb-1 d-flex align-items-center">
            <FaHistory className="me-2 text-dark" /> System Audit & Governance Trail
          </h2>
          <p className="text-muted mb-0">Immutable system logs recording admin actions, staff modifications, student updates, and GitHub synchronization events.</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="saas-card mb-4 p-3 bg-white">
        <div className="search-bar d-flex align-items-center bg-light px-3 py-2 rounded-3 border" style={{ maxWidth: '500px' }}>
          <FaSearch className="text-muted me-2" />
          <input 
            type="text" 
            placeholder="Search audit actions, target, admin email..." 
            value={search} 
            onChange={(e) => setSearch(e.target.value)}
            className="border-0 bg-transparent flex-grow-1 outline-none small"
          />
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="saas-card overflow-hidden p-0 mb-4">
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-dark" role="status"></div>
            <p className="text-muted small mt-2">Retrieving Security Logs...</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th scope="col" className="text-muted text-uppercase small fw-bold px-4 py-3 border-0">Timestamp</th>
                  <th scope="col" className="text-muted text-uppercase small fw-bold py-3 border-0">User & Role</th>
                  <th scope="col" className="text-muted text-uppercase small fw-bold py-3 border-0">Action Event</th>
                  <th scope="col" className="text-muted text-uppercase small fw-bold py-3 border-0">Target Entity</th>
                  <th scope="col" className="text-muted text-uppercase small fw-bold py-3 border-0">Description</th>
                  <th scope="col" className="text-muted text-uppercase small fw-bold text-end px-4 py-3 border-0">IP Address</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.length > 0 ? (
                  filteredLogs.map((log, idx) => (
                    <tr key={idx} className="border-bottom">
                      <td className="small text-muted px-4 py-3">
                        {new Date(log.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'medium' })}
                      </td>

                      <td>
                        <div className="fw-bold text-dark small">{log.userEmail}</div>
                        <span className="badge bg-dark text-warning" style={{ fontSize: '0.65rem' }}>{log.userRole}</span>
                      </td>

                      <td>
                        <span className="badge bg-primary text-white fw-bold px-2 py-1" style={{ fontSize: '0.7rem' }}>
                          {log.action}
                        </span>
                      </td>

                      <td className="fw-semibold text-dark small">{log.target}</td>
                      <td className="text-muted small">{log.description}</td>
                      <td className="text-end px-4 text-muted small font-monospace">{log.ipAddress}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center py-5 text-muted">No audit logs matching search criteria.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuditLogs;
