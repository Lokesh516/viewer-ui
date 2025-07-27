import React, { useState } from 'react';
import UploadScreen from './components/UploadScreen';
import ChatScreen from './components/ChatScreen';
import axios from 'axios';

const App = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploaded, setUploaded] = useState(false);
  const [contextData, setContextData] = useState(null);
  const [pdfName, setPdfName] = useState('');

  const handleUpload = async (file) => {
    const formData = new FormData();
    formData.append('pdf', file);

    setIsUploading(true);
    setUploadProgress(0);

    try {
      
      const res = await axios.post(
  '/.netlify/functions/backendProxy',
  {
    target: 'upload',
    payload: formData
  },
  {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (e) => {
      const percent = Math.round((e.loaded * 100) / e.total);
      setUploadProgress(percent);
    },
  }
);


      if (res.data.status === 'success') {
        setUploaded(true);
        setContextData(res.data.context || null);
        setPdfName(res.data.filename || '');
      } else {
        alert('Upload succeeded, but server did not return expected data.');
      }
    } catch (err) {
      console.error('Upload error:', err);
      alert('Upload failed. Try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div>
      {!uploaded ? (
        <UploadScreen
          onUpload={handleUpload}
          uploading={isUploading}
          progress={uploadProgress}
        />
      ) : (
        <ChatScreen contextData={contextData} pdfName={pdfName} />
      )}
    </div>
  );
};

export default App;
