import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaGithub, FaBook, FaCodeBranch, FaExclamationCircle, FaSearch } from 'react-icons/fa';
import StaffStudentProfileModal from './StaffStudentProfileModal';

const StaffGithubActivity = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState(null);

  const token = JSON.parse(localStorage.getItem('userInfo'))?.token;

  useEffect(() => {
    const fetchStudents = async () => {
      setLoading(true);
      try {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const res = await axios.get('/api/staff/students', config);
        setStudents(res.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, [token]);

  const filtered = students.filter(s => 
    s.fullName?.toLowerCase().includes(search.toLowerCase()) || 
    s.githubUsername?.toLowerCase().includes(search.toLowerCase()) ||
    s.rollNumber?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="staff-github-activity">
      <div className="d-flex flex-wrap align-items-center justify-content-between mb-4 gap-3">
        <div>
          <h2 className="fw-bold text-dark mb-1">Assigned Student GitHub Telemetry</h2>
          <p className="text-muted small mb-0">Browse repositories, commit logs, pull requests, and issues across assigned students.</p>
        </div>
      </div>

      <div className="saas-card mb-4">
        <div className="input-group shadow-sm" style={{ maxWidth: '400px' }}>
          <span className="input-group-text bg-light border-end-0"><FaSearch className="text-muted" /></span>
          <input 
            type="text" 
            className="form-control border-start-0 bg-light" 
            placeholder="Search by student name or GitHub handle..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="saas-card">
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary me-2" role="status"></div>
            <span className="fw-semibold text-muted">Loading telemetry data...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-4 text-muted">No students found matching query.</div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Student</th>
                  <th>GitHub Handle</th>
                  <th>Repositories</th>
                  <th>Commits</th>
                  <th>Pull Requests</th>
                  <th>Issues</th>
                  <th>Score</th>
                  <th className="text-end">Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((st) => (
                  <tr key={st._id}>
                    <td>
                      <div className="fw-bold text-dark">{st.fullName}</div>
                      <div className="text-muted extra-small">{st.department} (Y{st.year})</div>
                    </td>
                    <td>
                      {st.githubLinked ? (
                        <span className="fw-semibold text-primary">@{st.githubUsername}</span>
                      ) : (
                        <span className="text-muted small">Not Linked</span>
                      )}
                    </td>
                    <td><span className="badge bg-light text-dark border"><FaBook className="me-1" />{st.totalRepositories || 0}</span></td>
                    <td className="fw-bold">{st.totalCommits || 0}</td>
                    <td className="fw-bold text-primary">{st.totalPRs || 0}</td>
                    <td className="fw-bold text-warning">{st.totalIssues || 0}</td>
                    <td><span className="badge bg-primary">{st.contributionScore || 0} pts</span></td>
                    <td className="text-end">
                      <button className="btn btn-sm btn-outline-primary fw-bold" onClick={() => setSelectedStudentId(st._id)}>
                        View Activity
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedStudentId && (
        <StaffStudentProfileModal 
          studentId={selectedStudentId} 
          onClose={() => setSelectedStudentId(null)} 
        />
      )}
    </div>
  );
};

export default StaffGithubActivity;
