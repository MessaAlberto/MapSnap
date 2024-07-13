const router = require('express').Router();
const db = require('../../database');



router.get('/username/:username', async (req, res) => {
  const { username } = req.params;

  try {
    const query = {
      text: 'SELECT * FROM users WHERE username = $1',
      values: [username],
    };

    const result = await db.query(query);

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