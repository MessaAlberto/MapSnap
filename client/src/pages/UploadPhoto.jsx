import PhotoUpload from 'components/DragAndDrop';
import LocationConsent from 'components/LocationConsent';
import { UtilsContext } from 'contexts/utilsProvider';
import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import 'style/pages/PhotoUpload.scss';

const PhotoUploadPage = () => {
  const { apiRoutes, appRoutes } = React.useContext(UtilsContext);
  const navigate = useNavigate();

  const [photo, setPhoto] = useState(null);
  const [hashtags, setHashtags] = useState([]);
  const [hashtagInput, setHashtagInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [locationConsent, setLocationConsent] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const hashtagList = useMemo(() => hashtags.map((hashtag) => hashtag.slice(1)), [hashtags]);

  const handlePhotoChange = (file) => {
    if (file.size > 1024 * 1024) {

      console.log('Photo selected:', file);
      alert('File size should not exceed 1MB.');
      return;
    }
    setPhoto(file);
  };


  const handleRemovePhoto = () => {
    setPhoto(null);
  };

  const handleHashtagChange = (e) => {
    setHashtagInput(e.target.value);
  };

  const handleAddHashtag = () => {
    const trimmedHashtag = hashtagInput.trim();

    if (hashtags.length >= 5) {
      alert('You can add a maximum of 5 hashtags.');
      return;
    }

    if (trimmedHashtag !== '' && !hashtags.includes('#' + trimmedHashtag) && trimmedHashtag.length <= 15) {
      setHashtags([...hashtags, '#' + trimmedHashtag]);
      setHashtagInput('');
    } else if (trimmedHashtag.length > 15) {
      alert('Hashtag must be 15 characters or less.');
    } else {
      setHashtagInput('');
      console.error('Hashtag already exists or is invalid');
    }
  };

  const handleHashtagKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddHashtag();
    }
  };

  const handleRemoveHashtag = (index) => {
    const newHashtagList = hashtags.filter((_, i) => i !== index);
    setHashtags(newHashtagList);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (photo && hashtagList.length > 0 && locationConsent) {

      if (!navigator.geolocation) {
        alert('Geolocation is not supported by your browser.');
        return;
      }

      navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;

        const formData = new FormData();
        formData.append('photo', photo);
        formData.append('hashtags', JSON.stringify(hashtagList));
        formData.append('latitude', latitude);
        formData.append('longitude', longitude);


        setLoading(true);

        try {
          const response = await fetch(apiRoutes.PHOTO, {
            method: 'POST',
            body: formData,
          });

          setLoading(false);

          if (response.ok) {
            console.log('Photo and hashtags submitted successfully!');
            setPhoto(null);
            setHashtags([]);
            setHashtagInput('');
            setShowPopup(true);
          } else if (response.status === 401) {
            navigate('/login');
            alert('You need to be logged in to submit a photo.');
          } else {
            alert('Error submitting photo and hashtags. Please try again.');
          }
        } catch (error) {
          setLoading(false);
          console.error('Error submitting photo and hashtags:', error);
        }
      }, (error) => {
        alert('Unable to retrieve your location.');
        console.error('Error getting location:', error);
      });
    } else if (!locationConsent) {
      alert('Please consent to location access before submitting.');
    } else {
      alert('Please upload a photo and add at least one hashtag.');
    }
  };

  const handleLocationConsent = () => {
    setLocationConsent(true);
  };

  const handleLocationDecline = () => {
    setLocationConsent(false);
    navigate(appRoutes.HOME);
  };

  const closePopup = () => {
    setShowPopup(false);
  };


  return (
    <div className="photo-upload-page">
      <h1>Upload Your Photo</h1>
      <form onSubmit={handleSubmit}>
        {/* Photo Upload Component */}
        {photo ? (
          <div className="preview-container">
            <h3>Preview:</h3>
            <div className="preview">
              <button className="remove-photo" onClick={handleRemovePhoto} type="button" disabled={loading}>
                &times;
              </button>
              <img src={URL.createObjectURL(photo)} alt="Preview" />
            </div>
          </div>
        ) : (
          <PhotoUpload onPhotoChange={handlePhotoChange} />
        )}

        {/* Hashtag Input */}
        <div className="input-group">
          <label htmlFor="hashtag">Add a Hashtag:</label>
          <div className="hashtag-input-container">
            <input
              type="text"
              id="hashtag"
              value={hashtagInput}
              onChange={handleHashtagChange}
              onKeyDown={handleHashtagKeyDown}
              disabled={loading}
            />
            <button type="button" onClick={handleAddHashtag} disabled={loading}>
              Add
            </button>
          </div>
        </div>

        {/* Hashtag List */}
        <div className="hashtag-list">
          {hashtags.map((hashtag, index) => (
            <div key={index} className="hashtag-item">
              <span>{hashtag}</span>
              <button type="button" onClick={() => handleRemoveHashtag(index)} disabled={loading}>
                &times;
              </button>
            </div>
          ))}
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Uploading...' : 'Submit'}
        </button>
      </form>

      {!locationConsent && (
        <LocationConsent
          onAccept={handleLocationConsent}
          onDecline={handleLocationDecline}
        />
      )}

      {showPopup && (
        <div className="popup-overlay">
          <div className="popup-content">
            <h2>Success!</h2>
            <p>Your photo has been uploaded successfully.</p>
            <button onClick={closePopup}>Close</button>
          </div>
        </div>
      )}
    </div>

  );
};

export default PhotoUploadPage;
