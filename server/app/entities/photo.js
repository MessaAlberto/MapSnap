const router = require('express').Router();
const { uploadPhotoMQTT } = require('../../mqttManager');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { uploadPhotoToS3 } = require('../../s3Manager');
const uploadsDir = path.join(__dirname, '../../tmpUploadPhotos');
const upload = multer({ dest: uploadsDir });

router.post('/', upload.single('photo'), (req, res) => {
  const photo = req.file;
  const hashtags = JSON.parse(req.body.hashtags);
  const latitude = req.body.latitude;
  const longitude = req.body.longitude;
  const userId = req.user._id;

  if (!photo || !hashtags || hashtags.length === 0) {
    return res.status(400).send('Invalid photo or hashtags');
  }

  // check dim of photo and lenght of hanstag
  if (photo.size > 1024 * 1024 || hashtags.length > 5) {
    return res.status(400).send('Invalid photo or hashtags');
  }

  hashtags.forEach(hashtag => {
    if (hashtag.length > 15) {
      return res.status(400).send('Invalid photo or hashtags');
    }
  });

  // Convert photo to base64
  fs.readFile(photo.path, async (err, data) => {
    if (err) {
      return res.status(500).send('Error reading photo');
    }

    const photoBase64 = data.toString('base64');
    const payload = {
      hashtags,
      latitude,
      longitude,
      ownerId: userId,
    };

    try {
      // Upload the photo to the MQTT broker
      console.log('Uploading photo to MQTT broker...');
      const result = await uploadPhotoMQTT(payload);
      console.log('Photo uploaded to MQTT broker:', result);      
      fs.unlink(photo.path, (err) => {
        if (err) {
          console.error('Error deleting temporary photo file', err);
        }
      });

      // Extract the ID from the result
      console.log('Photo upload result:', result);
      const { imageId } = result;
      console.log('Photo uploaded with ID:', imageId);

      // Upload the photo to S3
      const uploadSuccess = await uploadPhotoToS3(photoBase64, imageId);
      console.log('S3 upload success:', uploadSuccess);

      res.status(200).send({ ...result, s3Upload: uploadSuccess });

    } catch (error) {
      fs.unlink(photo.path, (err) => {
        if (err) {
          console.error('Error deleting temporary photo file', err);
        }
      });
      console.error('Error:', error);
      res.status(500).send(error);
    }

  });
});

module.exports = router;