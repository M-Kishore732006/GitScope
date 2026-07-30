// src/components/AuthCard.js
import React from 'react';

// Updated default width to use CSS min() for native responsiveness.
// It will take up 90vw on mobile devices and cap at 650px on larger screens.
const AuthCard = ({ title, subtitle, children, width = 'min(90vw, 650px)' }) => {
  return (
    <div className="auth-layout w-100">
      <div 
        className="glass-card" 
        style={{ 
          width: '100%',     // Ensures the element attempts to fill the width
          maxWidth: width,   // Applies the responsive 90vw -> 650px limit
          margin: '0 auto'   // Keeps the card centered on the screen
        }} 
      >
        <div className="text-center">
          <h2 className="auth-title">{title}</h2>
          <p className="auth-subtitle">{subtitle}</p>
        </div>
        {children}
      </div>
    </div>
  );
};

export default AuthCard;