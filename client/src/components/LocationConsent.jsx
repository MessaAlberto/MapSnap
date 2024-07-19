import React from 'react';
import 'style/components/LocationConsent.scss';

const LocationConsent = ({ onAccept, onDecline }) => {
  return (
    <div className="location-consent-popup">
      <p>To upload your photo, we need access to your location. Please allow location access.</p>
      <button onClick={onAccept}>Allow Location</button>
      <button onClick={onDecline}>Decline</button>
    </div>
  );
};

export default LocationConsent;
