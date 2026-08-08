import React from 'react';
import { Link } from 'react-router-dom';
import { FaChartLine, FaCode, FaTrophy, FaSyncAlt } from 'react-icons/fa';
import '../styles/Landing.css';

const Landing = () => {
  return (
    <div className="landing-page">
      {/* Dynamic Navbar */}
      <nav className="landing-navbar">
        <Link to="/" className="landing-brand">
          <FaCode className="text-primary" /> Git<span>Scope</span>
        </Link>
        <div className="landing-nav-links">
          <Link to="/login" className="btn-login">Sign In</Link>
          <Link to="/signup" className="btn-signup">Get Started</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-badge">
          ✨ The Student Open Contribution Tracker
        </div>
        <h1 className="hero-title">
          Elevate your open source <span className="highlight">journey</span> with GitScope
        </h1>
        <p className="hero-subtitle">
          The centralized platform for students to track GitHub contributions. Seamlessly sync repositories, analyze your commit history, and showcase your developer progress.
        </p>
        <div className="hero-actions">
          <Link to="/signup" className="btn-primary-lg">Start Tracking</Link>
          <Link to="/login" className="btn-outline-lg">Access Dashboard</Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="section-header">
          <h2 className="section-title">Everything you need to succeed</h2>
          <p className="section-subtitle">
            Purpose-built tools designed to streamline contribution tracking for student developers.
          </p>
        </div>
        
        <div className="feature-grid">
          {/* Feature 1 */}
          <div className="feature-card">
            <div className="feature-icon-wrapper">
              <FaSyncAlt />
            </div>
            <h3>Automated GitHub Sync</h3>
            <p>
              Link your GitHub account once and let GitScope automatically fetch your repositories, commits, and pull requests in real-time.
            </p>
          </div>
          
          {/* Feature 2 */}
          <div className="feature-card">
            <div className="feature-icon-wrapper">
              <FaChartLine />
            </div>
            <h3>Contribution Analytics</h3>
            <p>
              Visualize your coding activity with rich graphs and metrics. Understand your most active days, top languages, and commit patterns.
            </p>
          </div>
          
          {/* Feature 3 */}
          <div className="feature-card">
            <div className="feature-icon-wrapper">
              <FaTrophy />
            </div>
            <h3>Progress & Leaderboards</h3>
            <p>
              Compare your statistics with peers on an institutional leaderboard. Gamify your coding experience and stay motivated to contribute.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-content">
          <div className="footer-brand">
            <FaCode /> Git<span>Scope</span>
          </div>
          <div className="footer-nav">
            <a href="#about">About</a>
            <a href="#features">Features</a>
            <a href="#support">Support</a>
            <a href="#contact">Contact</a>
          </div>
          <div className="footer-bottom">
            <p>&copy; {new Date().getFullYear()} GitScope. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
