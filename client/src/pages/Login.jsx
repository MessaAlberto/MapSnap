import AuthForm from 'components/AuthForm';
import { authContext } from 'contexts/auth';
import React, { useContext, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import 'style/pages/AuthPage.scss';

const Login = () => {
  const { appRoutes, login } = useContext(authContext);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const success = query.get('success');

  useEffect(() => {
    if (success) {
      setError('Account created successfully. Please login.');
    }
  }, [success]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const res = await login({ username, password });
      if (res.status === 401) {
        setError('Invalid credentials. Please try again.');
        return;
      }

      navigate(appRoutes.HOME); 
    } catch (error) {
      console.error('Error logging in:', error.message);
      setError('Error logging in. Please try again later.');
    }
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
    />
  );
};

export default Login;
