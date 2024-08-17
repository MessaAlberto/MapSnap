import React from 'react';

const LoginInfo = () => (
  <div className="login-info">
    <h2>Login Information</h2>
    <p>To access the application, please follow these steps:</p>
    <ol>
      <li>
        <strong>Enter Your Credentials:</strong> Type your username and password into the input fields.
      </li>
      <li>
        <strong>Click 'Login':</strong> After entering your credentials, check the CAPTCHA and click the 'Login' button to access your account.
      </li>
    </ol>
    <p>
      If you don't have an account, you can sign up by clicking the 'Sign Up' button:
      <br />
      <img src="/InfoImg/signUpRedirect.png" alt="Sign Up Button" className="info-image" />
    </p>
    <p>
      Once logged in, you will have access to additional features such as uploading photos and viewing your gallery.
    </p>
  </div>
);

export default LoginInfo;
