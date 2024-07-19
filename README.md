# MapSnap
Explore the World through the Eyes of the Community.

task:
- [x] manage refresh token
- [x] manage logout
- [x] browser ddeve creare una sola socket, per client su Map.
- [x] customizzare openlayers con css e funzioni per hover(popUp)
- [x] recuperare tutte info da ricerca foto (owner da fare, topic fatto)
- [x] per prelevare proprie foto, user invia richiesta con proprio id(localStorage), server fa richiesta tramite mqtt con foto con userId


express ingrandisce l'area di ricerca del client view di 25 volte, per evitare di caricare nuovamente le immagini. 

cache delle foto su express per evitare di richiderle ad s3




DB mqtt
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(64) NOT NULL,
    refresh_token TEXT NOT NULL
);
```

DB Images
```sql
-- Creazione della tabella 'images'
CREATE TABLE images (
    id_ima SERIAL PRIMARY KEY,     -- Identificativo univoco per ogni immagine
    latitude DECIMAL(9, 6) NOT NULL,   -- Latitudine con precisione fino a 6 decimali
    longitude DECIMAL(9, 6) NOT NULL,  -- Longitudine con precisione fino a 6 decimali
    owner_id INT NOT NULL,          -- Identificativo dell'utente proprietario dell
);

-- Creazione della tabella 'topics'
CREATE TABLE topics (
    id_top SERIAL PRIMARY KEY,     -- Identificativo univoco per ogni topic
    name VARCHAR(255) NOT NULL UNIQUE -- Nome del topic (unico per evitare duplicati)
);

-- Creazione della tabella di relazione 'image_topic'
CREATE TABLE image_topic (
    idr_ima INT NOT NULL,          -- Riferimento all'identificativo dell'immagine
    idr_top INT NOT NULL,          -- Riferimento all'identificativo del topic
    PRIMARY KEY (idr_ima, idr_top), -- Chiave primaria composta
    FOREIGN KEY (idr_ima) REFERENCES images (id_ima) ON DELETE CASCADE, -- Chiave esterna con azione di cascata
    FOREIGN KEY (idr_top) REFERENCES topics (id_top) ON DELETE CASCADE  -- Chiave esterna con azione di cascata
);
```



serve/package.json
```json
{
  "name": "server",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
    "dev": "nodemon index.js"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "dependencies": {
    "bcrypt": "^5.1.1",
    "cors": "^2.8.5",
    "dotenv": "^16.4.5",
    "express": "^4.19.2",
    "pg": "^8.12.0",
    "pg-promise": "^11.8.0"
  },
  "devDependencies": {
    "nodemon": "^3.1.4"
  }
}

```


client/package.json
```json
{
  "name": "client",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "proxy": "http://localhost:3000",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "lint": "eslint . --ext js,jsx --report-unused-disable-directives --max-warnings 0",
    "preview": "vite preview"
  },
  "dependencies": {
    "@fortawesome/fontawesome-free": "^6.5.2",
    "@fortawesome/fontawesome-svg-core": "^6.5.2",
    "@fortawesome/free-solid-svg-icons": "^6.5.2",
    "@fortawesome/react-fontawesome": "^0.2.2",
    "bcrypt": "^5.1.1",
    "crypto-js": "^4.2.0",
    "mqtt": "^5.7.2",
    "ol": "^9.2.4",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.24.1"
  },
  "devDependencies": {
    "@types/react": "^18.3.3",
    "@types/react-dom": "^18.3.0",
    "@vitejs/plugin-react-swc": "^3.5.0",
    "eslint": "^8.57.0",
    "eslint-plugin-react": "^7.34.2",
    "eslint-plugin-react-hooks": "^4.6.2",
    "eslint-plugin-react-refresh": "^0.4.7",
    "sass": "^1.77.6",
    "vite": "^5.3.1"
  }
}
```


client/vite.config.js
```javascript
import react from '@vitejs/plugin-react-swc';
import path from "node:path";
import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      components: path.resolve(__dirname, './src/components'),
      pages: path.resolve(__dirname, './src/pages'),
      contexts: path.resolve(__dirname, './src/contexts'),
      style: path.resolve(__dirname, './src/style'),
    },
  },
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, ''),
      }
    }
  }
})
```