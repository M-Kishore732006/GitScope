import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  FaGithub, 
  FaSync, 
  FaExclamationCircle, 
  FaCheckCircle, 
  FaUnlink, 
  FaExternalLinkAlt, 
  FaBook, 
  FaCodeBranch, 
  FaSearch
} from 'react-icons/fa';
import '../../styles/dashboard.css';

const GithubAccounts = () => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncingId, setSyncingId] = useState(null);
  const [bulkSyncing, setBulkSyncing] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const [msg, setMsg] = useState({ text: '', type: '' });

  const token = JSON.parse(localStorage.getItem('userInfo'))?.token;

  const fetchAccounts = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const res = await axios.get('/api/admin/github/accounts', config);
      setAccounts(res.data || []);
    } catch (error) {
      console.error('Error fetching GitHub accounts:', error);
      setMsg({ text: 'Failed to fetch GitHub account status.', type: 'danger' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, [token]);

  // Sync single student GitHub data
  const handleSingleSync = async (account) => {
    setSyncingId(account.studentId);
    setMsg({ text: `Syncing @${account.githubUsername}...`, type: 'info' });
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const res = await axios.post(`/api/admin/github/sync/${account.studentId}`, {}, config);
      setMsg({ text: res.data.message, type: 'success' });
      fetchAccounts();
    } catch (error) {
      setMsg({ text: error.response?.data?.message || 'Sync failed', type: 'danger' });
    } finally {
      setSyncingId(null);
    }
  };

  // Bulk Sync All Linked Accounts
  const handleBulkSync = async () => {
    setBulkSyncing(true);
    setMsg({ text: 'Initiating backend bulk GitHub sync for all linked students...', type: 'info' });
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const res = await axios.post('/api/admin/github/sync-all', {}, config);
      setMsg({ text: res.data.message, type: 'success' });
      fetchAccounts();
    } catch (error) {
      setMsg({ text: error.response?.data?.message || 'Bulk sync failed', type: 'danger' });
    } finally {
      setBulkSyncing(false);
    }
  };

  // Disconnect GitHub Account
  const handleDisconnect = async (account) => {
    if (!window.confirm(`Disconnect GitHub account @${account.githubUsername} for ${account.fullName}?`)) return;

    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.post(`/api/admin/github/disconnect/${account.studentId}`, {}, config);
      setMsg({ text: `GitHub account disconnected.`, type: 'success' });
      fetchAccounts();
    } catch (error) {
      setMsg({ text: error.response?.data?.message || 'Failed to disconnect account', type: 'danger' });
    }
  };

  const filteredAccounts = accounts.filter(a => {
    const matchesSearch = (a.fullName || '').toLowerCase().includes(search.toLowerCase()) ||
                          (a.rollNumber || '').toLowerCase().includes(search.toLowerCase()) ||
                          (a.githubUsername || '').toLowerCase().includes(search.toLowerCase());
    const matchesStatus = !statusFilter || a.connectionStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="container-fluid px-0">
      {/* Header Banner */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 pb-2 border-bottom">
        <div>
          <h2 className="fw-bold mb-1 d-flex align-items-center">
            <FaGithub className="me-2 text-dark" /> GitHub Account Ecosystem
          </h2>
          <p className="text-muted mb-0">Monitor GitHub connections, trigger backend synchronization, and manage account links.</p>
        </div>
        <button 
          className="btn btn-dark fw-bold px-4 py-2 mt-3 mt-md-0 d-flex align-items-center shadow-sm"
          disabled={bulkSyncing}
          onClick={handleBulkSync}
        >
          <FaSync className={`me-2 ${bulkSyncing ? 'spin' : ''}`} /> {bulkSyncing ? 'Syncing All Accounts...' : 'Sync All Accounts'}
        </button>
      </div>

      {msg.text && (
        <div className={`alert alert-${msg.type} alert-dismissible fade show mb-4`} role="alert">
          {msg.text}
          <button type="button" className="btn-close" onClick={() => setMsg({ text: '', type: '' })}></button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="saas-card mb-4 p-3 bg-white">
        <div className="row g-3 align-items-center">
          <div className="col-12 col-md-6">
            <div className="search-bar d-flex align-items-center bg-light px-3 py-2 rounded-3 border">
              <FaSearch className="text-muted me-2" />
              <input 
                type="text" 
                placeholder="Search by Student Name, Roll No, GitHub handle..." 
                value={search} 
                onChange={(e) => setSearch(e.target.value)}
                className="border-0 bg-transparent flex-grow-1 outline-none small"
              />
            </div>
          </div>

          <div className="col-12 col-md-4">
            <select className="form-select bg-light border-1 small" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="">All Connection Statuses</option>
              <option value="Connected">Connected</option>
              <option value="Not Connected">Not Connected</option>
              <option value="Syncing">Syncing</option>
              <option value="Sync Failed">Sync Failed</option>
            </select>
          </div>

          <div className="col-12 col-md-2 text-end">
            <span className="badge bg-light text-dark border px-3 py-2 fw-semibold rounded-pill">
              Total: {filteredAccounts.length} Accounts
            </span>
          </div>
        </div>
      </div>

      {/* Table of GitHub Accounts */}
      <div className="saas-card overflow-hidden p-0 mb-4">
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-dark" role="status"></div>
            <p className="text-muted small mt-2">Scanning GitHub Connections...</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th scope="col" className="text-muted text-uppercase small fw-bold px-4 py-3 border-0">Student Name</th>
                  <th scope="col" className="text-muted text-uppercase small fw-bold py-3 border-0">Roll Number</th>
                  <th scope="col" className="text-muted text-uppercase small fw-bold py-3 border-0">GitHub Username</th>
                  <th scope="col" className="text-muted text-uppercase small fw-bold text-center py-3 border-0">Connection Status</th>
                  <th scope="col" className="text-muted text-uppercase small fw-bold text-center py-3 border-0">Repos</th>
                  <th scope="col" className="text-muted text-uppercase small fw-bold py-3 border-0">Last Synced</th>
                  <th scope="col" className="text-muted text-uppercase small fw-bold text-end px-4 py-3 border-0">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAccounts.length > 0 ? (
                  filteredAccounts.map((account, idx) => {
                    const isSyncing = syncingId === account.studentId;
                    return (
                      <tr key={idx} className="border-bottom">
                        <td className="px-4 py-3">
                          <div className="fw-bold text-dark">{account.fullName}</div>
                          <div className="text-muted small">{account.email} • {account.department}</div>
                        </td>

                        <td className="fw-semibold text-dark small">{account.rollNumber}</td>

                        <td>
                          {account.githubLinked ? (
                            <a 
                              href={`https://github.com/${account.githubUsername}`} 
                              target="_blank" 
                              rel="noreferrer" 
                              className="fw-bold text-dark text-decoration-none d-inline-flex align-items-center hover-underline"
                            >
                              @{account.githubUsername} <FaExternalLinkAlt className="ms-1 text-muted" style={{ fontSize: '0.7rem' }} />
                            </a>
                          ) : (
                            <span className="text-muted small italic">Not Linked</span>
                          )}
                        </td>

                        <td className="text-center">
                          <span className={`badge px-3 py-2 rounded-pill fw-bold ${
                            account.connectionStatus === 'Connected' ? 'bg-success' :
                            account.connectionStatus === 'Sync Failed' ? 'bg-danger' :
                            account.connectionStatus === 'Syncing' ? 'bg-info text-dark' : 'bg-secondary'
                          }`}>
                            {account.connectionStatus}
                          </span>
                        </td>

                        <td className="text-center fw-bold text-dark">{account.repositoryCount || 0}</td>

                        <td className="small text-muted">
                          {account.lastUpdated ? new Date(account.lastUpdated).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : 'Never'}
                        </td>

                        <td className="text-end px-4">
                          <div className="d-flex justify-content-end gap-2">
                            {account.githubLinked && (
                              <button 
                                className="btn btn-sm btn-outline-dark fw-bold d-flex align-items-center"
                                disabled={isSyncing}
                                onClick={() => handleSingleSync(account)}
                                title="Force Backend Sync"
                              >
                                <FaSync className={`me-1 ${isSyncing ? 'spin' : ''}`} /> {isSyncing ? 'Syncing...' : 'Sync'}
                              </button>
                            )}

                            {account.githubLinked && (
                              <button 
                                className="btn btn-sm btn-outline-danger fw-bold d-flex align-items-center"
                                onClick={() => handleDisconnect(account)}
                                title="Unlink GitHub Account"
                              >
                                <FaUnlink className="me-1" /> Disconnect
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center py-5 text-muted">No GitHub accounts found matching criteria.</td>
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

export default GithubAccounts;
