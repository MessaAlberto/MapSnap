import { authContext } from 'contexts/auth';
import React, { useContext, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import 'style/pages/SignUp.scss';

export default function Registration() {
  const { appRoutes } = useContext(authContext);
  const { register, uniqueUsername } = useContext(authContext);

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();
  let timeOut = useRef(null);


  function handleUsernameChange(event) {
    const value = event.target.value;
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
  }

  async function checkUniqueUsername(value) {
    try {
      const isUnique = await uniqueUsername(value);
      if (isUnique) {
        setError(null);
      } else {
        setError('Username already exists.');
      }
    } catch (error) {
      console.error('Error checking username:', error.message);
      setError('Error checking username. Please try again later.');
    }
  }

  async function handleSubmit(event) {
    try {
      event.preventDefault();
      setError(null);
      await validateFields();
      await register({ username, email, password })

      navigate(appRoutes.HOME);
    } catch (error) {
      console.error('Error submitting registration:', error.message);
      if (error.message === 'Email already exists') {
        setError('Email already exists. Please use a different email.');
      } else {
        setError('Error registering user. Please try again later.');
      }
    }
  }

  async function validateFields() {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Invalid email address.');
    } else if (username.includes(' ') || email.includes(' ') || password.includes(' ')) {
      setError('Field cannot contain spaces.');
    } else if (password < 8) {
      setError('Password must be at least 8 characters long.');
    } else if (username.length > 50) {
      setError('Username must be less than 50 characters long.');
    } else if (email.length > 100) {
      setError('Email must be less than 100 characters long.');
    } else if (password.length > 50) {
      setError('Password must be less than 50 characters long.');
    } else if (password !== confirmPassword) {
      setError('Passwords do not match.');
    } else {
      setError(null);
    }
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className='registration-page'>
      <h1>Create New Account</h1>

      <form onSubmit={handleSubmit} className='registration-form'>
        <div className='form-field'>
          <label htmlFor='username'>Username:</label>
          <input
            type='text'
            id='username'
            name='username'
            placeholder='Username'
            value={username}
            onChange={(e) => {
              handleUsernameChange(e);
              setUsername(e.target.value);
            }}
            required
          />
        </div>

        <div className='form-field'>
          <label htmlFor='email'>Email:</label>
          <input
            type='email'
            id='email'
            name='email'
            placeholder='Email address'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className='form-field'>
          <label htmlFor='password'>Password:</label>
          <input
            type={showPassword ? 'text' : 'password'}
            id='password'
            name='password'
            placeholder='Password'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <div className='form-field'>
          <label htmlFor='confirmPassword'>Confirm password:</label>
          <input
            type='password'
            id='confirmPassword'
            name='confirmPassword'
            placeholder='Confirm password'
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>

        { error && <p id='errorMessage'>{error}</p> }

  <div className='button-group'>
    <button type='button' id='backButton' onClick={() => navigate(appRoutes.HOME)}>Home</button>
    <button type='submit'>Create Account</button>
  </div>
      </form >

    <p>
      Already have an account? <Link to={appRoutes.LOGIN}>Login here</Link>.
    </p>
    </div >
  );
}