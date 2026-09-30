import React, { useState, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { 
  FaTrophy, FaMedal, FaStar, FaFire, FaCodeBranch, 
  FaLock, FaCheckCircle, FaAward, FaCrown, FaBolt, FaBook 
} from 'react-icons/fa';
import '../styles/dashboard.css';

const LEVEL_TIERS = [
  { name: 'Bronze', minScore: 0, maxScore: 99, color: '#CD7F32', bg: 'rgba(205, 127, 50, 0.1)' },
  { name: 'Silver', minScore: 100, maxScore: 299, color: '#C0C0C0', bg: 'rgba(192, 192, 192, 0.15)' },
  { name: 'Gold', minScore: 300, maxScore: 599, color: '#FFD700', bg: 'rgba(255, 215, 0, 0.15)' },
  { name: 'Platinum', minScore: 600, maxScore: 999, color: '#E5E4E2', bg: 'rgba(229, 228, 226, 0.2)' },
  { name: 'Diamond', minScore: 1000, maxScore: 1999, color: '#B9F2FF', bg: 'rgba(185, 242, 255, 0.2)' },
  { name: 'Legend', minScore: 2000, maxScore: Infinity, color: '#9333EA', bg: 'rgba(147, 51, 234, 0.15)' },
];

const DEFAULT_ACHIEVEMENTS_DEFINITION = [
  { id: 'first_commit', name: 'First Steps', description: 'Made your first commit on GitHub', icon: FaCodeBranch, category: 'Commits', req: 1 },
  { id: 'commit_10', name: 'Consistent Coder', description: 'Reached 10 total commits', icon: FaFire, category: 'Commits', req: 10 },
  { id: 'commit_50', name: 'Code Machine', description: 'Reached 50 total commits', icon: FaBolt, category: 'Commits', req: 50 },
  { id: 'commit_100', name: 'Century Master', description: 'Reached 100 total commits', icon: FaCrown, category: 'Commits', req: 100 },
  
  { id: 'first_pr', name: 'Collaborator', description: 'Opened or merged your first Pull Request', icon: FaMedal, category: 'PRs', req: 1 },
  { id: 'pr_5', name: 'PR Champion', description: 'Merged 5+ Pull Requests', icon: FaAward, category: 'PRs', req: 5 },
  { id: 'pr_20', name: 'Pull Request Hero', description: 'Merged 20+ Pull Requests', icon: FaTrophy, category: 'PRs', req: 20 },
  
  { id: 'first_star', name: 'Stargazer', description: 'Earned your first GitHub star', icon: FaStar, category: 'Stars', req: 1 },
  { id: 'stars_10', name: 'Rising Star', description: 'Accumulated 10+ repository stars', icon: FaStar, category: 'Stars', req: 10 },
  
  { id: 'issue_solver', name: 'Problem Solver', description: 'Contributed to GitHub issue discussions', icon: FaBook, category: 'Issues', req: 1 },
  { id: 'streak_3', name: 'On Fire!', description: 'Maintained a 3-day contribution streak', icon: FaFire, category: 'Streak', req: 3 },
  { id: 'open_source', name: 'Open Source Advocate', description: 'Contributed to external open source projects', icon: FaCrown, category: 'OpenSource', req: 1 },
];

const StudentAchievements = () => {
  const { stats } = useOutletContext();
  const [filterCategory, setFilterCategory] = useState('ALL'); // ALL, Unlocked, Locked, Commits, PRs, Stars

  const score = stats?.contributionScore || 0;
  const currentLevel = stats?.level || 'Bronze';
  const unlockedBackendAchievements = stats?.achievements || [];

  // Determine current tier & next level progress
  const currentTierIndex = useMemo(() => {
    const idx = LEVEL_TIERS.findIndex(t => t.name.toLowerCase() === currentLevel.toLowerCase());
    return idx !== -1 ? idx : 0;
  }, [currentLevel]);

  const currentTier = LEVEL_TIERS[currentTierIndex];
  const nextTier = LEVEL_TIERS[currentTierIndex + 1] || null;

  const levelProgressPercent = useMemo(() => {
    if (!nextTier) return 100;
    const range = nextTier.minScore - currentTier.minScore;
    const gained = score - currentTier.minScore;
    return Math.min(Math.max(Math.round((gained / range) * 100), 0), 100);
  }, [score, currentTier, nextTier]);

  // Combine definitions with student unlocked status
  const mergedAchievements = useMemo(() => {
    return DEFAULT_ACHIEVEMENTS_DEFINITION.map(def => {
      const foundInBackend = unlockedBackendAchievements.find(
        a => a.name && a.name.toLowerCase() === def.name.toLowerCase()
      );
      const isUnlocked = !!foundInBackend || (
        (def.id === 'first_commit' && (stats?.totalCommits || 0) >= 1) ||
        (def.id === 'commit_10' && (stats?.totalCommits || 0) >= 10) ||
        (def.id === 'commit_50' && (stats?.totalCommits || 0) >= 50) ||
        (def.id === 'commit_100' && (stats?.totalCommits || 0) >= 100) ||
        (def.id === 'first_pr' && (stats?.totalPullRequests || 0) >= 1) ||
        (def.id === 'pr_5' && (stats?.mergedPullRequests || 0) >= 5) ||
        (def.id === 'pr_20' && (stats?.mergedPullRequests || 0) >= 20) ||
        (def.id === 'first_star' && (stats?.totalStars || 0) >= 1) ||
        (def.id === 'stars_10' && (stats?.totalStars || 0) >= 10) ||
        (def.id === 'issue_solver' && (stats?.totalIssues || 0) >= 1) ||
        (def.id === 'streak_3' && (stats?.contributionStreak || 0) >= 3)
      );

      return {
        ...def,
        unlocked: isUnlocked,
        earnedAt: foundInBackend?.earnedAt || null
      };
    });
  }, [unlockedBackendAchievements, stats]);

  const unlockedCount = useMemo(() => mergedAchievements.filter(a => a.unlocked).length, [mergedAchievements]);

  // Filtered List
  const filteredAchievements = useMemo(() => {
    if (filterCategory === 'ALL') return mergedAchievements;
    if (filterCategory === 'Unlocked') return mergedAchievements.filter(a => a.unlocked);
    if (filterCategory === 'Locked') return mergedAchievements.filter(a => !a.unlocked);
    return mergedAchievements.filter(a => a.category === filterCategory);
  }, [mergedAchievements, filterCategory]);

  return (
    <main className="p-4 p-md-5">
      <div className="container-fluid max-w-7xl mx-auto">
        
        {/* Page Title */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
          <div>
            <h2 className="fw-bold mb-1 d-flex align-items-center gap-2">
              <FaTrophy className="text-warning" /> Achievements & Rank Progression
            </h2>
            <p className="text-muted mb-0">Unlock badges, level up your GitScope profile, and track open-source milestones.</p>
          </div>
        </div>

        {/* Hero Level Banner */}
        <div className="saas-card mb-4 bg-white border border-primary border-opacity-25 shadow-sm p-4">
          <div className="row align-items-center g-4">
            <div className="col-12 col-md-4 text-center text-md-start">
              <div className="d-flex align-items-center justify-content-center justify-content-md-start gap-3">
                <div 
                  className="rounded-circle d-flex align-items-center justify-content-center shadow-sm"
                  style={{ width: '64px', height: '64px', backgroundColor: currentTier.bg, color: currentTier.color, fontSize: '1.8rem' }}
                >
                  <FaCrown />
                </div>
                <div>
                  <span className="text-muted small fw-bold text-uppercase">Current Rank Tier</span>
                  <h3 className="fw-bold mb-0" style={{ color: currentTier.color }}>
                    {currentTier.name} Level
                  </h3>
                  <span className="badge bg-light text-dark border mt-1">Score: {score} PTS</span>
                </div>
              </div>
            </div>

            <div className="col-12 col-md-8">
              <div className="bg-light p-3 rounded-3 border">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="fw-bold small text-dark">
                    Progress to {nextTier ? `${nextTier.name} Level` : 'Max Tier'}
                  </span>
                  <span className="fw-bold small text-primary">
                    {nextTier ? `${score} / ${nextTier.minScore} PTS (${levelProgressPercent}%)` : 'MAX LEVEL'}
                  </span>
                </div>
                <div className="progress rounded-pill style-progress" style={{ height: '10px' }}>
                  <div 
                    className="progress-bar bg-primary progress-bar-striped progress-bar-animated rounded-pill" 
                    role="progressbar" 
                    style={{ width: `${levelProgressPercent}%` }}
                  ></div>
                </div>
                <div className="d-flex justify-content-between mt-2 small text-muted">
                  <span>Unlocked Badges: <strong>{unlockedCount} / {mergedAchievements.length}</strong></span>
                  {nextTier && <span>Need {nextTier.minScore - score} more PTS</span>}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Category Filters Bar */}
        <div className="saas-card mb-4">
          <div className="d-flex flex-wrap align-items-center justify-content-between gap-2">
            <div className="d-flex flex-wrap align-items-center gap-2">
              <span className="small text-muted fw-bold me-1">Filter Badges:</span>
              {['ALL', 'Unlocked', 'Locked', 'Commits', 'PRs', 'Stars'].map((cat, i) => (
                <button 
                  key={i}
                  className={`btn btn-sm ${filterCategory === cat ? 'btn-primary fw-semibold' : 'btn-light border'}`}
                  onClick={() => setFilterCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
            <span className="small text-muted">
              Showing <strong>{filteredAchievements.length}</strong> badges
            </span>
          </div>
        </div>

        {/* Badges Grid */}
        <div className="row g-4 mb-5">
          {filteredAchievements.map((badge, idx) => {
            const IconComponent = badge.icon;
            return (
              <div key={idx} className="col-12 col-sm-6 col-md-4 col-xl-3">
                <div className={`achievement-badge h-100 d-flex flex-column justify-content-between ${badge.unlocked ? 'unlocked' : 'locked'}`}>
                  <div>
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <div className={`p-2 rounded-circle ${badge.unlocked ? 'bg-warning bg-opacity-20 text-warning' : 'bg-secondary bg-opacity-10 text-muted'}`}>
                        <IconComponent className="fs-3" />
                      </div>
                      <span className={`badge ${badge.unlocked ? 'bg-success' : 'bg-secondary'} rounded-pill small`}>
                        {badge.unlocked ? 'UNLOCKED' : 'LOCKED'}
                      </span>
                    </div>

                    <h6 className="fw-bold mb-1 text-dark">{badge.name}</h6>
                    <p className="text-muted small mb-3">{badge.description}</p>
                  </div>

                  <div className="pt-2 border-top text-muted small d-flex justify-content-between align-items-center">
                    <span className="fw-semibold opacity-75">{badge.category}</span>
                    {badge.unlocked ? (
                      <span className="text-success fw-bold d-flex align-items-center gap-1">
                        <FaCheckCircle /> Earned
                      </span>
                    ) : (
                      <span className="text-muted d-flex align-items-center gap-1">
                        <FaLock /> Locked
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Level Roadmap Guide */}
        <div className="saas-card mb-5">
          <h5 className="fw-bold mb-4 d-flex align-items-center gap-2">
            <FaCrown className="text-warning" /> GitScope Gamification Tiers
          </h5>
          <div className="row g-3">
            {LEVEL_TIERS.map((tier, i) => (
              <div key={i} className="col-12 col-sm-6 col-md-4 col-lg-2">
                <div 
                  className={`p-3 rounded-3 border text-center ${currentTier.name === tier.name ? 'border-primary shadow-sm bg-white' : 'bg-light'}`}
                  style={{ borderLeft: `4px solid ${tier.color}` }}
                >
                  <h6 className="fw-bold mb-1" style={{ color: tier.color }}>{tier.name}</h6>
                  <p className="small text-muted mb-0">
                    {tier.maxScore === Infinity ? `${tier.minScore}+ PTS` : `${tier.minScore} - ${tier.maxScore} PTS`}
                  </p>
                  {currentTier.name === tier.name && (
                    <span className="badge bg-primary rounded-pill mt-2 small">Current</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </main>
  );
};

export default StudentAchievements;
