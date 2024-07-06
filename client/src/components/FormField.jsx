import React from 'react';

const FormField = ({ label, id, type, placeholder, value, onChange }) => {
  return (
    <div className='form-field'>
      <label htmlFor={id}>{label}:</label>
      <input
        type={type}
        id={id}
        name={id}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required
      />
    </div>
  );
};

export default FormField;
