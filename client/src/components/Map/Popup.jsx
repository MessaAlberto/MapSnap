import PropTypes from 'prop-types';
import React from 'react';

const Popup = ({ data, onClose }) => {
  return (
    <div className="popup-overlay" onClick={onClose}>
      <div className="popup-content" onClick={(e) => e.stopPropagation()}>
        <h2>Photo by: {data.owner_username}</h2>
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
};

export default Popup;
