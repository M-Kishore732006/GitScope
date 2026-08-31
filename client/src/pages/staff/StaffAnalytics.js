import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaChartLine, FaChartBar, FaChartPie, FaCalendarAlt } from 'react-icons/fa';

const StaffAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [period, setPeriod] = useState('30d');
  const [loading, setLoading] = useState(true);

  const token = JSON.parse(localStorage.getItem('userInfo'))?.token;

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const res = await axios.get(`/api/staff/analytics?period=${period}`, config);
        setAnalytics(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [period, token]);

  const { totals, languageDistribution, monthlyCommitTrends } = analytics || {};

  return (
    <div className="staff-analytics">
      <div className="d-flex flex-wrap align-items-center justify-content-between mb-4 gap-3">
        <div>
          <h2 className="fw-bold text-dark mb-1">Assigned Student Analytics</h2>
          <p className="text-muted small mb-0">
            Visual trends and telemetry distributions for students under your guidance.
          </p>
        </div>
        <div className="d-flex align-items-center bg-white p-1 rounded-3 border shadow-sm">
          <FaCalendarAlt className="text-muted ms-2 me-1" />
          <select className="form-select border-0 bg-transparent text-dark fw-bold small" value={period} onChange={(e) => setPeriod(e.target.value)}>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="3m">Last 3 Months</option>
            <option value="semester">This Semester</option>
            <option value="year">Academic Year</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary me-2" role="status"></div>
          <span className="fw-semibold text-muted">Calculating analytics distributions...</span>
        </div>
      ) : (
        <>
          {/* Top Aggregate Cards */}
          <div className="row g-3 mb-4">
            <div className="col-6 col-lg-3">
              <div className="saas-card text-center p-3">
                <span className="text-muted small fw-semibold">Assigned Students</span>
                <h3 className="fw-bold text-dark mb-0 mt-1">{totals?.assignedStudents || 0}</h3>
              </div>
            </div>
            <div className="col-6 col-lg-3">
              <div className="saas-card text-center p-3">
                <span className="text-muted small fw-semibold">Repositories</span>
                <h3 className="fw-bold text-primary mb-0 mt-1">{totals?.repositories || 0}</h3>
              </div>
            </div>
            <div className="col-6 col-lg-3">
              <div className="saas-card text-center p-3">
                <span className="text-muted small fw-semibold">Total Commits</span>
                <h3 className="fw-bold text-success mb-0 mt-1">{totals?.commits || 0}</h3>
              </div>
            </div>
            <div className="col-6 col-lg-3">
              <div className="saas-card text-center p-3">
                <span className="text-muted small fw-semibold">Pull Requests</span>
                <h3 className="fw-bold text-info mb-0 mt-1">{totals?.pullRequests || 0}</h3>
              </div>
            </div>
          </div>

          {/* Visual Charts & Breakdown */}
          <div className="row g-4 mb-4">
            {/* Monthly Commit Trends Bar Graph Simulation */}
            <div className="col-12 col-lg-8">
              <div className="saas-card h-100">
                <h5 className="fw-bold text-dark mb-3 d-flex align-items-center">
                  <FaChartBar className="me-2 text-primary" /> Commit Activity Trends
                </h5>
                {monthlyCommitTrends && monthlyCommitTrends.length > 0 ? (
                  <div className="d-flex align-items-end justify-content-between pt-4 pb-2 px-3 border-bottom" style={{ height: '220px' }}>
                    {monthlyCommitTrends.map((item, idx) => (
                      <div key={idx} className="d-flex flex-column align-items-center flex-grow-1 mx-1">
                        <span className="extra-small fw-bold text-primary mb-1">{item.commits}</span>
                        <div 
                          className="bg-primary rounded-top w-100" 
                          style={{ height: `${Math.min(180, Math.max(20, item.commits * 3))}px`, transition: 'all 0.3s ease' }}
                        ></div>
                        <span className="extra-small text-muted mt-2 fw-semibold">{item.month}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-5 text-muted">No monthly commit trends recorded.</div>
                )}
              </div>
            </div>

            {/* Language Distribution Breakdown */}
            <div className="col-12 col-lg-4">
              <div className="saas-card h-100">
                <h5 className="fw-bold text-dark mb-3 d-flex align-items-center">
                  <FaChartPie className="me-2 text-warning" /> Language Distribution
                </h5>
                {languageDistribution && languageDistribution.length > 0 ? (
                  <div className="list-group list-group-flush">
                    {languageDistribution.map((lang, idx) => (
                      <div key={idx} className="list-group-item d-flex justify-content-between align-items-center border-0 px-0 py-2">
                        <span className="fw-semibold text-dark small">{lang.language}</span>
                        <span className="badge bg-primary-subtle text-primary rounded-pill px-3 py-1">
                          {lang.count} Projects
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-5 text-muted">No language distribution data.</div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default StaffAnalytics;
