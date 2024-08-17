import React from 'react';

const SignupInfo = () => (
  <div className="signup-info">
    <h2>Sign Up Information</h2>
    <p>To create a new account, please follow these steps:</p>
    <ol>
      <li>
        <strong>Fill Out the Registration Form:</strong> Enter your details such as username, email, and password into the registration form. Then check the CAPTCHA.
      </li>
      <li>
        <strong>Submit the Form:</strong> After filling out the form and completing the CAPTCHA, click the 'Sign Up' button to create your account.
      </li>
    </ol>
    <p>
      After signing up, you will be redirected to the login page to confirm your registration.
      <br />
      <img src="/InfoImg/signUpSuccess.png" alt="Login Redirect" className="info-image" />
    </p>
    <p>
      If you already have an account, you can log in by clicking the 'Login' button:
      <br />
      <img src="/InfoImg/loginRedirect.png" alt="Login and Sign Up Buttons" className="info-image" />
    </p>
  </div>
);

export default SignupInfo;
