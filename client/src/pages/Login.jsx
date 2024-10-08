
import AuthForm from 'components/AuthForm';
import { CAPTCHA_SITE_KEY } from 'constants';
import { authContext } from 'contexts/auth';
import { UtilsContext } from 'contexts/utilsProvider';
import React, { useContext, useEffect, useState } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';
import { useLocation } from 'react-router-dom';
import 'style/pages/AuthPage.scss';

const Login = () => {
  const { login } = useContext(authContext);
  const { appRoutes } = React.useContext(UtilsContext);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [captchaValue, setCaptchaValue] = useState(null);

  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const success = query.get('success');
  const mustBeAuthenticated = query.get('mustBeAuthenticated');

  useEffect(() => {
    if (success) {
      setError('Account created successfully. Please login.');
    }
  }, [success]);

  useEffect(() => {
    if (mustBeAuthenticated) {
      setError('You must be logged in to access that or to make that action.');
    }
  }, [mustBeAuthenticated]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      setError(null);
      if (!captchaValue) {
        setError('Please complete the CAPTCHA.');
        return;
      }
      const res = await login({ username, password, captcha: captchaValue });
      console.log('res.status for login: ', res.status);
      if (res.status === 401) {
        setError('Invalid credentials. Please try again.');
        return;
      }
    } catch (error) {
      setError('Error logging in. Please try again later.');
    }
  };

  const handleCaptchaChange = (value) => {
    setCaptchaValue(value);
  };

  return (
    <AuthForm
      title='Login'
      fields={[
        {
          id: 'username',
          label: 'Username',
          type: 'text',
          placeholder: 'Enter your username',
          value: username,
          onChange: (e) => setUsername(e.target.value),
          error: error,
        },
        {
          id: 'password',
          label: 'Password',
          type: 'password',
          placeholder: 'Enter your password',
          value: password,
          onChange: (e) => setPassword(e.target.value),
          error: error,
        },
      ]}
      onSubmit={handleSubmit}
      buttonText='Login'
      error={error}
      actionText="Don't have an account?"
      actionLink={`${appRoutes.SIGNUP}`}
      actionLinkText='Sign up here'
      captcha={<ReCAPTCHA sitekey={CAPTCHA_SITE_KEY} size="compact" onChange={handleCaptchaChange} />}
    />
  );
};

export default Login;
