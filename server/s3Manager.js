const { S3Client, ListBucketsCommand, ListObjectsV2Command, GetObjectCommand } = require('@aws-sdk/client-s3');
const { fromIni } = require('@aws-sdk/credential-provider-ini');

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
async function getFoldersContentsFromS3(idList) {
  const foldersData = [];

  for (const id of idList) {
    const params = {
      Bucket: 'mqtt-images-storage',
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

        foldersData.push({
          id: id,
          imageBase64: base64Image
        });
      } else {
        console.log(`Missing image file in folder ${id}`);
      }
    } catch (error) {
      console.error('Error retrieving folder contents:', error);
    }
  }

  return foldersData;
}

async function convertImageToBase64(stream) {
  const chunks = [];
  return new Promise((resolve, reject) => {
    stream.on('data', (chunk) => chunks.push(chunk));
    stream.on('end', () => resolve(Buffer.concat(chunks).toString('base64')));
    stream.on('error', (err) => reject(`Error converting image to base64: ${err.message}`));
  });
}

module.exports = { testS3Connection, getFoldersContentsFromS3 };
