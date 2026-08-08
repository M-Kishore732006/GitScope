import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaTrophy, FaMedal } from 'react-icons/fa';

const Leaderboard = () => {
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('overall'); // overall, department, year

    const userInfoStr = localStorage.getItem('userInfo');
    const userInfo = userInfoStr ? JSON.parse(userInfoStr) : null;
    const token = userInfo?.token;
    const currentUser = userInfo?.username; // or fullName

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${token}` } };
                const response = await axios.get('/api/student/leaderboard', config);
                setLeaderboard(response.data);
            } catch (error) {
                console.error('Error fetching leaderboard', error);
            } finally {
                setLoading(false);
            }
        };
        fetchLeaderboard();
    }, [token]);

    if (loading) {
        return <div className="d-flex justify-content-center align-items-center min-vh-100">Loading Leaderboard...</div>;
    }

    let displayData = [...leaderboard];
    
    if (filter === 'department' && userInfo?.department) {
        displayData = displayData.filter(d => d.department === userInfo.department);
    } else if (filter === 'year' && userInfo?.year) {
        displayData = displayData.filter(d => d.year === userInfo.year);
    }

    // Re-rank based on filter
    if (filter !== 'overall') {
        displayData.sort((a, b) => b.score - a.score);
        displayData = displayData.map((d, i) => ({ ...d, displayRank: i + 1 }));
    } else {
        displayData = displayData.map(d => ({ ...d, displayRank: d.rank }));
    }

    return (
        <div className="container-fluid p-4 p-md-5">
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 pb-2 border-bottom">
                <div>
                    <h2 className="fw-bold mb-1"><FaTrophy className="text-warning me-2"/> Global Leaderboard</h2>
                    <p className="text-muted mb-3 mb-md-0">See how you rank among other developers in the university.</p>
                </div>
                <div className="btn-group shadow-sm bg-white rounded-3">
                   <button className={`btn  ${filter === 'overall' ? 'btn-primary' : 'btn-light border'} px-4 py-2`} onClick={() => setFilter('overall')}>Overall</button>
                   <button className={`btn  ${filter === 'department' ? 'btn-primary' : 'btn-light border'} px-4 py-2`} onClick={() => setFilter('department')}>Department</button>
                   <button className={`btn  ${filter === 'year' ? 'btn-primary' : 'btn-light border'} px-4 py-2`} onClick={() => setFilter('year')}>By Year</button>
                </div>
            </div>

            <div className="saas-card overflow-hidden p-0">
                    <div className="table-responsive">
                       <table className="table table-hover align-middle mb-0">
                          <thead className="table-light">
                             <tr>
                                <th scope="col" className="text-muted text-uppercase small fw-bold px-4 py-3 border-0">Rank</th>
                                <th scope="col" className="text-muted text-uppercase small fw-bold py-3 border-0">Developer</th>
                                <th scope="col" className="text-muted text-uppercase small fw-bold py-3 border-0">Cohort</th>
                                <th scope="col" className="text-muted text-uppercase small fw-bold text-center py-3 border-0">Score</th>
                                <th scope="col" className="text-muted text-uppercase small fw-bold text-center d-none d-md-table-cell py-3 border-0">Commits / PRs</th>
                                <th scope="col" className="text-muted text-uppercase small fw-bold text-center py-3 border-0">Tier</th>
                             </tr>
                          </thead>
                          <tbody>
                             {displayData.length > 0 ? (
                                displayData.map((entry, idx) => (
                                    <tr key={idx} className={`${entry.name === currentUser ? 'table-primary bg-opacity-10' : ''} border-bottom`}>
                                      <td className="fw-bold px-4 align-middle">
                                         {entry.displayRank === 1 ? <FaMedal className="text-warning fs-3" /> :
                                          entry.displayRank === 2 ? <FaMedal className="text-secondary fs-4" /> :
                                          entry.displayRank === 3 ? <FaMedal className="text-danger fs-4" style={{color: '#cd7f32'}} /> : <span className="text-muted ms-2 ps-1">#{entry.displayRank}</span>}
                                      </td>
                                      <td className="fw-bold align-middle text-dark">
                                          <div className="d-flex align-items-center">
                                              <div className="avatar-circle me-3 bg-primary text-white" style={{width: 35, height: 35, fontSize: '0.9rem'}}>
                                                  {entry.name.charAt(0)}
                                              </div>
                                              <div>
                                                  {entry.name}
                                                  {entry.name === currentUser && <span className="badge bg-primary text-white ms-2 px-2 py-1" style={{fontSize: '0.65rem'}}>YOU</span>}
                                              </div>
                                          </div>
                                      </td>
                                      <td className="align-middle">
                                          <div className="d-flex flex-column">
                                             <span className="text-dark fw-medium small">{entry.department || 'Unknown'}</span>
                                             <span className="text-muted small" style={{fontSize: '0.75rem'}}>Year {entry.year || '?'}</span>
                                          </div>
                                      </td>
                                      <td className="text-center fw-bold text-primary align-middle fs-5">{entry.score}</td>
                                      <td className="text-center align-middle d-none d-md-table-cell">
                                          <span className="fw-bold text-dark">{entry.commits}</span> <span className="text-muted small mx-1">/</span> <span className="fw-bold text-success">{entry.pullRequests}</span>
                                      </td>
                                      <td className="text-center align-middle">
                                          <span className={`badge px-3 py-2 rounded-pill fw-bold ${entry.level==='Legend'?'bg-danger':entry.level==='Diamond'?'bg-info text-dark':entry.level==='Platinum'?'bg-dark':'bg-warning text-dark'}`}>
                                              {entry.level}
                                          </span>
                                      </td>
                                   </tr>
                                ))
                             ) : (
                                <tr>
                                   <td colSpan="6" className="text-center py-5 text-muted border-0">No developers found in this category.</td>
                                </tr>
                             )}
                          </tbody>
                       </table>
                    </div>
                </div>
            </div>
    );
};

export default Leaderboard;
