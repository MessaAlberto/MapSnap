import { UtilsContext } from 'contexts/utilsProvider';
import PropTypes from 'prop-types';
import React, { useState } from 'react';

import 'style/components/Popup.scss';

const Popup = ({ 
  data, 
  onClose, 
  currentUser = null, 
  onDeleteSuccess, 
  showBringMeThere = false, 
  onBringMeThere = null 
}) => {

  const { apiRoutes } = React.useContext(UtilsContext);
  const [isDeleting, setIsDeleting] = useState(false);
  const ownerDisplayName = currentUser && data.owner_username === currentUser.username ? 'You' : data.owner_username;
  const isOwner = currentUser && data.owner_username === currentUser.username;

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`${apiRoutes.DELETE_PHOTO}/${data.imageId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        alert('Photo deleted successfully');
        onDeleteSuccess();
        onClose();
      } else {
        alert('Failed to delete photo');
      }
    } catch (error) {
      console.error('Error deleting photo:', error);
      alert('Error deleting photo');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleBringMeThere = () => {
    onBringMeThere(data);
  };


  return (
    <div className="popup-overlay" onClick={onClose}>
      <div className="popup-content" onClick={(e) => e.stopPropagation()}>
        <h2>Photo by: {ownerDisplayName}</h2>
        <img src={`data:image/jpeg;base64,${data.imageBase64}`} alt="Marker" />
        <p>{data.topics.map(topic => `#${topic}`).join(' ')}</p>
        <div className="button-container">
          {isOwner && (
            <button
              className="delete-button"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete Photo'}
            </button>
          )}
          {showBringMeThere && (
            <button onClick={handleBringMeThere}>Bring me there</button>
          )}
          <button className="close-button" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};


Popup.propTypes = {
  data: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired,
  currentUser: PropTypes.object,
  onDeleteSuccess: PropTypes.func.isRequired,
  showBringMeThere: PropTypes.bool,
  onBringMeThere: PropTypes.func, 
};

export default Popup;
