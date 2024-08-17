import React, { useEffect, useRef } from 'react';
import 'style/components/InfoPopup.scss';
import LoginInfo from './PagesInfo/LoginInfo';
import MainInfo from './PagesInfo/MainInfo';
import MyPhotoInfo from './PagesInfo/MyPhotoInfo';
import SignupInfo from './PagesInfo/SignupInfo';
import UploadPhotoInfo from './PagesInfo/UploadPhotoInfo';

const InfoPopup = ({ pathname, onClose }) => {
  const popupRef = useRef();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  const renderPopupContent = () => {
    switch (pathname) {
      case '/':
        return <MainInfo />;
      case '/login':
        return <LoginInfo />;
      case '/signup':
        return <SignupInfo />;
      case '/upload-photo':
        return <UploadPhotoInfo />;
      case '/my-photo':
        return <MyPhotoInfo />;
      default:
        return <p>Informazioni generali...</p>;
    }
  };

  return (
    <div className="info-popup-overlay" onClick={onClose}>
      <div className="info-popup-content" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="close-popup">X</button>
        {renderPopupContent()}
      </div>
    </div>
  );
};

export default InfoPopup;
