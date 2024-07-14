import PhotoUpload from 'components/DragAndDrop'; // Import the drag-and-drop component
import React, { useState } from 'react';
import 'style/pages/PhotoUpload.scss';

const PhotoUploadPage = () => {
  const [photo, setPhoto] = useState(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [hashtag, setHashtag] = useState('');

  const handlePhotoChange = (file) => {
    setPhoto(file);
  };

  const handleRemovePhoto = () => {
    setPhoto(null); // Reset the photo state
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setHasSubmitted(true);
    console.log('Photo submitted:', photo);
    console.log('Hashtag:', hashtag);
    // Handle submission logic here (e.g., upload to server)
  };

  return (
    <div className="photo-upload-page">
      <h1>Upload Your Photo</h1>
      <form onSubmit={handleSubmit}>
        {/* Photo Upload Component */}
        {photo ? (
          <div className="preview-container">
            <h3>Preview:</h3>
            <button className="remove-photo" onClick={handleRemovePhoto} type="button">
              X
            </button>
            <img src={URL.createObjectURL(photo)} alt="Preview" />
          </div>
        ) : (
          <PhotoUpload onPhotoChange={handlePhotoChange} />
        )}

        {/* Hashtag Input */}
        <div className="input-group">
          <label htmlFor="hashtag">Add a Hashtag:</label>
          <input
            type="text"
            id="hashtag"
            value={hashtag}
            onChange={(e) => setHashtag(e.target.value)}
            required
          />
        </div>

        {/* Other Inputs */}
        <div className="input-group">
          <label htmlFor="additional-input">Additional Input:</label>
          <input type="text" id="additional-input" />
        </div>

        <button type="submit">Submit</button>
      </form>
    </div>
  );
};

export default PhotoUploadPage;
