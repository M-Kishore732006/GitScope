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
        <div className="bg-light min-vh-100 py-5">
            <div className="container">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h2 className="fw-bold mb-0"><FaTrophy className="text-warning me-2"/> Leaderboard</h2>
                    <div className="btn-group shadow-sm">
                       <button className={`btn btn-outline-primary ${filter === 'overall' ? 'active' : ''}`} onClick={() => setFilter('overall')}>Overall</button>
                       <button className={`btn btn-outline-primary ${filter === 'department' ? 'active' : ''}`} onClick={() => setFilter('department')}>Department</button>
                       <button className={`btn btn-outline-primary ${filter === 'year' ? 'active' : ''}`} onClick={() => setFilter('year')}>Year-wise</button>
                    </div>
                </div>

                <div className="card shadow-sm border-0">
                    <div className="table-responsive">
                       <table className="table table-hover align-middle mb-0">
                          <thead className="table-light">
                             <tr>
                                <th scope="col" className="text-muted text-uppercase small fw-semibold text-center w-auto">Rank</th>
                                <th scope="col" className="text-muted text-uppercase small fw-semibold">Student Name</th>
                                <th scope="col" className="text-muted text-uppercase small fw-semibold">Department & Year</th>
                                <th scope="col" className="text-muted text-uppercase small fw-semibold text-center">Score</th>
                                <th scope="col" className="text-muted text-uppercase small fw-semibold text-center d-none d-md-table-cell">Commits</th>
                                <th scope="col" className="text-muted text-uppercase small fw-semibold text-center d-none d-md-table-cell">PRs</th>
                                <th scope="col" className="text-muted text-uppercase small fw-semibold text-center">Level</th>
                             </tr>
                          </thead>
                          <tbody>
                             {displayData.length > 0 ? (
                                displayData.map((entry, idx) => (
                                   <tr key={idx} className={entry.name === currentUser ? 'table-primary bg-opacity-10' : ''}>
                                      <td className="text-center fw-bold">
                                         {entry.displayRank === 1 ? <FaMedal className="text-warning fs-4" /> :
                                          entry.displayRank === 2 ? <FaMedal className="text-secondary fs-4" /> :
                                          entry.displayRank === 3 ? <FaMedal className="text-danger fs-4" style={{color: '#cd7f32'}} /> : `#${entry.displayRank}`}
                                      </td>
                                      <td className="fw-semibold">
                                          {entry.name} {entry.name === currentUser && <span className="badge bg-primary ms-1">You</span>}
                                      </td>
                                      <td className="text-muted">
                                          <span className="badge bg-light text-dark border me-1">{entry.department || 'N/A'}</span>
                                          <span className="badge bg-light text-dark border">{entry.year || 'N/A'} Year</span>
                                      </td>
                                      <td className="text-center fw-bold text-primary">{entry.score}</td>
                                      <td className="text-center d-none d-md-table-cell">{entry.commits}</td>
                                      <td className="text-center d-none d-md-table-cell">{entry.pullRequests}</td>
                                      <td className="text-center">
                                          <span className={`badge ${entry.level==='Legend'?'bg-danger':entry.level==='Diamond'?'bg-info':entry.level==='Platinum'?'bg-dark':'bg-warning'}`}>
                                              {entry.level}
                                          </span>
                                      </td>
                                   </tr>
                                ))
                             ) : (
                                <tr>
                                   <td colSpan="7" className="text-center py-5 text-muted">No students found in this category.</td>
                                </tr>
                             )}
                          </tbody>
                       </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Leaderboard;
