import React, { useState } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const AuthInput = ({ icon: Icon, type, placeholder, name, value, onChange, required = true }) => {
  const [showPassword, setShowPassword] = useState(false);
  
  const isPassword = type === 'password';
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className="auth-input-group">
      <div className="auth-input-icon">
        <Icon />
      </div>
      <input
        type={inputType}
        className="auth-input"
        placeholder={placeholder}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
      />
      {isPassword && (
        <button
          type="button"
          className="toggle-password"
          onClick={() => setShowPassword(!showPassword)}
          aria-label="Toggle password visibility"
        >
          {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
        </button>
      )}
    </div>
  );
};

export default AuthInput;