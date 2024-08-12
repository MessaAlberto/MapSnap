const router = require('express').Router();
const path = require('path');
const fs = require('fs').promises;
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage });
const { uploadPhotoMQTT, removePhotoFromMQTT, getImaByOwnerId } = require('../../mqttManager');
const { socketClientMap } = require('../../socketManager');
const { uploadPhotoToS3, deletePhotoFromS3 } = require('../../s3Manager');
const { verifyRecaptcha } = require('../authentication/recaptcha');

router.post('/', upload.single('photo'), async (req, res) => {
  const photo = req.file;
  const hashtags = JSON.parse(req.body.hashtags);
  const latitude = req.body.latitude;
  const longitude = req.body.longitude;
  const captcha = req.body.captcha;
  const userId = req.user._id;

  const isCaptchaValid = await verifyRecaptcha(captcha);
  if (!isCaptchaValid) {
    return res.status(400).send('CAPTCHA verification failed');
  }

  if (!photo || !hashtags || hashtags.length === 0) {
    return res.status(400).send('Invalid photo or hashtags');
  }

  // check dim of photo and lenght of hanstag
  if (photo.size > 1024 * 1024 || hashtags.length > 5) {
    return res.status(400).send('Invalid photo or hashtags');
  }

  hashtags.forEach(hashtag => {
    hashtag = hashtag.trim();
    hashtag = hashtag.toLowerCase();
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
        const removalResult = await removePhotoFromMQTT(imageId, userId);
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
      const removalResult = await removePhotoFromMQTT(payload.imageId, userId);
      console.log('Photo removal result:', removalResult);
    } catch (removalError) {
      console.error('Error removing photo from MQTT:', removalError);
    }

    res.status(500).send(error);
  }
});

router.get('/my', async (req, res) => {
  const socketId = req.headers['x-socket-id'];

  if (!socketId) {
    return res.status(400).send('Socket ID is required');
  }

  if (!socketClientMap[socketId]) {
    return res.status(404).send('Socket not found');
  }

  try {
    await getImaByOwnerId(req.user._id, socketId);
    res.status(202).send('Photo request initiated');
  } catch (error) {
    console.error('Error initiating photo request:', error);
    res.status(500).send('Failed to initiate photo request');
  }
});

router.delete('/:id', async (req, res) => {
  const imageId = req.params.id;
  const userId = req.user._id;

  try {
    // Remove the photo from MQTT
    const removalResult = await removePhotoFromMQTT(imageId, userId);
    console.log('Photo removal result:', removalResult);
    if (removalResult.status !== 'Deletion successful') {
      return res.status(500).send('Delete failed from MQTT');
    }

    // Remove the photo from S3
    const s3RemovalSuccess = await deletePhotoFromS3(imageId);
    if (!s3RemovalSuccess) {
      return res.status(500).send('Delete failed from S3');
    }

    res.status(200).send(removalResult);
  } catch (error) {
    console.error('Error deleting photo:', error);
    res.status(500).send(error);
  }
});


module.exports = router;