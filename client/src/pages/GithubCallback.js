import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { FaGithub, FaSpinner } from 'react-icons/fa';

const GithubCallback = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [status, setStatus] = useState('Authenticating with GitHub...');
    const [error, setError] = useState(null);

    useEffect(() => {
        const urlParams = new URLSearchParams(location.search);
        const code = urlParams.get('code');

        if (!code) {
            setError('No authorization code found from GitHub.');
            setStatus('');
            return;
        }

        const linkAccount = async () => {
            try {
                const userInfoStr = localStorage.getItem('userInfo');
                if (!userInfoStr) {
                    navigate('/login');
                    return;
                }
                const token = JSON.parse(userInfoStr).token;
                
                setStatus('Linking your account and syncing repositories...');
                const config = { headers: { Authorization: `Bearer ${token}` } };
                const redirectUri = `${window.location.origin}/student/github/callback`;
                const res = await axios.post('/api/student/github/oauth', { code, redirectUri }, config);
                
                // Update local storage
                const userInfo = JSON.parse(userInfoStr);
                const updatedUser = { ...userInfo, githubLinked: true, githubUsername: res.data.username };
                localStorage.setItem('userInfo', JSON.stringify(updatedUser));
                
                setStatus('Success! Redirecting to Dashboard...');
                setTimeout(() => navigate('/student/dashboard'), 1500);

            } catch (err) {
                console.error(err);
                setError(err.response?.data?.message || 'Verification failed. Please try again.');
                setStatus('');
            }
        };

        linkAccount();
    }, [location, navigate]);

    return (
        <div className="d-flex justify-content-center align-items-center min-vh-100 bg-light">
            <div className="card shadow-sm border-0 p-5 text-center" style={{ maxWidth: '400px', width: '100%' }}>
                <FaGithub className="text-secondary mb-4 mx-auto" style={{ fontSize: '4rem' }} />
                
                {status && (
                    <>
                        <h4 className="fw-bold mb-3">Connecting...</h4>
                        <p className="text-muted d-flex align-items-center justify-content-center gap-2">
                            <FaSpinner className="fa-spin text-primary" /> {status}
                        </p>
                    </>
                )}

                {error && (
                    <>
                        <h4 className="fw-bold text-danger mb-3">Error</h4>
                        <p className="text-muted">{error}</p>
                        <button className="btn btn-primary mt-3 w-100 fw-semibold" onClick={() => navigate('/student/dashboard')}>
                            Return to Dashboard
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

export default GithubCallback;
