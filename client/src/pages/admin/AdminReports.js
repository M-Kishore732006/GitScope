import React, { useState } from 'react';
import axios from 'axios';
import { FaFileAlt, FaDownload, FaFileCsv, FaFilePdf, FaFilter, FaTable } from 'react-icons/fa';
import '../../styles/dashboard.css';

const AdminReports = () => {
  const [reportType, setReportType] = useState('Student GitHub Activity Report');
  const [department, setDepartment] = useState('');
  const [year, setYear] = useState('');
  
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);

  const token = JSON.parse(localStorage.getItem('userInfo'))?.token;

  const handleGenerateReport = async () => {
    setLoading(true);
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      let queryParams = [`reportType=${encodeURIComponent(reportType)}`];
      if (department) queryParams.push(`department=${encodeURIComponent(department)}`);
      if (year) queryParams.push(`year=${encodeURIComponent(year)}`);

      const res = await axios.get(`/api/admin/reports/generate?${queryParams.join('&')}`, config);
      setReportData(res.data);
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Failed to generate report.');
    } finally {
      setLoading(false);
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    if (!reportData || !reportData.data || reportData.data.length === 0) return;

    const headers = Object.keys(reportData.data[0]);
    const csvRows = [];
    csvRows.push(headers.join(','));

    reportData.data.forEach(row => {
      const values = headers.map(header => {
        const escaped = ('' + (row[header] || '')).replace(/"/g, '\\"');
        return `"${escaped}"`;
      });
      csvRows.push(values.join(','));
    });

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', `${reportType.replace(/ /g, '_')}_${Date.now()}.csv`);
    a.click();
  };

  return (
    <div className="container-fluid px-0">
      {/* Header Banner */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 pb-2 border-bottom">
        <div>
          <h2 className="fw-bold mb-1 d-flex align-items-center">
            <FaFileAlt className="me-2 text-success" /> System Reports & Exports Center
          </h2>
          <p className="text-muted mb-0">Generate institutional compliance reports and export telemetry datasets in CSV or PDF formats.</p>
        </div>
      </div>

      {/* Configuration & Generator Card */}
      <div className="saas-card mb-4 bg-white">
        <h5 className="fw-bold mb-3 border-bottom pb-2">Report Configuration</h5>
        <div className="row g-3">
          <div className="col-12 col-md-4">
            <label className="form-label text-muted small fw-bold">REPORT TYPE *</label>
            <select className="form-select bg-light border-1 py-2 fw-semibold" value={reportType} onChange={(e) => setReportType(e.target.value)}>
              <option value="Student GitHub Activity Report">Student GitHub Activity Report</option>
              <option value="Department Activity Report">Department Activity Report</option>
              <option value="Staff-wise Student Report">Staff-wise Student Report</option>
              <option value="Open-Source Contribution Report">Open-Source Contribution Report</option>
              <option value="Monthly Activity Report">Monthly Activity Report</option>
              <option value="Contribution Ranking Report">Contribution Ranking Report</option>
              <option value="Inactive Student Report">Inactive Student Report</option>
            </select>
          </div>

          <div className="col-6 col-md-3">
            <label className="form-label text-muted small fw-bold">DEPARTMENT FILTER</label>
            <select className="form-select bg-light border-1 py-2" value={department} onChange={(e) => setDepartment(e.target.value)}>
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
            <label className="form-label text-muted small fw-bold">ACADEMIC YEAR</label>
            <select className="form-select bg-light border-1 py-2" value={year} onChange={(e) => setYear(e.target.value)}>
              <option value="">All Years</option>
              <option value="1">1st Year</option>
              <option value="2">2nd Year</option>
              <option value="3">3rd Year</option>
              <option value="4">4th Year</option>
            </select>
          </div>

          <div className="col-12 col-md-2 d-flex align-items-end">
            <button 
              className="btn btn-primary fw-bold w-100 py-2 d-flex align-items-center justify-content-center"
              onClick={handleGenerateReport}
              disabled={loading}
            >
              <FaTable className="me-2" /> {loading ? 'Generating...' : 'Generate'}
            </button>
          </div>
        </div>
      </div>

      {/* Report Data Preview & Actions */}
      {reportData && (
        <div className="saas-card overflow-hidden p-0 mb-4">
          <div className="p-3 bg-light border-bottom d-flex justify-content-between align-items-center">
            <div>
              <h6 className="fw-bold mb-0">{reportData.reportType}</h6>
              <span className="text-muted small">Generated on {new Date(reportData.generatedAt).toLocaleString()} • {reportData.totalRecords} Records</span>
            </div>

            <div className="d-flex gap-2">
              <button className="btn btn-outline-success btn-sm fw-bold d-flex align-items-center" onClick={handleExportCSV}>
                <FaFileCsv className="me-1 fs-5" /> Export CSV
              </button>
              <button className="btn btn-outline-danger btn-sm fw-bold d-flex align-items-center" onClick={() => window.print()}>
                <FaFilePdf className="me-1 fs-5" /> Print / Export PDF
              </button>
            </div>
          </div>

          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  {reportData.data.length > 0 && Object.keys(reportData.data[0]).map((h, i) => (
                    <th key={i} scope="col" className="text-muted text-uppercase small fw-bold px-3 py-2 border-0">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {reportData.data.map((row, rIdx) => (
                  <tr key={rIdx} className="border-bottom">
                    {Object.values(row).map((val, cIdx) => (
                      <td key={cIdx} className="small py-2 px-3">{'' + (val || 'N/A')}</td>
                    ))}
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

export default AdminReports;
