import React, { useRef } from 'react';
import './UploadScreen.css';
import { AiOutlineCloudUpload } from 'react-icons/ai';

const UploadScreen = ({ onUpload, uploading, progress }) => {
  const fileInputRef = useRef(null);

  const handleCardClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      onUpload(file); // ✅ Triggers upload flow in App.jsx
    }
  };

  return (
    <div className="upload-container">
      <div className="upload-card" onClick={handleCardClick}>
        <AiOutlineCloudUpload className="upload-icon" />
        <h3 className="upload-title">Click to Upload PDF</h3>
        <p className="upload-subtext">Upload your PDF and start chatting with it</p>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          style={{ display: 'none' }}
          accept="application/pdf"
        />
      </div>

      {uploading && (
        <div className="upload-overlay">
          <div className="loader"></div>
          <p className="upload-status">Uploading... {progress}%</p>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }}></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadScreen;
