import AddPhotoButton from 'components/AddPhotoButton';
import Popup from 'components/Popup';
import { authContext } from 'contexts/auth';
import { SocketContext } from 'contexts/socket';
import { UtilsContext } from 'contexts/utilsProvider';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerEventHandler, unregisterEventHandler } from 'socketManager';
import 'style/pages/MyPhoto.scss';

const MyPhoto = () => {
  const { apiRoutes, appRoutes, fetchWithSocketId } = useContext(UtilsContext);
  const { currentUser } = useContext(authContext);
  const socket = useContext(SocketContext);
  const [photos, setPhotos] = useState([]);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchPhotos = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetchWithSocketId(apiRoutes.MY_PHOTO, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 202) {
        console.log('Photo request initiated');
      } else {
        console.error('Failed to initiate photo request');
      }
    } catch (error) {
      console.error('Error fetching photos:', error);
    }
  }, [apiRoutes.MY_PHOTO, socket.id]);


  useEffect(() => {
    const handleReceivePhotos = (data) => {
      console.log('Received photos in MyPhoto:', data);

      setPhotos(prevPhotos => {
        const photosMap = new Map(prevPhotos.map(photo => [photo.imageId, photo]));

        data.forEach(photo => {
          if (!photosMap.has(photo.imageId)) {
            photosMap.set(photo.imageId, photo);
          }
        });

        return Array.from(photosMap.values());
      });

      setLoading(false);
    };

    if (socket) {
      registerEventHandler('images_data', handleReceivePhotos);
      fetchPhotos();

      return () => {
        unregisterEventHandler('images_data');
      };
    }
  }, []);

  const handlePhotoClick = (photo) => {
    setSelectedPhoto(photo);
  };

  const handleClosePopup = () => {
    setSelectedPhoto(null);
  };

  const handleDeleteSuccess = () => {
    setPhotos([]);
    fetchPhotos();
    setSelectedPhoto(null);
  };

  const handleBringMeThere = (photo) => {
    navigate(appRoutes.HOME, { state: { photo } });
  };


  return (
    <div className="my-photo-container">
      <h2>My Photos</h2>
      <AddPhotoButton returnTo={appRoutes.MY_PHOTO} />
      {loading ? (
        <p>Loading photos, please wait...</p>
      ) : (
        <>
          {photos.length === 0 ? (
            <p>No photos available</p>
          ) : (
            <p className="photo-count">
              {photos.length === 1 ? `${photos.length} photo posted` : `${photos.length} photos posted`}
            </p>
          )}
          <div className="photo-wrapper">
            {photos.map(photo => (
              <div
                key={photo.imageId}
                className="photo-item"
                onClick={() => handlePhotoClick(photo)}
              >
                <img src={`data:image/jpeg;base64,${photo.imageBase64}`} alt={`Photo ${photo.imageId}`} />
                <div className="photo-info">
                  <p><strong>Owner:</strong> {photo.owner_username === currentUser.username ? 'You' : photo.owner_username}</p>
                  <p><strong>Topics:</strong> {photo.topics.join(', ')}</p>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
      {selectedPhoto && (
        <Popup
          data={selectedPhoto}
          onClose={handleClosePopup}
          currentUser={currentUser}
          onDeleteSuccess={handleDeleteSuccess}
          showBringMeThere={true}
          onBringMeThere={handleBringMeThere}
        />
      )}
    </div>
  );
};


export default MyPhoto;
