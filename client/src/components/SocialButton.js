import React from 'react';

const SocialButton = ({ icon: Icon, text, onClick }) => {
  return (
    <button type="button" className="btn-social" onClick={onClick}>
      <Icon size={20} />
      <span>{text}</span>
    </button>
  );
};

export default SocialButton;