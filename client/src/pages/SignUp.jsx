import AuthForm from 'components/AuthForm';
import { CAPTCHA_SITE_KEY } from 'constants';
import { authContext } from 'contexts/auth';
import { UtilsContext } from 'contexts/utilsProvider';
import React, { useContext, useRef, useState } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';
import 'style/pages/AuthPage.scss';

const SignUp = () => {
  const { register, uniqueUsername } = useContext(authContext);
  const { appRoutes } = React.useContext(UtilsContext);
  
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState(null);
  const [captchaValue, setCaptchaValue] = useState(null);
  
  let timeOut = useRef(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      setError(null);
      if (!captchaValue) {
        setError('Please complete the CAPTCHA.');
        return;
      }
      if (!validateFields()) {
        return;
      }

      const res = await register({ username, email, password, captcha: captchaValue });
      if (res.status === 422) {
        setError('Email is invalid or already taken.');
        return;
      }
    } catch (error) {
      console.error('Error registering user:', error.message);
      setError('Error registering user. Please try again later.');
    }
  };

  const handleCaptchaChange = (value) => {
    setCaptchaValue(value);
  };

  const validateFields = () => {
    setError(null);
    if (username.includes(' ') || email.includes(' ') || password.includes(' ')) {
      setError('Field cannot contain spaces.');
      return false;
    } else if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return false;
    } else if (username.length > 50) {
      setError('Username must be less than 50 characters long.');
      return false;
    } else if (email.length > 100) {
      setError('Email must be less than 100 characters long.');
      return false;
    } else if (password.length > 50) {
      setError('Password must be less than 50 characters long.');
      return false;
    } else if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return false;
    }
    return true;
  };

  const checkUniqueUsername = async (value) => {
    try {
      const isUnique = await uniqueUsername(value);
      if (!isUnique) {
        setError('Username already exists.');
      } else {
        setError(null);
      }
    } catch (error) {
      console.error('Error checking username:', error.message);
      setError('Error checking username. Please try again later.');
    }
  };

  const handleUsernameChange = (event) => {
    const value = event.target.value;
    setUsername(value);
    if (timeOut.current) {
      clearTimeout(timeOut.current);
    }

    timeOut.current = setTimeout(async () => {
      if (value === '')
        setError('Username cannot be empty.');
      else {
        await checkUniqueUsername(value);
      }
    }, 1000);
  };

  return (
    <AuthForm
      title='Create New Account'
      fields={[
        {
          id: 'username',
          label: 'Username',
          type: 'text',
          placeholder: 'Enter your username',
          value: username,
          onChange: handleUsernameChange,
          error: error,
        },
        {
          id: 'email',
          label: 'Email',
          type: 'email',
          placeholder: 'Enter your email',
          value: email,
          onChange: (e) => setEmail(e.target.value),
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
        {
          id: 'confirmPassword',
          label: 'Confirm Password',
          type: 'password',
          placeholder: 'Confirm your password',
          value: confirmPassword,
          onChange: (e) => setConfirmPassword(e.target.value),
          error: error,
        },
      ]}
      onSubmit={handleSubmit}
      buttonText='Create Account'
      error={error}
      actionText="Already have an account?"
      actionLink={`${appRoutes.LOGIN}`}
      actionLinkText='Login here'
      captcha={<ReCAPTCHA sitekey={CAPTCHA_SITE_KEY} size="compact" onChange={handleCaptchaChange} />}
    />
  );
};

export default SignUp;
