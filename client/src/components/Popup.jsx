import PropTypes from 'prop-types';
import React from 'react';
import 'style/components/Popup.scss';

const Popup = ({ data, onClose, currentUser }) => {
  console.log('currentUser: ', currentUser);
  const ownerDisplayName = data.owner_username === currentUser.username ? 'You' : data.owner_username;
  // const ownerDisplayName = data.owner_username;

  return (
    <div className="popup-overlay" onClick={onClose}>
      <div className="popup-content" onClick={(e) => e.stopPropagation()}>
        <h2>Photo by: {ownerDisplayName}</h2>
        <img src={`data:image/jpeg;base64,${data.imageBase64}`} alt="Marker" />
        <p>{data.topics.map(topic => `#${topic}`).join(' ')}</p>
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

Popup.propTypes = {
  data: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired,
  currentUser: PropTypes.object.isRequired, // Assumendo che currentUser contenga il nome dell'utente
};

export default Popup;
