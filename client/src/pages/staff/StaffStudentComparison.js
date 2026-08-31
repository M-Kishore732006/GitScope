import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaExchangeAlt, FaUserGraduate, FaCheckSquare } from 'react-icons/fa';

const StaffStudentComparison = () => {
  const [assignedStudents, setAssignedStudents] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [comparisonData, setComparisonData] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = JSON.parse(localStorage.getItem('userInfo'))?.token;

  useEffect(() => {
    const fetchStudents = async () => {
      setLoading(true);
      try {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const res = await axios.get('/api/staff/students', config);
        const list = res.data || [];
        setAssignedStudents(list);
        if (list.length >= 2) {
          setSelectedIds([list[0]._id, list[1]._id]);
        } else if (list.length === 1) {
          setSelectedIds([list[0]._id]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, [token]);

  useEffect(() => {
    const fetchComparison = async () => {
      if (selectedIds.length === 0) {
        setComparisonData([]);
        return;
      }
      try {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const res = await axios.get(`/api/staff/compare?studentIds=${selectedIds.join(',')}`, config);
        setComparisonData(res.data || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchComparison();
  }, [selectedIds, token]);

  const toggleSelectStudent = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id));
    } else {
      if (selectedIds.length >= 4) {
        alert('You can compare a maximum of 4 students simultaneously.');
        return;
      }
      setSelectedIds([...selectedIds, id]);
    }
  };

  return (
    <div className="staff-student-comparison">
      <div className="d-flex flex-wrap align-items-center justify-content-between mb-4 gap-3">
        <div>
          <h2 className="fw-bold text-dark mb-1">Assigned Student Comparison</h2>
          <p className="text-muted small mb-0">
            Compare GitHub activity metrics side-by-side across assigned students.
          </p>
        </div>
      </div>

      {/* Student Selection Checklist */}
      <div className="saas-card mb-4">
        <h6 className="fw-bold text-dark mb-3">Select Students to Compare (Up to 4)</h6>
        {loading ? (
          <div className="spinner-border spinner-border-sm text-primary" role="status"></div>
        ) : (
          <div className="d-flex flex-wrap gap-2">
            {assignedStudents.map((st) => (
              <button
                key={st._id}
                type="button"
                className={`btn btn-sm ${selectedIds.includes(st._id) ? 'btn-primary' : 'btn-outline-secondary'} rounded-pill px-3 py-1 fw-semibold`}
                onClick={() => toggleSelectStudent(st._id)}
              >
                {selectedIds.includes(st._id) && <FaCheckSquare className="me-1" />}
                {st.fullName} ({st.department})
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Comparison Matrix Table */}
      <div className="saas-card">
        <h5 className="fw-bold text-dark mb-3">Telemetry Metric Comparison Matrix</h5>
        {comparisonData.length === 0 ? (
          <div className="text-center py-5 text-muted">Select at least one assigned student above to view metrics comparison.</div>
        ) : (
          <div className="table-responsive">
            <table className="table table-bordered align-middle text-center mb-0">
              <thead className="table-dark">
                <tr>
                  <th className="text-start" style={{ width: '220px' }}>Metric</th>
                  {comparisonData.map((st, idx) => (
                    <th key={idx}>
                      <div className="fw-bold">{st.name}</div>
                      <div className="extra-small opacity-75">@{st.githubUsername}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="fw-semibold text-start">Department</td>
                  {comparisonData.map((st, idx) => (
                    <td key={idx}><span className="badge bg-light text-dark border">{st.department}</span></td>
                  ))}
                </tr>
                <tr>
                  <td className="fw-semibold text-start">Repositories</td>
                  {comparisonData.map((st, idx) => <td key={idx} className="fw-bold">{st.repositories}</td>)}
                </tr>
                <tr>
                  <td className="fw-semibold text-start">Total Commits</td>
                  {comparisonData.map((st, idx) => <td key={idx} className="fw-bold text-primary fs-5">{st.commits}</td>)}
                </tr>
                <tr>
                  <td className="fw-semibold text-start">Pull Requests</td>
                  {comparisonData.map((st, idx) => <td key={idx} className="fw-bold text-success">{st.pullRequests}</td>)}
                </tr>
                <tr>
                  <td className="fw-semibold text-start">Issues</td>
                  {comparisonData.map((st, idx) => <td key={idx} className="fw-bold text-warning">{st.issues}</td>)}
                </tr>
                <tr>
                  <td className="fw-semibold text-start">Open-Source PRs</td>
                  {comparisonData.map((st, idx) => <td key={idx} className="fw-bold text-info">{st.openSource}</td>)}
                </tr>
                <tr className="table-primary">
                  <td className="fw-bold text-start">Application Score</td>
                  {comparisonData.map((st, idx) => (
                    <td key={idx}>
                      <span className="badge bg-primary fs-6 px-3 py-2">{st.score} Points</span>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default StaffStudentComparison;
