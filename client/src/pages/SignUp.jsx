import AuthForm from 'components/AuthForm';
import { authContext } from 'contexts/auth';
import React, { useContext, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import 'style/pages/AuthPage.scss';

const SignUp = () => {
  const { appRoutes, register, uniqueUsername } = useContext(authContext);
  
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState(null);
  
  const navigate = useNavigate();
  let timeOut = useRef(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      if (!validateFields()) {
        return;
      }

      const res = await register({ username, email, password })
      if (res.status === 422) {
        setError('Email is invalid or already taken.');
        return;
      }

      navigate(`${appRoutes.LOGIN}?success=true`);
    } catch (error) {
      console.error('Error registering user:', error.message);
      setError('Error registering user. Please try again later.');
    }
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
    />
  );
};

export default SignUp;
