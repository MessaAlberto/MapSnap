const router = require('express').Router();
const { uploadPhotoMQTT, removePhotoFromMQTT } = require('../../mqttManager');
const path = require('path');
const fs = require('fs').promises;
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage });
const { uploadPhotoToS3 } = require('../../s3Manager');

router.post('/', upload.single('photo'), async (req, res) => {
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

  try {
    const photoBase64 = photo.buffer.toString('base64');
    const payload = {
      hashtags,
      latitude,
      longitude,
      ownerId: userId,
    };

    // Upload the photo to the MQTT broker
    const result = await uploadPhotoMQTT(payload);

    // Extract the ID from the result
    const { status, imageId } = result;
    if (status !== 'Upload successful') {
      return res.status(500).send('Upload failed');
    }

    if (!imageId) {
      return res.status(500).send('Invalid image ID');
    }

    // Upload the photo to S3
    const uploadSuccess = await uploadPhotoToS3(photoBase64, imageId);
    if (!uploadSuccess) {
      try {
        const removalResult = await removePhotoFromMQTT(imageId);
        console.log('Photo removal result:', removalResult);
      } catch (removalError) {
        console.error('Error removing photo from MQTT:', removalError);
      }
      return res.status(500).send('Upload failed');
    }

    res.status(200).send({ ...result, s3Upload: uploadSuccess });
    console.log('result', result);
    console.log('uploadSuccess', uploadSuccess);
  } catch (error) {
    console.error('Error:', error);

    try {
      const removalResult = await removePhotoFromMQTT(payload.imageId);
      console.log('Photo removal result:', removalResult);
    } catch (removalError) {
      console.error('Error removing photo from MQTT:', removalError);
    }

    res.status(500).send(error);
  }
});

module.exports = router;