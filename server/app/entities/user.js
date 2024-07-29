const router = require('express').Router();
const { getUserByUsername } = require('../../database');


router.get('/username/:username', async (req, res) => {
  const { username } = req.params;

  try {
    const result = await getUserByUsername(username);

    if (result && result.length > 0) {
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