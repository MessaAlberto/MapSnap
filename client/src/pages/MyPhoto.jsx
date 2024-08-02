import Popup from 'components/Popup'; // Assicurati che il percorso sia corretto
import { authContext } from 'contexts/auth';
import SocketContext from 'contexts/socket';
import { UtilsContext } from 'contexts/utilsProvider';
import React, { useContext, useEffect, useState } from 'react';
import { registerEventHandler, unregisterEventHandler } from 'socketManager';
import 'style/pages/MyPhoto.scss';

const MyPhoto = () => {
  const { apiRoutes } = useContext(UtilsContext);
  const { currentUser } = useContext(authContext);
  const socket = useContext(SocketContext);
  const [photos, setPhotos] = useState([]);
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  useEffect(() => {
    const handleReceivePhotos = (data) => {
      console.log('Received photos in MyPhoto:', data);
      setPhotos(data);
    };

    const fetchPhotos = async () => {
      try {
        const response = await fetch(apiRoutes.MY_PHOTO, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Socket-ID': socket.id || '',
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
    };

    if (socket) {
      registerEventHandler('images_data', handleReceivePhotos);

      fetchPhotos();

      return () => {
        unregisterEventHandler('images_data');
      };
    }
  }, [socket]);

  const handlePhotoClick = (photo) => {
    setSelectedPhoto(photo);
  };

  const handleClosePopup = () => {
    setSelectedPhoto(null);
  };

  return (
    <div className="my-photo-container">
      <h2>My Photos</h2>
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
      {selectedPhoto && (
        <Popup data={selectedPhoto} onClose={handleClosePopup} currentUser={currentUser} />
      )}
    </div>
  );
};

export default MyPhoto;
