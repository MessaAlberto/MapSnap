import React, { useState } from 'react';

const PhotoUploadComponent = () => {
  const [photo, setPhoto] = useState(null);

  const handleFileChange = (e) => {
    setPhoto(e.target.files[0]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle photo submission logic here
    console.log('Photo submitted:', photo);
  };

  return (
    <div className="photo-upload-container">
      <h2>Upload Your Photo</h2>
      <form onSubmit={handleSubmit}>
        <input type="file" onChange={handleFileChange} accept="image/*" required />
        <button type="submit">Submit</button>
      </form>
    </div>
  );
};

export default PhotoUploadComponent;
