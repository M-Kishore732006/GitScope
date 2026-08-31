import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaFileAlt, FaDownload, FaEye, FaPrint, FaCheckCircle } from 'react-icons/fa';

const StaffReports = () => {
  const [reportType, setReportType] = useState('Summary');
  const [assignedStudents, setAssignedStudents] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [format, setFormat] = useState('json');
  const [reportPreview, setReportPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const token = JSON.parse(localStorage.getItem('userInfo'))?.token;

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const res = await axios.get('/api/staff/students', config);
        setAssignedStudents(res.data || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchStudents();
  }, [token]);

  const handleGeneratePreview = async () => {
    setLoading(true);
    setReportPreview(null);
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const params = new URLSearchParams();
      params.append('reportType', reportType);
      if (selectedStudentId) params.append('studentId', selectedStudentId);
      params.append('format', 'json');

      const res = await axios.get(`/api/staff/reports/generate?${params.toString()}`, config);
      setReportPreview(res.data);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to generate report preview.');
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${token}` }, responseType: 'blob' };
      const params = new URLSearchParams();
      params.append('reportType', reportType);
      if (selectedStudentId) params.append('studentId', selectedStudentId);
      params.append('format', 'csv');

      const res = await axios.get(`/api/staff/reports/generate?${params.toString()}`, config);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Staff_Report_${reportType}_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('Failed to export CSV report.');
    }
  };

  return (
    <div className="staff-reports">
      <div className="d-flex flex-wrap align-items-center justify-content-between mb-4 gap-3">
        <div>
          <h2 className="fw-bold text-dark mb-1">Staff Reporting Engine</h2>
          <p className="text-muted small mb-0">
            Generate and export tailored GitHub telemetry reports for assigned students.
          </p>
        </div>
      </div>

      {/* Control Panel */}
      <div className="saas-card mb-4">
        <h5 className="fw-bold text-dark mb-3">Report Generator Parameters</h5>
        <div className="row g-3">
          <div className="col-12 col-md-4">
            <label className="form-label small fw-bold text-muted">Select Report Type</label>
            <select className="form-select bg-light" value={reportType} onChange={(e) => setReportType(e.target.value)}>
              <option value="Summary">Assigned Students Summary Report</option>
              <option value="Individual">Individual Student Activity Report</option>
              <option value="OpenSource">Open-Source Contribution Report</option>
              <option value="Monthly">Monthly Activity Report</option>
              <option value="Inactive">Inactive Students Report</option>
              <option value="Rankings">Student Ranking Report</option>
            </select>
          </div>

          {reportType === 'Individual' && (
            <div className="col-12 col-md-4">
              <label className="form-label small fw-bold text-muted">Target Student</label>
              <select className="form-select bg-light" value={selectedStudentId} onChange={(e) => setSelectedStudentId(e.target.value)}>
                <option value="">Select Student</option>
                {assignedStudents.map((st) => (
                  <option key={st._id} value={st._id}>{st.fullName} ({st.rollNumber})</option>
                ))}
              </select>
            </div>
          )}

          <div className="col-12 col-md-4 d-flex align-items-end gap-2">
            <button className="btn btn-primary fw-bold w-100 py-2 rounded-3" onClick={handleGeneratePreview} disabled={loading}>
              <FaEye className="me-2" /> Preview Report
            </button>
            <button className="btn btn-outline-success fw-bold w-100 py-2 rounded-3" onClick={handleExportCSV}>
              <FaDownload className="me-2" /> Export CSV
            </button>
          </div>
        </div>
      </div>

      {/* Report Preview */}
      {reportPreview && (
        <div className="saas-card border-top border-primary border-4">
          <div className="d-flex justify-content-between align-items-center mb-3 border-bottom pb-2">
            <div>
              <h5 className="fw-bold text-dark mb-0">{reportPreview.title}</h5>
              <small className="text-muted">
                Generated By: {reportPreview.generatedBy} &bull; Date: {new Date(reportPreview.generatedAt).toLocaleString()}
              </small>
            </div>
            <button className="btn btn-sm btn-outline-secondary" onClick={() => window.print()}>
              <FaPrint className="me-1" /> Print Report
            </button>
          </div>

          <div className="table-responsive">
            <table className="table table-striped table-hover align-middle mb-0 small">
              <thead className="table-dark">
                <tr>
                  <th>Student Name</th>
                  <th>Roll No</th>
                  <th>Department</th>
                  <th>GitHub</th>
                  <th>Repos</th>
                  <th>Commits</th>
                  <th>PRs</th>
                  <th>Issues</th>
                  <th>Open-Source PRs</th>
                  <th>Score</th>
                </tr>
              </thead>
              <tbody>
                {reportPreview.data.map((row, idx) => (
                  <tr key={idx}>
                    <td className="fw-bold">{row.fullName}</td>
                    <td>{row.rollNumber}</td>
                    <td>{row.department}</td>
                    <td>@{row.githubUsername}</td>
                    <td>{row.repositories}</td>
                    <td className="fw-bold text-primary">{row.commits}</td>
                    <td>{row.pullRequests}</td>
                    <td>{row.issues}</td>
                    <td>{row.openSourcePRs}</td>
                    <td><span className="badge bg-primary">{row.score} pts</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffReports;
