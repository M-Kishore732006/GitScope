import React from 'react';
import { Link } from 'react-router-dom'; // 1. Import Link from react-router-dom
import './SignUp.css'; 

const SignUp = () => {
  return (
    <div className="container-fluid vh-100 p-0">
      <div className="row g-0 h-100">
        
        {/* Left Side: Illustration / Welcome */}
        <div className="col-md-6 d-none d-md-flex flex-column justify-content-between left-side-bg position-relative">
          <div className="spacer-top"></div>
          
          <div className="text-center text-white z-index-1 mt-5">
            <h1 className="display-4 fw-normal">Join Us With GitScope</h1>
            <p className="lead fs-6 text-light opacity-75">Create Your Account to Get Started</p>
          </div>

          <div className="text-center pb-4 z-index-1 mt-auto bg-white-wave">
            <span className="text-dark fw-bold tracking-wide small"></span>
          </div>
        </div>

        {/* Right Side: Sign Up Form */}
        <div className="col-md-6 d-flex flex-column justify-content-center p-5 bg-white overflow-auto">
          <div className="w-100 mx-auto" style={{ maxWidth: '400px' }}>
            
            {/* Greeting */}
            <div className="mb-4">
              <span className="text-muted fw-semibold">Welcome !</span><br />
              <span className="text-gradient-purple fw-bold fs-5">Let's Get Started</span>
            </div>

            {/* Title */}
            <h4 className="text-center mb-4 fw-bold text-dark">
              <span className="text-gradient-purple">Create</span> Your Account
            </h4>

            {/* Form */}
            <form>
              <div className="mb-3">
                <label className="text-muted small fw-semibold mb-1">Full Name</label>
                <input 
                  type="text" 
                  className="form-control custom-input" 
                  placeholder="John Doe" 
                  required
                />
              </div>

              <div className="mb-3">
                <label className="text-muted small fw-semibold mb-1">Email Address</label>
                <input 
                  type="email" 
                  className="form-control custom-input" 
                  placeholder="john@example.com" 
                  required
                />
              </div>

              <div className="mb-3">
                <label className="text-muted small fw-semibold mb-1">Phone Number</label>
                <input 
                  type="tel" 
                  className="form-control custom-input" 
                  placeholder="98765 43210" 
                  required
                />
              </div>

              <div className="mb-4">
                <label className="text-muted small fw-semibold mb-1">Password</label>
                <input 
                  type="password" 
                  className="form-control custom-input" 
                  placeholder="••••••••" 
                  required
                />
              </div>

              {/* Submit Button */}
              <button type="submit" className="btn text-white w-100 fw-bold py-2 submit-btn mb-4 tracking-wide mt-2">
                SIGN UP
              </button>

              {/* Login Navigation Link */}
              <div className="text-center">
                <span className="text-muted small fw-semibold">Already registered? </span>
                {/* 2. Replace <a> tag with <Link> */}
                <Link to="/login" className="text-gradient-purple text-decoration-none small fw-bold">
                  Login here
                </Link>
              </div>
            </form>

          </div>
        </div>

      </div>
    </div>
  );
};

export default SignUp;