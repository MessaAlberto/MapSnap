const jwt = require('jsonwebtoken');
const { mqttRequest } = require('../mqttManager');
const ms = require('ms');

const secretToken = process.env.JWT_SECRET_TOKEN;
const secretRefresh = process.env.JWT_SECRET_REFRESH;
const expireToken = process.env.JWT_EXPIRE_TOKEN;

const authenticateToken = async (req, res, next) => {
  const accessToken = req.cookies.accessToken;
  const refreshToken = req.cookies.refreshToken;
  const socketId = req.headers['x-socket-id'];
  console.log('Socket ID middleware:', socketId);

  // Both tokens are missing
  if (!accessToken && !refreshToken) {
    return res.status(401).send('Access and refresh tokens missing');
  }

  const verifyRefreshTokenAndUpdateAccessToken = async () => {
    try {
      const decodedRefreshToken = jwt.verify(refreshToken, secretRefresh);
      console.log('Decoded:', decodedRefreshToken);
      // const user = await getUserById(decodedRefreshToken._id);
      const user = await mqttRequest(`${socketId}/user`, { req: 'getUserById', id_usr: decodedRefreshToken._id });

      console.log('Usesssr:', user);
      if (!user || user.refresh_token !== refreshToken) {
        return res.status(403).send('Invalid refresh token');
      }

      const newAccessToken = jwt.sign({ _id: user.id }, secretToken, { expiresIn: expireToken });
      res.cookie('accessToken', newAccessToken, { httpOnly: true, secure: true, maxAge: ms(expireToken) });

      req.user = { _id: user.id_usr };
      next();
    } catch (err) {
      return res.status(403).send('Invalid refresdddddh token');
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
