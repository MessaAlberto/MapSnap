import { UtilsContext } from 'contexts/utilsProvider';
import PropTypes from 'prop-types';
import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import 'style/components/AddPhotoButton.scss';

const AddPhotoButton = ({ returnTo }) => {
  const { appRoutes } = useContext(UtilsContext);
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(appRoutes.UPLOAD_PHOTO, { state: { returnTo } });
  };

  return (
    <div className="add-photo-button" onClick={handleClick}>
      Add Your Photo
    </div>
  );
};
AddPhotoButton.propTypes = {
  returnTo: PropTypes.string.isRequired,
};

export default AddPhotoButton;
