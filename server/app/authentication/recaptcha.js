
const verifyRecaptcha = async (recaptchaToken) => {
  const secretKey = process.env.RECAPTCHA_SECRET_KEY;

  try {
    const response = await fetch(`https://www.google.com/recaptcha/api/siteverify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      params: {
        secret: secretKey,
        response: recaptchaToken,
      },
    });

    console.log('reCAPTCHA response:', response);
    return response.status === 200;
  } catch (error) {
    console.error('Error verifying reCAPTCHA:', error);
    return false;
  }
};

module.exports = {
  verifyRecaptcha,
};