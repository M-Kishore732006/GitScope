import React from 'react';
import { FaTimes, FaDownload } from 'react-icons/fa';

const MediaLightboxModal = ({ show, onClose, mediaUrl, filename }) => {
  if (!show || !mediaUrl) return null;

  return (
    <div 
      className="modal show d-block" 
      tabIndex="-1" 
      onClick={onClose}
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.85)', zIndex: 1070 }}
    >
      <div 
        className="modal-dialog modal-dialog-centered modal-lg" 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-content border-0 bg-transparent text-white">
          <div className="d-flex justify-content-between align-items-center p-3">
            <span className="small text-truncate" style={{ maxWidth: '70%' }}>
              {filename || 'Image Attachment'}
            </span>
            <div className="d-flex align-items-center gap-2">
              <a 
                href={mediaUrl} 
                download={filename || 'download'} 
                className="btn btn-sm btn-outline-light d-flex align-items-center gap-1"
                target="_blank" 
                rel="noreferrer"
              >
                <FaDownload /> Download
              </a>
              <button 
                type="button" 
                className="btn btn-sm btn-outline-light" 
                onClick={onClose}
              >
                <FaTimes />
              </button>
            </div>
          </div>

          <div className="modal-body text-center p-2">
            <img 
              src={mediaUrl} 
              alt={filename || 'Attachment'} 
              className="img-fluid rounded-3 shadow"
              style={{ maxHeight: '75vh', objectFit: 'contain' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MediaLightboxModal;
