import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  Legend 
} from 'recharts';
import { FaChartLine, FaFilter, FaCodeBranch, FaCheckCircle, FaCode, FaBook, FaUsers } from 'react-icons/fa';
import '../../styles/dashboard.css';

const COLORS = ['#6D5EF5', '#2563EB', '#16A34A', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6'];

const GithubAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('30d');

  const token = JSON.parse(localStorage.getItem('userInfo'))?.token;

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const res = await axios.get(`/api/admin/analytics?period=${period}`, config);
        setAnalytics(res.data);
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [token, period]);

  const totals = analytics?.totals || {};
  const languages = analytics?.languageDistribution || [];
  const departments = analytics?.departmentContributions || [];

  return (
    <div className="container-fluid px-0">
      {/* Header Banner */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 pb-2 border-bottom">
        <div>
          <h2 className="fw-bold mb-1 d-flex align-items-center">
            <FaChartLine className="me-2 text-primary" /> GitHub Analytics & Intelligence
          </h2>
          <p className="text-muted mb-0">System-wide code velocity, programming language usage, and departmental contributions.</p>
        </div>

        {/* Time Period Filter */}
        <div className="d-flex align-items-center gap-2 mt-3 mt-md-0">
          <FaFilter className="text-muted" />
          <select 
            className="form-select bg-white border-1 fw-bold shadow-sm"
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="3m">Last 3 Months</option>
            <option value="6m">Last 6 Months</option>
            <option value="1y">This Year</option>
          </select>
        </div>
      </div>

      {/* Analytics Metric Cards */}
      <div className="row g-3 mb-4">
        {[
          { label: 'Total Repositories', value: totals.repositories, Icon: FaBook, color: 'primary' },
          { label: 'Total Commits', value: totals.commits, Icon: FaCodeBranch, color: 'success' },
          { label: 'Merged PRs', value: totals.pullRequests, Icon: FaCheckCircle, color: 'secondary' },
          { label: 'Total Issues', value: totals.issues, Icon: FaCode, color: 'danger' }
        ].map((item, idx) => (
          <div key={idx} className="col-12 col-sm-6 col-md-3">
            <div className="saas-card d-flex align-items-center p-3 h-100">
              <div className={`icon-box ${item.color} me-3`}>
                <item.Icon />
              </div>
              <div>
                <p className="text-muted small fw-semibold text-uppercase mb-1" style={{ fontSize: '0.7rem' }}>{item.label}</p>
                <h3 className="fw-bold mb-0">{item.value || 0}</h3>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Analytics Charts Grid */}
      <div className="row g-4 mb-4">
        {/* Language Distribution Donut Chart */}
        <div className="col-12 col-lg-6">
          <div className="saas-card h-100">
            <h5 className="fw-bold mb-1">Programming Language Usage</h5>
            <p className="text-muted small mb-4">Distribution of primary languages across student repositories.</p>

            {languages.length > 0 ? (
              <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie data={languages} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="count" nameKey="language">
                      {languages.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="text-center text-muted py-5">No language data recorded.</div>
            )}
          </div>
        </div>

        {/* Department Contribution Bar Chart */}
        <div className="col-12 col-lg-6">
          <div className="saas-card h-100">
            <h5 className="fw-bold mb-1">Department Code Volume</h5>
            <p className="text-muted small mb-4">Total commits contributed by each academic department.</p>

            {departments.length > 0 ? (
              <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={departments}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                    <XAxis dataKey="department" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                    <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
                    <Bar name="Total Commits" dataKey="commits" fill="var(--primary)" radius={[6, 6, 0, 0]} barSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="text-center text-muted py-5">No department data recorded.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GithubAnalytics;
