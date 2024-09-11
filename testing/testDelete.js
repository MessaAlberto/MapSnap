import dotenv from 'dotenv';
import fs from 'fs';
import jwt from 'jsonwebtoken';
import fetch from 'node-fetch';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const secretToken = process.env.JWT_SECRET_TOKEN;
const secretRefresh = process.env.JWT_SECRET_REFRESH;
const expireToken = process.env.JWT_EXPIRE_TOKEN;
const expireRefresh = process.env.JWT_EXPIRE_REFRESH;

const BASE_URL = 'https://demo.mapsnap.online';
const USER_ID = '6';

const generateTestToken = () => {
  if (!secretToken || !secretRefresh) {
    throw new Error('JWT secrets are not defined in the environment variables.');
  }
  const accessToken = jwt.sign({ _id: USER_ID }, secretToken, { expiresIn: expireToken });
  const refreshToken = jwt.sign({ _id: USER_ID }, secretRefresh, { expiresIn: expireRefresh });
  return { accessToken, refreshToken };
};

const deletePhoto = async (imageId, tokens) => {
  try {
    const headers = {
      'Cookie': `accessToken=${tokens.accessToken}; refreshToken=${tokens.refreshToken}`,
    };

    const response = await fetch(`${BASE_URL}/photo/${imageId}`, {
      method: 'DELETE',
      headers,
    });
    const text = await response.text();
    if (!response.ok) {
      console.error(`Failed to delete photo with ID ${imageId}: ${text}`);
      return false; // Indica che l'eliminazione non è riuscita
    } else {
      console.log(`Successfully deleted photo with ID ${imageId}`);
      return true; // Indica che l'eliminazione è riuscita
    }
  } catch (error) {
    console.error(`Error deleting photo with ID ${imageId}:`, error);
    return false; // Indica che l'eliminazione non è riuscita
  }
};

const runDeleteTest = async () => {
  const tokens = generateTestToken();
  const filePath = path.resolve(__dirname, 'uploaded_image_ids.json');

  if (!fs.existsSync(filePath)) {
    console.error('File with image IDs not found.');
    return;
  }

  const ids = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const remainingIds = [];

  for (const id of ids) {
    console.log(`Deleting image with ID ${id}...`);
    const success = await deletePhoto(id, tokens);
    if (!success) {
      remainingIds.push(id);
    }
  }

  fs.writeFileSync(filePath, JSON.stringify(remainingIds, null, 2));
  console.log('Deletion test completed.');
};

runDeleteTest().catch(console.error);
