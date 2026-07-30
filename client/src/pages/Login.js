import React from 'react';
import './Auth.css'; // Importing custom styles for gradients
import { Link } from 'react-router-dom'; 

const Login = () => {
  return (
    <div className="container-fluid vh-100 p-0">
      <div className="row g-0 h-100">
        
        {/* Left Side: Illustration / Welcome */}
        <div className="col-md-6 d-none d-md-flex flex-column justify-content-between left-side-bg position-relative">
          <div className="spacer-top"></div>
          
          <div className="text-center text-white z-index-1 mt-5">
            <h1 className="display-4 fw-normal">Welcome Page</h1>
            <p className="lead fs-6 text-light opacity-75">Sign In To Your Account</p>
          </div>

          <div className="text-center pb-4 z-index-1 mt-auto bg-white-wave">
            <span className="text-dark fw-bold tracking-wide small"></span>
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="col-md-6 d-flex flex-column justify-content-center p-5 bg-white">
          <div className="w-100 mx-auto" style={{ maxWidth: '400px' }}>
            
            

            {/* Title */}
            <h4 className="text-center mb-5 fw-bold text-dark">
              <span className="text-gradient-purple">Login</span> Your Account
            </h4>

            {/* Form */}
            <form>
              <div className="mb-4">
                <label className="text-muted small fw-semibold mb-1">Email Address</label>
                <input 
                  type="email" 
                  className="form-control custom-input" 
                  placeholder="" 
                />
              </div>

              <div className="mb-4">
                <label className="text-muted small fw-semibold mb-1">Password</label>
                <input 
                  type="password" 
                  className="form-control custom-input" 
                  placeholder="" 
                />
              </div>

              {/* Form Options */}
              <div className="d-flex justify-content-between align-items-center mb-5 small">
                <div className="form-check">
                  <input type="checkbox" className="form-check-input shadow-none rounded-0 border-dark" id="rememberMe" />
                  <label className="form-check-label text-muted fw-semibold" htmlFor="rememberMe">
                    Remember
                  </label>
                </div>
                <a href="#forgot" className="text-muted text-decoration-none fw-semibold">
                  Forgot Password ?
                </a>
              </div>

              {/* Submit Button */}
              <button type="submit" className="btn text-white w-100 fw-bold py-2 submit-btn mb-4 tracking-wide">
                SUBMIT
              </button>

              <div className="text-center">
                <span className="text-muted small fw-semibold">If New User </span>
                {/* 2. Replace <a> tag with <Link> */}
                <Link to="/signup" className="text-gradient-purple text-decoration-none small fw-bold">
                  Create Account
                </Link>
              </div>
            </form>

          </div>
        </div>

      </div>
    </div>
  );
};

export default Login;