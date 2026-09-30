import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { 
  FaGithub, FaEnvelope, FaPhone, FaGraduationCap, FaMedal, FaStar, 
  FaCodeBranch, FaBook, FaCheckCircle, FaPrint, FaShareAlt, FaArrowLeft, FaExternalLinkAlt 
} from 'react-icons/fa';
import SkillRadar from '../components/dashboard/SkillRadar';
import { toTitleCase } from '../utils/formatters';

const PublicPortfolio = () => {
  const { username } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchPublicData = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`/api/student/public/${username}`);
        if (response.data) {
          setProfile(response.data);
        }
      } catch (err) {
        // Fallback: search or mock clean structure if offline API
        try {
          const fallbackRes = await axios.get(`/api/student/dashboard?username=${username}`);
          if (fallbackRes.data) {
            setProfile(fallbackRes.data);
          } else {
            setError('Student profile not found');
          }
        } catch (e) {
          setError('Unable to load developer profile');
        }
      } finally {
        setLoading(false);
      }
    };

    if (username) {
      fetchPublicData();
    }
  }, [username]);

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  if (loading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center bg-card">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading Portfolio...</span>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-vh-100 d-flex flex-column align-items-center justify-content-center bg-card p-4">
        <h3 className="fw-bold text-danger mb-2">Developer Portfolio Not Found</h3>
        <p className="text-muted mb-4">{error || 'The requested username does not exist or has not published a portfolio.'}</p>
        <Link to="/" className="btn btn-primary rounded-pill px-4">
          <FaArrowLeft className="me-2" /> Back to Home
        </Link>
      </div>
    );
  }

  const { student, stats, repositories = [], achievements = [] } = profile;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(window.location.href)}`;

  return (
    <div className="min-vh-100 py-4 px-3 px-md-5 bg-color text-main print-container">
      {/* Header Actions (Hidden on Print) */}
      <div className="container max-w-1100 mb-4 d-print-none">
        <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
          <Link to="/" className="btn btn-outline-secondary rounded-pill px-3 py-2 btn-sm">
            <FaArrowLeft className="me-2" /> Home
          </Link>
          <div className="d-flex align-items-center gap-2">
            <button onClick={handleShare} className="btn btn-outline-primary rounded-pill px-3 py-2 btn-sm">
              <FaShareAlt className="me-1" /> {copied ? 'Link Copied!' : 'Share Link'}
            </button>
            <button onClick={handlePrint} className="btn btn-primary rounded-pill px-4 py-2 btn-sm fw-bold">
              <FaPrint className="me-2" /> Print / Save PDF Resume
            </button>
          </div>
        </div>
      </div>

      {/* Main Portfolio Card */}
      <div className="container max-w-1100">
        <div className="saas-card border border-theme shadow-lg rounded-4 p-4 p-md-5 bg-card">
          
          {/* Header Banner */}
          <div className="row align-items-center mb-4 pb-4 border-bottom border-theme">
            <div className="col-12 col-md-8 d-flex align-items-center gap-4">
              <div 
                className="avatar-circle shadow-sm flex-shrink-0" 
                style={{ width: '84px', height: '84px', fontSize: '2.5rem' }}
              >
                {(student?.fullName || student?.username || 'S')[0].toUpperCase()}
              </div>
              <div>
                <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-3 py-1 rounded-pill fw-bold text-uppercase mb-2">
                  Verified Academic Portfolio
                </span>
                <h2 className="fw-extrabold text-main mb-1">
                  {toTitleCase(student?.fullName || student?.username || 'STUDENT DEVELOPER')}
                </h2>
                <div className="d-flex align-items-center flex-wrap gap-3 text-muted small">
                  <span><FaGraduationCap className="text-primary me-1" /> {student?.department || 'Computer Science'}</span>
                  <span><strong>Roll:</strong> {student?.rollNumber || 'N/A'}</span>
                  <span><strong>Year:</strong> {student?.year ? `${student.year} Year (${student.section || 'A'})` : 'N/A'}</span>
                </div>
              </div>
            </div>

            <div className="col-12 col-md-4 text-md-end mt-3 mt-md-0 d-flex flex-column align-items-md-end gap-2">
              <img 
                src={qrUrl} 
                alt="Portfolio QR Code" 
                className="rounded border p-1 bg-white shadow-sm"
                style={{ width: '90px', height: '90px' }} 
              />
              <span className="extra-small text-muted">Scan to view online portfolio</span>
            </div>
          </div>

          {/* Key Developer Telemetry Banner */}
          <div className="row g-3 mb-4">
            <div className="col-6 col-md-3">
              <div className="p-3 bg-pill rounded-3 border border-theme text-center">
                <span className="text-muted extra-small d-block text-uppercase fw-semibold">Repositories</span>
                <h4 className="fw-bold text-main mb-0">{stats?.totalRepositories || repositories.length || 0}</h4>
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div className="p-3 bg-pill rounded-3 border border-theme text-center">
                <span className="text-muted extra-small d-block text-uppercase fw-semibold">Total Commits</span>
                <h4 className="fw-bold text-primary mb-0">{stats?.totalCommits || 0}</h4>
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div className="p-3 bg-pill rounded-3 border border-theme text-center">
                <span className="text-muted extra-small d-block text-uppercase fw-semibold">Merged PRs</span>
                <h4 className="fw-bold text-success mb-0">{stats?.mergedPullRequests || 0}</h4>
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div className="p-3 bg-pill rounded-3 border border-theme text-center">
                <span className="text-muted extra-small d-block text-uppercase fw-semibold">Overall Rank</span>
                <h4 className="fw-bold text-warning mb-0">#{stats?.overallRank > 0 ? stats.overallRank : '-'}</h4>
              </div>
            </div>
          </div>

          {/* AI Skill Radar & Telemetry Analysis */}
          <div className="mb-5">
            <SkillRadar stats={stats} repositories={repositories} />
          </div>

          {/* Top Featured Repositories */}
          <div className="mb-5">
            <h5 className="fw-bold text-main mb-3 d-flex align-items-center gap-2">
              <FaBook className="text-primary" /> Top Verified Projects & Repositories
            </h5>
            <div className="row g-3">
              {repositories.slice(0, 4).map((repo, idx) => (
                <div key={idx} className="col-12 col-md-6">
                  <div className="p-3 rounded-3 border border-theme bg-pill h-100 d-flex flex-column justify-content-between">
                    <div>
                      <div className="d-flex align-items-center justify-content-between mb-2">
                        <span className="fw-bold text-main text-truncate" style={{ maxWidth: '80%' }}>
                          <FaGithub className="me-2 text-primary" /> {repo.name}
                        </span>
                        <span className="badge bg-light text-dark border extra-small">{repo.language || 'Code'}</span>
                      </div>
                      <p className="text-muted extra-small mb-3" style={{ minHeight: '32px' }}>
                        {repo.description || 'Public academic software repository monitored via GitScope.'}
                      </p>
                    </div>
                    <div className="d-flex align-items-center justify-content-between extra-small border-top border-theme pt-2">
                      <span className="text-muted"><FaStar className="text-warning me-1" /> {repo.stargazers_count || 0} Stars</span>
                      <span className="text-muted"><FaCodeBranch className="text-primary me-1" /> {repo.forks_count || 0} Forks</span>
                      {repo.html_url && (
                        <a href={repo.html_url} target="_blank" rel="noopener noreferrer" className="text-primary text-decoration-none fw-semibold">
                          View Code <FaExternalLinkAlt className="ms-1 extra-small" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {repositories.length === 0 && (
                <p className="text-muted small italic">No repositories indexed for this portfolio yet.</p>
              )}
            </div>
          </div>

          {/* Unlocked Badges & Contact Footer */}
          <div className="row align-items-center pt-3 border-top border-theme">
            <div className="col-12 col-md-8">
              <h6 className="fw-bold text-main mb-2"><FaMedal className="text-warning me-2" /> Verified Badges</h6>
              <div className="d-flex flex-wrap gap-2">
                <span className="badge bg-warning-subtle text-warning border px-3 py-1 rounded-pill small">
                  Level Tier: {stats?.level || 'Bronze'}
                </span>
                <span className="badge bg-success-subtle text-success border px-3 py-1 rounded-pill small">
                  Score: {stats?.contributionScore || 0} PTS
                </span>
                <span className="badge bg-primary-subtle text-primary border px-3 py-1 rounded-pill small">
                  GitScope Certified
                </span>
              </div>
            </div>
            <div className="col-12 col-md-4 text-md-end mt-3 mt-md-0 text-muted extra-small">
              <p className="mb-1"><FaEnvelope className="me-1" /> {student?.email}</p>
              <p className="mb-0"><FaGithub className="me-1" /> github.com/{student?.githubUsername || student?.username}</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default PublicPortfolio;
