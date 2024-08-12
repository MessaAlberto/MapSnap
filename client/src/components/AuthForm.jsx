import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UtilsContext } from '../contexts/utilsProvider';
import FormField from './FormField';

const AuthForm = ({
  title,
  fields,
  onSubmit,
  buttonText,
  error,
  actionText,
  actionLink,
  actionLinkText,
  actionOnClick,
  captcha,
}) => {
  const { appRoutes } = React.useContext(UtilsContext);
  const navigate = useNavigate();

  const handleActionClick = (e) => {
    if (actionOnClick) {
      actionOnClick(e);
    } else {
      e.preventDefault();
      navigate(actionLink);
    }
  };

  return (
    <div className='auth-page'>
      <h1>{title}</h1>

      <form onSubmit={onSubmit} className='auth-form'>
        {fields.map((field) => (
          <FormField
            key={field.id}
            label={field.label}
            id={field.id}
            type={field.type}
            placeholder={field.placeholder}
            value={field.value}
            onChange={field.onChange}
          />
        ))}

        {error && <p className='error-message'>{error}</p>}

        {captcha && <div className='captcha-container'>{captcha}</div>}

        <button type='submit'>{buttonText}</button>
      </form>

      <p>
        {actionText}{' '}
        {actionOnClick ? (
          <span onClick={handleActionClick}>{actionLinkText}</span>
        ) : (
          <Link to={actionLink} onClick={handleActionClick}>
            {actionLinkText}
          </Link>
        )}
        .
      </p>

      <div className='auth-form-footer'>
        <Link to={appRoutes.HOME} className='home-button'>
          Return to Home
        </Link>
      </div>
    </div>
  );
};

export default AuthForm;
