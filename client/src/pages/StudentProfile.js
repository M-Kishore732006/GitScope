import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaUserEdit, FaGithub, FaGraduationCap } from 'react-icons/fa';

const StudentProfile = () => {
  const navigate = useNavigate();
  const userInfoStr = localStorage.getItem('userInfo');
  const userInfo = userInfoStr ? JSON.parse(userInfoStr) : null;
  const token = userInfo?.token;

  const [formData, setFormData] = useState({
    fullName: '',
    department: '',
    year: '',
    section: '',
    githubUsername: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      };

      const response = await axios.put('/api/student/profile', formData, config);
      
      const updatedUserInfo = { ...userInfo, profileCompleted: response.data.profileCompleted };
      localStorage.setItem('userInfo', JSON.stringify(updatedUserInfo));
      
      navigate('/student/dashboard');
    } catch (error) {
      setErrorMsg(error.response?.data?.message || 'Error updating profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex flex-column align-items-center justify-content-center min-vh-100 bg-light py-5">
      <div className="w-100" style={{ maxWidth: '500px' }}>
        <div className="text-center mb-4">
          <h2 className="fw-bold text-dark border-bottom border-primary pb-2 d-inline-block">
             Complete Your Profile
          </h2>
          <p className="text-muted mt-2">
             Welcome to GitScope! Let's get to know you better.
          </p>
        </div>

        <div className="card shadow-sm border-0 p-4">
          {errorMsg && (
            <div className="alert alert-danger p-3 mb-4" role="alert">
               {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="fullName" className="form-label text-muted fw-semibold">Full Name</label>
              <div className="input-group">
                <span className="input-group-text bg-white text-muted border-end-0">
                  <FaUserEdit />
                </span>
                <input type="text" name="fullName" id="fullName" value={formData.fullName} onChange={handleChange} required className="form-control border-start-0 ps-0" placeholder="John Doe" />
              </div>
            </div>

            <div className="row mb-3">
              <div className="col-md-6 mb-3 mb-md-0">
                 <label htmlFor="department" className="form-label text-muted fw-semibold">Department</label>
                 <div className="input-group">
                    <span className="input-group-text bg-white text-muted border-end-0">
                       <FaGraduationCap />
                    </span>
                    <input type="text" name="department" id="department" value={formData.department} onChange={handleChange} required className="form-control border-start-0 ps-0" placeholder="CSE" />
                 </div>
              </div>
              
              <div className="col-md-6">
                 <label htmlFor="year" className="form-label text-muted fw-semibold">Year</label>
                 <select id="year" name="year" value={formData.year} onChange={handleChange} required className="form-select text-muted">
                    <option value="" disabled>Select Year</option>
                    <option value="1st Year">1st Year</option>
                    <option value="2nd Year">2nd Year</option>
                    <option value="3rd Year">3rd Year</option>
                    <option value="4th Year">4th Year</option>
                 </select>
              </div>
            </div>

            <div className="row mb-4">
               <div className="col-md-5 mb-3 mb-md-0">
                  <label htmlFor="section" className="form-label text-muted fw-semibold">Section <small>(Optional)</small></label>
                  <input type="text" name="section" id="section" value={formData.section} onChange={handleChange} className="form-control" placeholder="A" />
               </div>
               
               <div className="col-md-7">
                  <label htmlFor="githubUsername" className="form-label text-muted fw-semibold">GitHub Username</label>
                  <div className="input-group">
                    <span className="input-group-text bg-white text-muted border-end-0">
                       <FaGithub />
                    </span>
                    <input type="text" name="githubUsername" id="githubUsername" value={formData.githubUsername} onChange={handleChange} required className="form-control border-start-0 ps-0" placeholder="octocat" />
                 </div>
               </div>
            </div>

            <div className="d-grid mt-2">
              <button disabled={loading} type="submit" className="btn btn-primary py-2 fw-semibold">
                {loading ? 'Saving...' : 'Save Profile & Continue'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;
