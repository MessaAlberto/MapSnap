import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useState } from 'react';

const FormField = ({ label, id, type, placeholder, value, onChange }) => {
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className='form-field'>
      <label htmlFor={id}>{label}:</label>
      <div className='input-container'>
        <input
          type={type === 'password' ? (showPassword ? 'text' : 'password') : type}
          id={id}
          name={id}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required
        />
        {type === 'password' && (
          <span className='password-toggle' onClick={togglePasswordVisibility}>
            <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
          </span>
        )}
      </div>
    </div>
  );
};

export default FormField;
