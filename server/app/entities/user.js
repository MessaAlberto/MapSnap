const router = require('express').Router();
const { mqttRequest } = require('../../mqttManager');


router.get('/username/:username', async (req, res) => {
  const { username } = req.params;
  const socketId = req.headers['x-socket-id'];

  try {
    // const result = await getUserByUsername(username);
    const result = await mqttRequest(`${socketId}/user`, { req: 'getUserByUsername', username });

    if (result && result.id_usr) {
      res.status(200).send('Username exists');
    } else {
      res.status(404).send('Username does not exist');
    }
  } catch (error) {
    console.error('Error checking username:', error);
    res.status(500).send('Error checking username');
  }
});


module.exports = router;