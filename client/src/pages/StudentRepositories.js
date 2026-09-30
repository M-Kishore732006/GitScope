import React, { useState, useMemo } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { 
  FaBook, FaStar, FaCodeBranch, FaSearch, FaFilter, 
  FaSortAlphaDown, FaSortAlphaUpAlt, FaCalendarAlt, 
  FaExternalLinkAlt, FaThLarge, FaList, FaSyncAlt, FaCode 
} from 'react-icons/fa';
import '../styles/dashboard.css';

const StudentRepositories = () => {
  const { stats, fetchDashboardData } = useOutletContext();
  const [refreshing, setRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState('table'); // 'grid' | 'table'
  
  // Filter & Sorting states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('ALL');
  const [minStars, setMinStars] = useState('0');
  const [sortBy, setSortBy] = useState('name_asc'); // name_asc, name_desc, date_desc, date_asc, stars_desc, forks_desc

  const userInfoStr = localStorage.getItem('userInfo');
  const token = userInfoStr ? JSON.parse(userInfoStr)?.token : null;

  const repositories = useMemo(() => stats?.repositoriesList || [], [stats]);

  // Extract unique languages
  const languagesList = useMemo(() => {
    const set = new Set();
    repositories.forEach(r => {
      if (r.primaryLanguage) set.add(r.primaryLanguage);
    });
    return Array.from(set).sort();
  }, [repositories]);

  // Total stats
  const totalStars = useMemo(() => repositories.reduce((acc, r) => acc + (r.stars || 0), 0), [repositories]);
  const totalForks = useMemo(() => repositories.reduce((acc, r) => acc + (r.forks || 0), 0), [repositories]);

  // Filtered & Sorted repositories
  const filteredRepos = useMemo(() => {
    let list = [...repositories];

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim();
      list = list.filter(r => 
        (r.name && r.name.toLowerCase().includes(q)) ||
        (r.description && r.description.toLowerCase().includes(q)) ||
        (r.primaryLanguage && r.primaryLanguage.toLowerCase().includes(q))
      );
    }

    if (selectedLanguage !== 'ALL') {
      list = list.filter(r => r.primaryLanguage === selectedLanguage);
    }

    if (parseInt(minStars, 10) > 0) {
      list = list.filter(r => (r.stars || 0) >= parseInt(minStars, 10));
    }

    list.sort((a, b) => {
      if (sortBy === 'name_asc') return (a.name || '').localeCompare(b.name || '');
      if (sortBy === 'name_desc') return (b.name || '').localeCompare(a.name || '');
      if (sortBy === 'date_desc') return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      if (sortBy === 'date_asc') return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
      if (sortBy === 'stars_desc') return (b.stars || 0) - (a.stars || 0);
      if (sortBy === 'forks_desc') return (b.forks || 0) - (a.forks || 0);
      return 0;
    });

    return list;
  }, [repositories, searchTerm, selectedLanguage, minStars, sortBy]);

  const handleRefresh = async () => {
    if (!token) return;
    setRefreshing(true);
    try {
      await fetchDashboardData();
    } catch (e) {
      console.error(e);
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <main className="p-4 p-md-5">
      <div className="container-fluid max-w-7xl mx-auto">
        
        {/* Header Title Section */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
          <div>
            <h2 className="fw-bold mb-1 d-flex align-items-center gap-2">
              <FaBook className="text-primary" /> Repositories Portfolio
            </h2>
            <p className="text-muted mb-0">Explore, search, filter, and analyze all your synced GitHub projects.</p>
          </div>
          <div className="d-flex align-items-center gap-2">
            <button 
              className="btn btn-outline-primary d-flex align-items-center gap-2 fw-semibold"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <FaSyncAlt className={refreshing ? 'fa-spin' : ''} />
              {refreshing ? 'Refreshing...' : 'Sync Repositories'}
            </button>
          </div>
        </div>

        {/* Repositories Metrics Bar */}
        <div className="row g-3 mb-4">
          <div className="col-6 col-lg-3">
            <div className="saas-card d-flex align-items-center p-3">
              <div className="icon-box me-3 bg-primary bg-opacity-10 text-primary">
                <FaBook />
              </div>
              <div>
                <p className="text-muted small fw-semibold text-uppercase mb-0">Total Repos</p>
                <h4 className="fw-bold mb-0">{repositories.length}</h4>
              </div>
            </div>
          </div>
          <div className="col-6 col-lg-3">
            <div className="saas-card d-flex align-items-center p-3">
              <div className="icon-box me-3 bg-warning bg-opacity-10 text-warning">
                <FaStar />
              </div>
              <div>
                <p className="text-muted small fw-semibold text-uppercase mb-0">Total Stars</p>
                <h4 className="fw-bold mb-0">{totalStars}</h4>
              </div>
            </div>
          </div>
          <div className="col-6 col-lg-3">
            <div className="saas-card d-flex align-items-center p-3">
              <div className="icon-box me-3 bg-secondary bg-opacity-10 text-secondary">
                <FaCodeBranch />
              </div>
              <div>
                <p className="text-muted small fw-semibold text-uppercase mb-0">Total Forks</p>
                <h4 className="fw-bold mb-0">{totalForks}</h4>
              </div>
            </div>
          </div>
          <div className="col-6 col-lg-3">
            <div className="saas-card d-flex align-items-center p-3">
              <div className="icon-box me-3 bg-success bg-opacity-10 text-success">
                <FaCode />
              </div>
              <div>
                <p className="text-muted small fw-semibold text-uppercase mb-0">Languages Used</p>
                <h4 className="fw-bold mb-0">{languagesList.length}</h4>
              </div>
            </div>
          </div>
        </div>

        {/* Filter and Control Toolbar */}
        <div className="saas-card mb-4">
          <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3 mb-3">
            
            {/* Quick Test Sorting Buttons */}
            <div className="d-flex flex-wrap align-items-center gap-2">
              <span className="small text-muted fw-bold d-flex align-items-center gap-1">
                <FaFilter /> Quick Sorting:
              </span>
              <button 
                className={`btn btn-sm ${sortBy === 'name_asc' ? 'btn-primary' : 'btn-light border'}`}
                onClick={() => setSortBy('name_asc')}
              >
                A &rarr; Z
              </button>
              <button 
                className={`btn btn-sm ${sortBy === 'name_desc' ? 'btn-primary' : 'btn-light border'}`}
                onClick={() => setSortBy('name_desc')}
              >
                Z &rarr; A
              </button>
              <button 
                className={`btn btn-sm ${sortBy === 'date_desc' ? 'btn-primary' : 'btn-light border'}`}
                onClick={() => setSortBy('date_desc')}
              >
                Newest Date
              </button>
              <button 
                className={`btn btn-sm ${sortBy === 'date_asc' ? 'btn-primary' : 'btn-light border'}`}
                onClick={() => setSortBy('date_asc')}
              >
                Oldest Date
              </button>
              <button 
                className={`btn btn-sm ${sortBy === 'stars_desc' ? 'btn-primary' : 'btn-light border'}`}
                onClick={() => setSortBy('stars_desc')}
              >
                Most Stars
              </button>
              {(searchTerm || selectedLanguage !== 'ALL' || minStars !== '0' || sortBy !== 'name_asc') && (
                <button 
                  className="btn btn-sm btn-link text-danger text-decoration-none fw-semibold"
                  onClick={() => { setSearchTerm(''); setSelectedLanguage('ALL'); setMinStars('0'); setSortBy('name_asc'); }}
                >
                  Reset All Filters
                </button>
              )}
            </div>

            {/* View Mode Toggle */}
            <div className="btn-group border rounded-3 p-1 bg-light">
              <button 
                className={`btn btn-sm border-0 ${viewMode === 'grid' ? 'btn-white bg-white shadow-sm fw-bold' : 'text-muted'}`}
                onClick={() => setViewMode('grid')}
              >
                <FaThLarge className="me-1" /> Grid
              </button>
              <button 
                className={`btn btn-sm border-0 ${viewMode === 'table' ? 'btn-white bg-white shadow-sm fw-bold' : 'text-muted'}`}
                onClick={() => setViewMode('table')}
              >
                <FaList className="me-1" /> Table
              </button>
            </div>

          </div>

          {/* Filter Inputs Grid */}
          <div className="row g-2">
            <div className="col-12 col-md-4">
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0 text-muted">
                  <FaSearch />
                </span>
                <input 
                  type="text"
                  className="form-control bg-light border-start-0 ps-0 shadow-none"
                  placeholder="Search repository title or description..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <button className="btn btn-light border border-start-0 text-muted" onClick={() => setSearchTerm('')}>&times;</button>
                )}
              </div>
            </div>

            <div className="col-6 col-md-3">
              <select 
                className="form-select bg-light border shadow-none"
                value={selectedLanguage}
                onChange={e => setSelectedLanguage(e.target.value)}
              >
                <option value="ALL">All Languages ({repositories.length})</option>
                {languagesList.map((lang, i) => (
                  <option key={i} value={lang}>{lang}</option>
                ))}
              </select>
            </div>

            <div className="col-6 col-md-2">
              <select 
                className="form-select bg-light border shadow-none"
                value={minStars}
                onChange={e => setMinStars(e.target.value)}
              >
                <option value="0">Min Stars: Any</option>
                <option value="1">1+ Stars</option>
                <option value="5">5+ Stars</option>
                <option value="10">10+ Stars</option>
              </select>
            </div>

            <div className="col-12 col-md-3">
              <select 
                className="form-select bg-light border shadow-none"
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
              >
                <option value="name_asc">Sort: Name (A to Z)</option>
                <option value="name_desc">Sort: Name (Z to A)</option>
                <option value="date_desc">Sort: Date Created (Newest First)</option>
                <option value="date_asc">Sort: Date Created (Oldest First)</option>
                <option value="stars_desc">Sort: Stars (Highest First)</option>
                <option value="forks_desc">Sort: Forks (Highest First)</option>
              </select>
            </div>
          </div>
          
          <div className="mt-3 d-flex justify-content-between align-items-center text-muted small">
            <span>Showing <strong>{filteredRepos.length}</strong> of <strong>{repositories.length}</strong> repositories</span>
            {selectedLanguage !== 'ALL' && <span className="badge bg-secondary bg-opacity-10 text-secondary">Language: {selectedLanguage}</span>}
          </div>
        </div>

        {/* Grid View Mode */}
        {viewMode === 'grid' && (
          <div className="row g-4 mb-5">
            {filteredRepos.length > 0 ? (
              filteredRepos.map((repo, idx) => (
                <div key={idx} className="col-12 col-md-6 col-lg-4">
                  <div className="saas-card h-100 d-flex flex-column justify-content-between">
                    <div>
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <h5 className="fw-bold mb-0 text-truncate me-2" style={{ maxWidth: '80%' }}>
                          <Link to={`/student/repository/${repo.name}`} className="text-decoration-none text-dark">
                            {repo.name}
                          </Link>
                        </h5>
                        <span className="badge bg-light text-dark border px-2 py-1 small rounded-pill">
                          {repo.primaryLanguage || 'Text'}
                        </span>
                      </div>
                      
                      <p className="text-muted small mb-3 text-truncate-2" style={{ minHeight: '40px' }}>
                        {repo.description || 'No detailed description provided for this repository.'}
                      </p>
                    </div>

                    <div>
                      <div className="d-flex align-items-center justify-content-between pt-3 border-top text-muted small mb-3">
                        <div className="d-flex align-items-center gap-3">
                          <span><FaStar className="text-warning me-1" />{repo.stars || 0}</span>
                          <span><FaCodeBranch className="text-secondary me-1" />{repo.forks || 0}</span>
                        </div>
                        {repo.createdAt && (
                          <span className="d-flex align-items-center gap-1 opacity-75">
                            <FaCalendarAlt /> {new Date(repo.createdAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>

                      <div className="d-flex gap-2">
                        <Link 
                          to={`/student/repository/${repo.name}`} 
                          className="btn btn-sm btn-outline-primary flex-fill fw-semibold"
                        >
                          View Analytics
                        </Link>
                        {repo.url && (
                          <a 
                            href={repo.url} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="btn btn-sm btn-light border text-muted px-2"
                            title="Open on GitHub"
                          >
                            <FaExternalLinkAlt />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-12">
                <div className="saas-card text-center py-5 text-muted">
                  <FaBook className="fs-1 opacity-50 mb-3" />
                  <h5>No Repositories Found</h5>
                  <p className="small mb-0">Try clearing your search filters or sync your GitHub account.</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Table View Mode */}
        {viewMode === 'table' && (
          <div className="saas-card mb-5">
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th 
                      scope="col" 
                      className="text-muted text-uppercase small fw-semibold border-0 style-pointer"
                      onClick={() => setSortBy(prev => prev === 'name_asc' ? 'name_desc' : 'name_asc')}
                      style={{ cursor: 'pointer' }}
                    >
                      Repository Name {sortBy === 'name_asc' ? <FaSortAlphaDown className="ms-1 text-primary"/> : sortBy === 'name_desc' ? <FaSortAlphaUpAlt className="ms-1 text-primary"/> : null}
                    </th>
                    <th scope="col" className="text-muted text-uppercase small fw-semibold border-0">Primary Language</th>
                    <th 
                      scope="col" 
                      className="text-muted text-uppercase small fw-semibold border-0"
                      onClick={() => setSortBy(prev => prev === 'stars_desc' ? 'forks_desc' : 'stars_desc')}
                      style={{ cursor: 'pointer' }}
                    >
                      Impact (Stars & Forks)
                    </th>
                    <th 
                      scope="col" 
                      className="text-muted text-uppercase small fw-semibold border-0"
                      onClick={() => setSortBy(prev => prev === 'date_desc' ? 'date_asc' : 'date_desc')}
                      style={{ cursor: 'pointer' }}
                    >
                      Created Date
                    </th>
                    <th scope="col" className="text-muted text-uppercase small fw-semibold border-0 text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRepos.length > 0 ? (
                    filteredRepos.map((repo, idx) => (
                      <tr key={idx}>
                        <td className="py-3">
                          <Link to={`/student/repository/${repo.name}`} className="fw-bold text-dark text-decoration-none">
                            {repo.name}
                          </Link>
                          <p className="text-muted small mb-0 text-truncate" style={{ maxWidth: '350px' }}>
                            {repo.description || 'No description available'}
                          </p>
                        </td>
                        <td>
                          <span className="badge bg-light text-dark border px-3 py-2 fw-medium rounded-pill">
                            {repo.primaryLanguage || 'Unknown'}
                          </span>
                        </td>
                        <td>
                          <div className="d-flex align-items-center gap-3">
                            <span className="small text-muted"><FaStar className="text-warning me-1" />{repo.stars || 0}</span>
                            <span className="small text-muted"><FaCodeBranch className="text-secondary me-1" />{repo.forks || 0}</span>
                          </div>
                        </td>
                        <td className="small text-muted">
                          {repo.createdAt ? new Date(repo.createdAt).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="text-end">
                          <div className="d-flex justify-content-end gap-2">
                            <Link to={`/student/repository/${repo.name}`} className="btn btn-sm btn-outline-primary fw-semibold">
                              Analytics
                            </Link>
                            {repo.url && (
                              <a href={repo.url} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-light border text-muted">
                                <FaExternalLinkAlt />
                              </a>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="text-center py-5 text-muted border-0">
                        No repositories match your active filter criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </main>
  );
};

export default StudentRepositories;
