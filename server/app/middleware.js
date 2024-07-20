const jwt = require('jsonwebtoken');
const { getUserById } = require('../database');
const ms = require('ms');

const secretToken = process.env.JWT_SECRET_TOKEN;
const secretRefresh = process.env.JWT_SECRET_REFRESH;
const expireToken = process.env.JWT_EXPIRE_TOKEN;

const authenticateToken = async (req, res, next) => {
  const accessToken = req.cookies.accessToken;
  const refreshToken = req.cookies.refreshToken;

  // Both tokens are missing
  if (!accessToken && !refreshToken) {
    return res.status(401).send('Access and refresh tokens missing');
  }

  const verifyRefreshTokenAndUpdateAccessToken = async () => {
    try {
      const decodedRefreshToken = jwt.verify(refreshToken, secretRefresh);
      const user = await getUserById(decodedRefreshToken._id);

      if (!user || user.refresh_token !== refreshToken) {
        return res.status(403).send('Invalid refresh token');
      }

      const newAccessToken = jwt.sign({ _id: user.id }, secretToken, { expiresIn: expireToken });
      res.cookie('accessToken', newAccessToken, { httpOnly: true, secure: true, maxAge: ms(expireToken) });

      req.user = { _id: user.id };
      next();
    } catch (err) {
      return res.status(403).send('Invalid refresh token');
    }
  };

  // Access token is missing
  if (!accessToken) {
    return verifyRefreshTokenAndUpdateAccessToken();
  }

  // Access token is present
  try {
    // Access token is valid
    const user = jwt.verify(accessToken, secretToken);
    req.user = user;
    next();
  } catch (err) {
    // Access token is expired
    if (err.name === 'TokenExpiredError') {
      if (!refreshToken) {
        return res.status(403).send('Refresh token missing');
      }

      return verifyRefreshTokenAndUpdateAccessToken();
    } else {
      return res.status(403).send('Invalid access token');
    }
  }
};

module.exports = { authenticateToken };
