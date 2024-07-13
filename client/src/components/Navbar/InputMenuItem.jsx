import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useState } from 'react';

const MenuItem = ({ icon, placeholder, onSearchRequest }) => {
  const [inputValue, setInputValue] = useState('');

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleSearchRequest = () => {
    const trimmedValue = inputValue.trim();
    setInputValue(trimmedValue);
    onSearchRequest(trimmedValue);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearchRequest();
    }
  }

  return (
    <li className="menu-item">
      <div>
        <FontAwesomeIcon icon={icon} size="lg" style={{ color: '#ffffff' }} />
      </div>
      <div className='menu-input-container'>
          <input
            type="text"
            placeholder={placeholder}
            className="menu-input"
            value={inputValue}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
          />
        <div className='start-research' onClick={handleSearchRequest}>
          <FontAwesomeIcon icon={faMagnifyingGlass} size="lg" style={{ color: '#1b5ac2' }} />
        </div>
      </div>
    </li>
  );
};

export default MenuItem;
