import dotenv from 'dotenv';
import FormData from 'form-data';
import fs from 'fs';
import jwt from 'jsonwebtoken';
import fetch from 'node-fetch';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config();

const secretToken = process.env.JWT_SECRET_TOKEN;
const secretRefresh = process.env.JWT_SECRET_REFRESH;
const expireToken = process.env.JWT_EXPIRE_TOKEN;
const expireRefresh = process.env.JWT_EXPIRE_REFRESH;

const BASE_URL = 'https://demo.mapsnap.online';
const TOTAL_IMAGES = 100;
const USER_ID = '6';
const LAT_START = parseFloat(process.env.LAT_START);
const LAT_END = parseFloat(process.env.LAT_END);
const LNG_START = parseFloat(process.env.LNG_START);
const LNG_END = parseFloat(process.env.LNG_END);

// Genera un token di test
const generateTestToken = () => {
  const accessToken = jwt.sign({ _id: USER_ID }, secretToken, { expiresIn: expireToken });
  const refreshToken = jwt.sign({ _id: USER_ID }, secretRefresh, { expiresIn: expireRefresh });
  return { accessToken, refreshToken };
};

// Funzione per ottenere i dati dell'immagine come buffer
const fetchImageData = async (index) => {
  const imageUrl = `https://picsum.photos/1024/1024?random=${index}`;

  try {
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch image ${index}`);
    }
    const buffer = Buffer.from(await response.arrayBuffer());
    return buffer;
  } catch (error) {
    console.error(`Failed to fetch image ${index}:`, error);
    throw error;
  }
};

// Funzione per ottenere 5 hashtag casuali
const getHashtags = () => {
  const allHashtags = process.env.TOPICS.split(',');

  // Seleziona 5 hashtag casuali dalla lista di 20
  const shuffled = allHashtags.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, 5);
};

// Calcola le coordinate in base all'indice dell'immagine
const getCoordinates = (index) => {
  const row = Math.floor((index - 1) / 10);
  const col = (index - 1) % 10;

  const latStep = (LAT_END - LAT_START) / 10;
  const lngStep = (LNG_END - LNG_START) / 10;

  const latitude = LAT_START + (row + 0.5) * latStep;
  const longitude = LNG_START + (col + 0.5) * lngStep;

  return { latitude, longitude };
};

const uploadImage = async (imageBuffer, tokens, latitude, longitude) => {
  const form = new FormData();
  form.append('photo', imageBuffer, 'image.jpg');
  form.append('hashtags', JSON.stringify(getHashtags()));
  form.append('latitude', latitude.toFixed(6));
  form.append('longitude', longitude.toFixed(6));

  const headers = {
    ...form.getHeaders(),
    'Cookie': `accessToken=${tokens.accessToken}; refreshToken=${tokens.refreshToken}`,
  };

  try {
    const response = await fetch(`${BASE_URL}/photo`, {
      method: 'POST',
      headers,
      body: form
    });
    const data = await response.json();
    console.log(`Uploaded image with ID ${data.imageId}:`, data.status);

    if (data.status === 'Upload successful') {
      // Scrivi l'ID dell'immagine in un file
      const filePath = path.resolve(__dirname, 'uploaded_image_ids.json');
      const ids = fs.existsSync(filePath) ? JSON.parse(fs.readFileSync(filePath, 'utf8')) : [];
      ids.push(data.imageId);
      fs.writeFileSync(filePath, JSON.stringify(ids, null, 2));
    } else {
      console.error('Upload failed:', data);
    }
  } catch (error) {
    console.error(`Failed to upload image:`, error.message);
  }
};

// Funzione per eseguire il test
const runTest = async () => {
  const tokens = generateTestToken();

  for (let i = 1; i <= TOTAL_IMAGES; i++) {
    console.log(`\n\nFetching image ${i}...`);
    const imageBuffer = await fetchImageData(i);
    const { latitude, longitude } = getCoordinates(i);
    console.log(`Image ${i} fetched and ready to upload at ${latitude}, ${longitude}`);
    await uploadImage(imageBuffer, tokens, latitude, longitude);
  }
  console.log('Test completed.');
};

runTest().catch(console.error);
