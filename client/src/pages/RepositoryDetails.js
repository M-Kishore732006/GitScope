import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';
import { FaGithub, FaStar, FaCodeBranch, FaBook, FaLanguage, FaArrowLeft, FaClock } from 'react-icons/fa';

const RepositoryDetails = () => {
    const { id } = useParams(); // Using the repository name as the ID in the route URL
    const [repo, setRepo] = useState(null);
    const [loading, setLoading] = useState(true);

    const userInfoStr = localStorage.getItem('userInfo');
    const token = userInfoStr ? JSON.parse(userInfoStr).token : null;

    useEffect(() => {
        const fetchRepository = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${token}` } };
                const response = await axios.get(`/api/student/repository/${id}`, config);
                setRepo(response.data);
            } catch (error) {
                console.error('Error fetching repository details', error);
            } finally {
                setLoading(false);
            }
        };
        fetchRepository();
    }, [id, token]);

    if (loading) {
        return <div className="d-flex justify-content-center align-items-center min-vh-100">Loading Repository...</div>;
    }

    if (!repo) {
        return (
            <div className="d-flex flex-column justify-content-center align-items-center min-vh-100">
               <h3 className="text-muted mb-3">Repository not found</h3>
               <Link to="/student/dashboard" className="btn btn-primary d-flex align-items-center">
                  <FaArrowLeft className="me-2"/> Back to Dashboard
               </Link>
            </div>
        );
    }

    return (
        <div className="bg-light min-vh-100 py-5">
            <div className="container">
                <Link to="/student/dashboard" className="text-decoration-none text-muted mb-4 d-inline-block p-2">
                    <FaArrowLeft className="me-2"/> Back to Dashboard
                </Link>
                
                <div className="card shadow-lg border-0 mb-4 p-4 rounded-3">
                   <div className="d-flex flex-column flex-md-row justify-content-between align-items-start">
                       <div>
                           <h2 className="fw-bold mb-2 d-flex align-items-center text-primary">
                               <FaBook className="me-3 text-secondary"/> {repo.name}
                           </h2>
                           <p className="text-muted fs-5 mb-4">{repo.description || 'No description provided.'}</p>
                       </div>
                       <div>
                           <a href={repo.url} target="_blank" rel="noreferrer" className="btn btn-outline-dark d-flex align-items-center fw-bold">
                               <FaGithub className="me-2 fs-5" /> View on GitHub
                           </a>
                       </div>
                   </div>
                   
                   <hr className="my-4" />

                   <div className="row g-4 text-center">
                      <div className="col-6 col-md-3">
                         <div className="p-3 bg-light rounded border">
                            <FaLanguage className="fs-3 text-primary mb-2" />
                            <h4 className="fw-bold mb-0">{repo.primaryLanguage}</h4>
                            <small className="text-muted text-uppercase fw-semibold">Primary Language</small>
                         </div>
                      </div>
                      <div className="col-6 col-md-3">
                         <div className="p-3 bg-light rounded border">
                            <FaStar className="fs-3 text-warning mb-2" />
                            <h4 className="fw-bold mb-0">{repo.stars}</h4>
                            <small className="text-muted text-uppercase fw-semibold">Stars</small>
                         </div>
                      </div>
                      <div className="col-6 col-md-3">
                         <div className="p-3 bg-light rounded border">
                            <FaCodeBranch className="fs-3 text-secondary mb-2" />
                            <h4 className="fw-bold mb-0">{repo.forks}</h4>
                            <small className="text-muted text-uppercase fw-semibold">Forks</small>
                         </div>
                      </div>
                      <div className="col-6 col-md-3">
                         <div className="p-3 bg-light rounded border">
                            <FaClock className="fs-3 text-info mb-2" />
                            <h5 className="fw-bold mb-0 mt-1">{repo.createdAt ? new Date(repo.createdAt).toLocaleDateString() : 'Unknown'}</h5>
                            <small className="text-muted text-uppercase fw-semibold">Created Date</small>
                         </div>
                      </div>
                   </div>

                </div>
            </div>
        </div>
    );
};

export default RepositoryDetails;
