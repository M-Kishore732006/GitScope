import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaTrophy, FaMedal, FaFilter, FaCrown, FaUserGraduate, FaCodeBranch, FaCheckCircle, FaCode } from 'react-icons/fa';
import '../../styles/dashboard.css';

const StudentRankings = () => {
  const [rankings, setRankings] = useState([]);
  const [loading, setLoading] = useState(true);

  const [department, setDepartment] = useState('');
  const [year, setYear] = useState('');
  const [sortBy, setSortBy] = useState('score');

  const token = JSON.parse(localStorage.getItem('userInfo'))?.token;

  useEffect(() => {
    const fetchRankings = async () => {
      setLoading(true);
      try {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        let queryParams = [];
        if (department) queryParams.push(`department=${encodeURIComponent(department)}`);
        if (year) queryParams.push(`year=${encodeURIComponent(year)}`);
        if (sortBy) queryParams.push(`sortBy=${sortBy}`);

        const queryString = queryParams.length > 0 ? `?${queryParams.join('&')}` : '';

        const res = await axios.get(`/api/admin/rankings${queryString}`, config);
        setRankings(res.data || []);
      } catch (error) {
        console.error('Error fetching rankings:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchRankings();
  }, [token, department, year, sortBy]);

  return (
    <div className="container-fluid px-0">
      {/* Header Banner */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 pb-2 border-bottom">
        <div>
          <h2 className="fw-bold mb-1 d-flex align-items-center">
            <FaTrophy className="me-2 text-warning" /> Student Activity Rankings & Leaderboard
          </h2>
          <p className="text-muted mb-0">Calculated application activity scores based on GitHub commits, pull requests, issues, and code reviews.</p>
        </div>
      </div>

      {/* Filter & Sorter Toolbar */}
      <div className="saas-card mb-4 p-3 bg-white">
        <div className="row g-3 align-items-center">
          <div className="col-12 col-md-4">
            <label className="form-label text-muted small fw-bold mb-1">SORT METRIC</label>
            <select className="form-select bg-light border-1 small fw-bold" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="score">Overall Activity Score (Points)</option>
              <option value="commits">Total Commits</option>
              <option value="prs">Merged Pull Requests</option>
              <option value="issues">Total Issues</option>
            </select>
          </div>

          <div className="col-6 col-md-3">
            <label className="form-label text-muted small fw-bold mb-1">DEPARTMENT</label>
            <select className="form-select bg-light border-1 small" value={department} onChange={(e) => setDepartment(e.target.value)}>
              <option value="">All Departments</option>
              <option value="CSE">CSE</option>
              <option value="AI & DS">AI & DS</option>
              <option value="IT">IT</option>
              <option value="ECE">ECE</option>
              <option value="EEE">EEE</option>
              <option value="MECH">MECH</option>
            </select>
          </div>

          <div className="col-6 col-md-3">
            <label className="form-label text-muted small fw-bold mb-1">ACADEMIC YEAR</label>
            <select className="form-select bg-light border-1 small" value={year} onChange={(e) => setYear(e.target.value)}>
              <option value="">All Years</option>
              <option value="1">1st Year</option>
              <option value="2">2nd Year</option>
              <option value="3">3rd Year</option>
              <option value="4">4th Year</option>
            </select>
          </div>

          <div className="col-12 col-md-2 text-end">
            <span className="badge bg-primary px-3 py-2 fw-bold rounded-pill text-white mt-4">
              {rankings.length} Ranked
            </span>
          </div>
        </div>
      </div>

      {/* Podium Top 3 Highlight */}
      {rankings.length >= 3 && !department && !year && (
        <div className="row g-3 mb-4">
          {/* Rank 2 */}
          <div className="col-12 col-md-4 order-2 order-md-1">
            <div className="saas-card text-center p-4 h-100 border-top border-secondary border-4">
              <div className="avatar-circle mx-auto mb-2 bg-secondary text-white fs-3 fw-bold" style={{ width: 50, height: 50 }}>
                2
              </div>
              <h5 className="fw-bold mb-1">{rankings[1].name}</h5>
              <p className="text-muted small mb-2">{rankings[1].department} • Year {rankings[1].year}</p>
              <span className="badge bg-secondary px-3 py-2 fw-bold fs-6">{rankings[1].score} Pts</span>
            </div>
          </div>

          {/* Rank 1 */}
          <div className="col-12 col-md-4 order-1 order-md-2">
            <div className="saas-card text-center p-4 h-100 border-top border-warning border-5 shadow">
              <FaCrown className="text-warning fs-2 mb-1" />
              <div className="avatar-circle mx-auto mb-2 bg-warning text-dark fs-2 fw-bold" style={{ width: 60, height: 60 }}>
                1
              </div>
              <h4 className="fw-bold mb-1 text-dark">{rankings[0].name}</h4>
              <p className="text-muted small mb-2">{rankings[0].department} • Year {rankings[0].year}</p>
              <span className="badge bg-warning text-dark px-4 py-2 fw-bold fs-5 shadow-sm">{rankings[0].score} Pts</span>
            </div>
          </div>

          {/* Rank 3 */}
          <div className="col-12 col-md-4 order-3 order-md-3">
            <div className="saas-card text-center p-4 h-100 border-top border-danger border-4">
              <div className="avatar-circle mx-auto mb-2 bg-danger text-white fs-3 fw-bold" style={{ width: 50, height: 50 }}>
                3
              </div>
              <h5 className="fw-bold mb-1">{rankings[2].name}</h5>
              <p className="text-muted small mb-2">{rankings[2].department} • Year {rankings[2].year}</p>
              <span className="badge bg-danger px-3 py-2 fw-bold fs-6">{rankings[2].score} Pts</span>
            </div>
          </div>
        </div>
      )}

      {/* Rankings Leaderboard Table */}
      <div className="saas-card overflow-hidden p-0 mb-4">
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-warning" role="status"></div>
            <p className="text-muted small mt-2">Computing Leaderboards...</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th scope="col" className="text-muted text-uppercase small fw-bold px-4 py-3 border-0">Rank</th>
                  <th scope="col" className="text-muted text-uppercase small fw-bold py-3 border-0">Student</th>
                  <th scope="col" className="text-muted text-uppercase small fw-bold py-3 border-0">Department</th>
                  <th scope="col" className="text-muted text-uppercase small fw-bold text-center py-3 border-0">Commits</th>
                  <th scope="col" className="text-muted text-uppercase small fw-bold text-center py-3 border-0">Merged PRs</th>
                  <th scope="col" className="text-muted text-uppercase small fw-bold text-center py-3 border-0">Issues</th>
                  <th scope="col" className="text-muted text-uppercase small fw-bold text-center py-3 border-0">Tier Level</th>
                  <th scope="col" className="text-muted text-uppercase small fw-bold text-end px-4 py-3 border-0">Activity Score</th>
                </tr>
              </thead>
              <tbody>
                {rankings.length > 0 ? (
                  rankings.map((r, idx) => (
                    <tr key={idx} className="border-bottom">
                      <td className="px-4 py-3 fw-bold text-dark fs-6">
                        {r.rank === 1 ? <FaCrown className="text-warning me-1" /> :
                         r.rank === 2 ? <FaMedal className="text-secondary me-1" /> :
                         r.rank === 3 ? <FaMedal className="text-danger me-1" /> : `#${r.rank}`}
                      </td>

                      <td>
                        <div className="fw-bold text-dark">{r.name}</div>
                        <div className="text-muted small">Roll: {r.rollNumber}</div>
                      </td>

                      <td className="fw-semibold text-dark small">{r.department} (Yr {r.year})</td>

                      <td className="text-center fw-bold text-dark">{r.commits}</td>
                      <td className="text-center fw-bold text-success">{r.prs}</td>
                      <td className="text-center fw-bold text-danger">{r.issues}</td>

                      <td className="text-center">
                        <span className="badge bg-warning text-dark fw-bold">{r.level}</span>
                      </td>

                      <td className="text-end px-4">
                        <span className="fw-extrabold text-primary fs-5">{r.score}</span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="text-center py-5 text-muted">No student rankings found matching criteria.</td>
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

export default StudentRankings;
