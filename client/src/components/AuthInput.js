import React from 'react';

const AuthInput = ({ icon: Icon, type, name, placeholder, value, onChange }) => {
  return (
    <div className="auth-input-group">
      <input
        type={type}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="auth-input"
        required
      />
      {Icon && <Icon className="auth-input-icon" />}
    </div>
  );
};

export default AuthInput;