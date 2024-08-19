const { S3Client, ListBucketsCommand, ListObjectsV2Command, GetObjectCommand, PutObjectCommand, DeleteObjectCommand} = require('@aws-sdk/client-s3');
const { fromIni } = require('@aws-sdk/credential-provider-ini');
require('dotenv').config();

const S3_BUCKET_NAME = process.env.S3_BUCKET_NAME;

// Configurazione client S3
const s3Client = new S3Client({
  region: 'eu-central-1',
  credentials: fromIni()
});

// Check S3 connection
async function testS3Connection() {
  try {
    const data = await s3Client.send(new ListBucketsCommand({}));
    console.log('Connected to S3. Buckets:', data.Buckets);
  } catch (error) {
    console.error('Error connecting to S3:', error);
  }
}


// Retrieve image contents from S3
async function getFoldersContentsFromS3(idList, onProgress) {
  const folderPromises = idList.map(async (id) => {
    const params = {
      Bucket: S3_BUCKET_NAME,
      Prefix: `${id}/`
    };

    try {
      const data = await s3Client.send(new ListObjectsV2Command(params));
      const imaJpgKey = data.Contents.find(obj => obj.Key.endsWith('ima.jpg'));

      if (imaJpgKey) {
        const imaParams = {
          Bucket: 'mqtt-images-storage',
          Key: imaJpgKey.Key
        };

        const imaResponse = await s3Client.send(new GetObjectCommand(imaParams));
        const base64Image = await convertImageToBase64(imaResponse.Body);

        return {
          id: id,
          imageBase64: base64Image
        };
      } else {
        console.log(`Missing image file in folder ${id}`);
        return null;
      }
    } catch (error) {
      console.error('Error retrieving folder contents:', error);
      return null;
    }
  });

  // Process each image as it becomes available
  const results = await Promise.all(folderPromises);
  results.forEach(result => {
    if (result) onProgress(result);
  });
}


async function convertImageToBase64(stream) {
  const chunks = [];
  return new Promise((resolve, reject) => {
    stream.on('data', (chunk) => chunks.push(chunk));
    stream.on('end', () => resolve(Buffer.concat(chunks).toString('base64')));
    stream.on('error', (err) => reject(`Error converting image to base64: ${err.message}`));
  });
}

// Function to upload photo to S3
async function uploadPhotoToS3(photoBase64, id) {
  const bucketName = 'mqtt-images-storage';
  const key = `${id}/ima.jpg`;
  const buffer = Buffer.from(photoBase64, 'base64');

  try {
    const params = {
      Bucket: bucketName,
      Key: key,
      Body: buffer,
      ContentEncoding: 'base64',
      ContentType: 'image/jpeg'
    };

    await s3Client.send(new PutObjectCommand(params));
    return true;
  } catch (error) {
    console.error('Error uploading photo to S3:', error);
    return false;
  }
}

// Function to delete photo from S3
async function deletePhotoFromS3(id) {
  const bucketName = 'mqtt-images-storage';
  const key = `${id}/ima.jpg`;

  try {
    const params = {
      Bucket: bucketName,
      Key: key
    };

    await s3Client.send(new DeleteObjectCommand(params));
    console.log(`Photo ${id} deleted from S3`);
    return true;
  } catch (error) {
    console.error('Error deleting photo from S3:', error);
    return false;
  }
}

module.exports = { testS3Connection, getFoldersContentsFromS3, uploadPhotoToS3, deletePhotoFromS3 };
