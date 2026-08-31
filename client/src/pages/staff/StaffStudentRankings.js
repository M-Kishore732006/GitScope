import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaTrophy, FaMedal, FaFilter, FaInfoCircle } from 'react-icons/fa';

const StaffStudentRankings = () => {
  const [rankings, setRankings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('score');
  const [period, setPeriod] = useState('all');

  const token = JSON.parse(localStorage.getItem('userInfo'))?.token;

  useEffect(() => {
    const fetchRankings = async () => {
      setLoading(true);
      try {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const res = await axios.get(`/api/staff/rankings?sortBy=${sortBy}&period=${period}`, config);
        setRankings(res.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchRankings();
  }, [sortBy, period, token]);

  return (
    <div className="staff-student-rankings">
      <div className="d-flex flex-wrap align-items-center justify-content-between mb-4 gap-3">
        <div>
          <h2 className="fw-bold text-dark mb-1">Assigned Student Leaderboard</h2>
          <p className="text-muted small mb-0">
            Rankings and performance benchmarks restricted to students under your supervision.
          </p>
        </div>
      </div>

      <div className="alert alert-info border-0 shadow-sm mb-4 d-flex align-items-center">
        <FaInfoCircle className="fs-4 me-3 flex-shrink-0" />
        <div>
          <strong>Note:</strong> The contribution score displayed below is an <strong>application-generated contribution score</strong> calculated from weighted GitHub activity (commits, pull requests, code reviews, and open-source contributions) based on institution configuration. It is not an official GitHub score.
        </div>
      </div>

      {/* Filters */}
      <div className="saas-card mb-4">
        <div className="row g-3 align-items-center">
          <div className="col-12 col-md-6">
            <label className="form-label small fw-bold text-muted">Sort By Metric</label>
            <select className="form-select bg-light" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="score">Overall Contribution Score</option>
              <option value="commits">Total Commits</option>
              <option value="prs">Merged Pull Requests</option>
              <option value="issues">Issues</option>
              <option value="openSource">Open-Source Contributions</option>
            </select>
          </div>

          <div className="col-12 col-md-6">
            <label className="form-label small fw-bold text-muted">Time Frame Filter</label>
            <select className="form-select bg-light" value={period} onChange={(e) => setPeriod(e.target.value)}>
              <option value="all">All Time</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="semester">This Semester</option>
              <option value="year">This Year</option>
            </select>
          </div>
        </div>
      </div>

      {/* Rankings Table */}
      <div className="saas-card">
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary me-2" role="status"></div>
            <span className="fw-semibold text-muted">Computing student leaderboard...</span>
          </div>
        ) : rankings.length === 0 ? (
          <div className="text-center py-4 text-muted">No student rankings data available.</div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th style={{ width: '70px' }}>Rank</th>
                  <th>Student Name</th>
                  <th>Roll No</th>
                  <th>Department</th>
                  <th>Commits</th>
                  <th>PRs</th>
                  <th>Issues</th>
                  <th>Open-Source</th>
                  <th>Contribution Score</th>
                </tr>
              </thead>
              <tbody>
                {rankings.map((r) => (
                  <tr key={r.studentId}>
                    <td>
                      <span className={`badge rounded-circle p-2 ${r.rank === 1 ? 'bg-warning text-dark' : r.rank === 2 ? 'bg-secondary text-white' : r.rank === 3 ? 'bg-danger-subtle text-danger' : 'bg-light text-dark'}`}>
                        #{r.rank}
                      </span>
                    </td>
                    <td className="fw-bold text-dark">{r.name}</td>
                    <td className="small text-muted">{r.rollNumber}</td>
                    <td><span className="badge bg-light text-dark border">{r.department}</span></td>
                    <td className="fw-bold">{r.commits}</td>
                    <td className="fw-bold text-primary">{r.prs}</td>
                    <td className="fw-bold text-warning">{r.issues}</td>
                    <td className="fw-bold text-info">{r.openSource}</td>
                    <td>
                      <span className="badge bg-primary px-3 py-2 fs-6">{r.score} pts</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default StaffStudentRankings;
