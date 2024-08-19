[English](README.md) | Italiano

# MapSnap
<h3 align="center">Explore the World through the Eyes of the Community.</h3>

**MapSnap** è un'applicazione web interattiva che permette agli utenti di esplorare e condividere fotografie geolocalizzate. Grazie a una mappa interattiva, è possibile cercare immagini in base alla posizione o attraverso hashtag, caricare le proprie foto e visualizzare i contenuti condivisi dalla comunità. L'applicazione combina un frontend sviluppato con React, un backend basato su Node.js e Java, e utilizza MQTT per la comunicazione tra Node.js e Java. Le immagini sono salvate su Amazon S3 e i metadati sono memorizzati in un database PostgreSQL.

## Sommario
1. [Caratteristiche Principali](#caratteristiche-principali)
   - [Lato Utente](#lato-utente)
   - [Lato Tecnico](#lato-tecnico)

2. [Utilizzo](#utilizzo)

3. [Tecnologie Utilizzate](#tecnologie-utilizzate)
   - [Frontend](#frontend)
   - [Backend](#backend)

4. [Requisiti](#requisiti)

5. [Struttura del Progetto](#struttura-del-progetto)
   - [Schema complessivo](#schema-complessivo)
   - [Struttura del Codice](#struttura-del-codice)
   - [Schema del Database](#schema-del-database)
   - [Struttura di Amazon S3](#struttura-di-amazon-s3)

6. [Installazione e setup in locale](#installazione-e-setup-in-locale)

7. [Avvio in locale](#avvio-in-locale)

8. [Installazione e setup in EC2](#installazione-e-setup-in-ec2)

9. [Avvio in EC2](#avvio-in-ec2)

10. [Contribuire](#contribuire)

<!-- @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ -->
## Caratteristiche Principali

### Lato Utente
- **Esplorazione per Mappa**: Naviga la mappa interattiva per cercare e visualizzare foto scattate in diverse località, oppure utilizza la barra di ricerca per trovare immagini specifiche basate su un luogo o un hashtag.
- **Ricerca Casuale**: Scopri nuove foto selezionate casualmente all'interno della porzione di mappa visualizzata.
- **Caricamento di Foto**: Gli utenti possono caricare immagini geolocalizzate e aggiungere hashtag per facilitarne la ricerca. Le foto saranno visualizzabili sulla mappa nel punto in cui sono state scattate.
- **Account Utente**: Funzionalità di registrazione e accesso per gestire il proprio account e visualizzare tutte le foto caricate.

### Lato Tecnico
- **Architettura Backend**: Il backend è suddiviso in due componenti principali: 
  - Un server **Node.js** che gestisce le richieste API e WebSocket.
  - Un'applicazione **Java** responsabile della gestione delle operazioni sul database.
- **Comunicazione tra Componenti Backend**: Il server Node.js interagisce con l'applicazione Java tramite il protocollo MQTT per la gestione delle operazioni di lettura e scrittura sul database.
- **Comunicazione Frontend-Backend**: Il frontend comunica con il server Node.js utilizzando:
  - HTTP per le API REST
  - WebSocket per la ricezione di immagini in tempo reale.
- **Gestione delle Immagini**: Le immagini vere e proprie sono salvate su **Amazon S3**, mentre il database **PostgreSQL** i relativi metadati.

<!-- @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ -->
## Utilizzo

### **Navigazione e Funzionalità**
  - **Navigazione nella Mappa**: Esplora il mondo attraverso la mappa interattiva per trovare foto in base alla posizione.
  - **Ricerca**: Usa la barra di ricerca per trovare immagini specifiche inserendo un luogo o un hashtag.
  - **Ricerca Casuale**: Fai clic sul pulsante di ricerca casuale per scoprire immagini nuove e inaspettate.
  - **Caricamento Foto**: Carica le tue immagini, inserisci gli hashtag pertinenti e visualizza le foto caricate direttamente sulla mappa.
  - **Gestione Utente**: Accedi alla tua area personale per visualizzare e gestire le foto che hai caricato.

<!-- @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ -->
## Tecnologie Utilizzate

### Frontend
- **React**: Libreria per la costruzione dell'interfaccia utente.
- **OpenLayers**: Strumento per la visualizzazione e l'interazione con mappe geospaziali.
- **FontAwesome**: Set di icone vettoriali per una migliore esperienza utente.
- **React Router**: Gestione delle rotte e delle pagine dell'applicazione.
- **CSS Modules**: Sistema di gestione degli stili con scoping automatico.

### Backend
- **Node.js & Express**: Backend server per la gestione delle API e della logica applicativa.
- **MQTT mosquitto**: Broker MQTT per la comunicazione tra il server Node.js e l'applicazione Java.
- **Java**: Linguaggio di programmazione utilizzato per l'applicazione che gestisce il database.
- **Maven**: Strumento di gestione delle dipendenze per l'applicazione Java.
- **PostgreSQL**: Database relazionale per la gestione dei dati degli utenti e delle immagini.
- **Amazon S3**: Servizio di storage cloud per le immagini caricate dagli utenti.

<!-- @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ -->
## Requisiti
- **Node.js**: v14 o superiore
- **Java**: JDK 11 o superiore
- **Broker MQTT**: (es. Mosquitto)

<!-- @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ -->
## Struttura del Progetto

### Schema complessivo
<p align="center">
  <img src="images/mainStructure.png" alt="Schema complessivo del progetto">
</p>

### Struttura del Codice
```
MapSnap
|
├── client
│   ├── public\InfoImg
|   ├── src
│   |   ├── components
│   |   ├── context
│   |   ├── pages
│   |   ├── style
│   |   ├── App.js
│   |   └── index.js
|   ├── .env                   # Put your variables
|   ├── .env.production        # Put your variables
|   ├── constants.js
|   ├── index.html
|   ├── socketManager.js
|   └── vite.config.js
|
├── server
│   ├── app
│   |   ├── authentification
│   |   ├── entities
│   |   └── middleware.js
|   ├── .env                   # Put your variables
|   ├── app.js
|   ├── index.js
|   ├── mqttManager.js
|   ├── s3Manager.js
|   └── socketManager.js
|
└── javaApp
    ├── src\main
    |   ├── java\com\example\JavaApp.java
    |   └── resources\config.properties     # Put your variables
    └── pom.xml
```

### Schema del Database
```sql
CREATE TABLE users (
    id_usr SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(64) NOT NULL,
    refresh_token TEXT
);


CREATE TABLE images (
    id_ima SERIAL PRIMARY KEY,
    latitude DECIMAL(9, 6) NOT NULL,
    longitude DECIMAL(9, 6) NOT NULL,
    owner_id INT NOT NULL,
    FOREIGN KEY (owner_id) REFERENCES users (id_usr) ON DELETE CASCADE
);


CREATE TABLE topics (
    id_top SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE
);


CREATE TABLE image_topic (
    idr_ima INT NOT NULL,
    idr_top INT NOT NULL,
    PRIMARY KEY (idr_ima, idr_top),
    FOREIGN KEY (idr_ima) REFERENCES images (id_ima) ON DELETE CASCADE,
    FOREIGN KEY (idr_top) REFERENCES topics (id_top) ON DELETE CASCADE
);
```

### Struttura di Amazon S3
```plaintext
mqtt-images-storage
│
├── 1/ima.jpg
├── 2/ima.jpg
├── 3/ima.jpg
└── ...
```

<!-- @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ -->
## Installazione e Setup in Locale

- ## 1. MQTT broker - Mosquitto
  - **Download**: Scarica e installa il broker MQTT mosquitto dal [sito ufficiale](https://mosquitto.org/download/)
  - **Configurazione**: 
    - Apri terminale in modalità amministratore.
    - Accedi alla cartella di installazione di Mosquitto.
    - Modifica il file `mosquitto.conf` e sovrascrivi il contenuto con il seguente:
      ```plaintext
      listener 1883
      protocol mqtt

      listener 9001
      protocol websockets

      allow_anonymous false
      password_file /etc/mosquitto/passwd
      ```
    - Crea un utente per il server Node.js e uno per l'applicazione Java utilizzando il comando:
      ```bash
      mosquitto_passwd -c /etc/mosquitto/passwd <username>
      ```
      Nota: Usa il flag `-c` solo la prima volta per creare un nuovo file `passwd`. Per aggiungere ulteriori utenti, ometti il flag `-c`.
    
- ## 2. PostgreSQL
  - **Installazione**: Scarica e installa PostgreSQL dal [sito ufficiale](https://www.postgresql.org/download/)
  - **Configurazione**: Crea un nuovo database e un nuovo utente con accesso a tale database.

- ## 3. Amazon S3
  - **Crea un account**: Registrati su [Amazon Web Services](https://aws.amazon.com/)
  - **Configurazione**: 
    - Crea un nuovo bucket su Amazon S3 e configura le autorizzazioni per consentire l'accesso alle immagini.
    - Crea il file `.aws/credentials` nella tua home directory e inserisci le tue credenziali nel formato:
      ```plaintext
      [default]
      aws_access_key_id = <your_access_key>
      aws_secret_access_key = <your_secret>
      ```

- ## 4. Node.js
  - **Installazione**: Scarica e installa Node.js dal [sito ufficiale](https://nodejs.org/it/download/)
  - **Verifica**: Verifica l'installazione eseguendo i seguenti comandi:
    ```bash
    node -v
    npm -v
    ```

- ## 5. Java
  - **Installazione su Visual Studio Code**: Installa l'estensione "Java Extension Pack" direttamente da Visual Studio Code.

- ## 6. Maven
  - **Installazione su Visual Studio Code**: Installa l'estensione "Maven for Java" direttamente da Visual Studio Code.

- ## 7. Ottieni la Chiave del Sito reCAPTCHA
  - **Ottieni la Chiave**: Richiedi una chiave del sito reCAPTCHA [qui](https://www.google.com/recaptcha/admin/create).
  - **Configurazione**: Aggiungi i domini che userai per il reCAPTCHA e copia la tua chiave segreta.

- ## 8. Installazione delle Dipendenze con npm
  - **Client**: Esegui il comando nella directory del client per installare le dipendenze:
    ```bash
    cd client
    npm install
    ```
  - **Server**: Esegui il comando nella directory del server per installare le dipendenze:
    ```bash
    cd ../server
    npm install
    ```

- ## 9. Configurazione dei File .env
  - **Client**: Crea un file `.env` nella cartella `client/` e aggiungi le seguenti variabili:
    ```plaintext
      VITE_API_BASE_URL=http://localhost:3000
      VITE_EXPRESS_SOCKET_URL=http://localhost:3000
      VITE_CAPTCHA_SITE_KEY=<your_captcha_site_key>
    ```
  - **Server**: Crea un file `.env` nella cartella `server/` e inserisci le seguenti variabili:
    ```plaintext
      # JWT
      JWT_SECRET_TOKEN=<your_secret_token>       # Generate a secret key
      JWT_SECRET_REFRESH=<your_secret_refresh>   # Generate a secret key

      JWT_EXPIRE_TOKEN=15m
      JWT_EXPIRE_REFRESH=7d

      # S3
      S3_BUCKET_NAME=<your_bucket_name>         # Your Amazon S3 bucket name

      # GOOGLE RECAPTCHA
      RECAPTCHA_SECRET_KEY=<your_secret_key>    # Your reCAPTCHA secret key

      # MQTT BROKER
      MQTT_BROKER_IP=localhost
      MQTT_BROKER_PORT=9001
      MQTT_BROKER_USER=<your_mqtt_user>         # Previously created
      MQTT_BROKER_PASS=<your_mqtt_password>     # Previously created
    ```
- ## 10. Configurazione di `server/app.js`
  - **Configurazione**: Verifica che nel file [server/app.js](./server/app.js) le righe dalla 26 alla 31 siano commentate. In questo modo non userai i file statici generati da React in produzione.

- ## 11. Configurazione dell'Applicazione Java
  - **Configurazione**: Modifica il file `config.properties` nella cartella `javaApp/src/main/resources/` con le seguenti variabili:
    ```plaintext
    db.url=jdbc:postgresql://localhost:5432/<your_database>
    db.username=<your_db_user>                  # Previously created
    db.password=<your_db_password>              # Previously created
    mqtt.broker=tcp://localhost:1883
    mqtt.username=<your_mqtt_user>              # Previously created
    mqtt.password=<your_mqtt_password>          # Previously created
    ```

<!-- @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ -->
## Avvio in Locale
  1. **Avvia il broker MQTT**:
     Apri il terminale come amministratore e avvia il broker MQTT Mosquitto con:
      ```bash
      mosquitto -c mosquitto.conf
      ```
  2. **Avvia la JavaApp**:
     Assicurati che la JavaApp sia in esecuzione e che il broker MQTT sia configurato correttamente, quindi avvia l'applicazione Java:
      ```bash
      cd javaApp
      mvn clean install
      java -jar target/JavaApp-0.0.1-SNAPSHOT.jar
      ```
  3. **Avvia Server Node.js**:
     Assicurati che il server Node.js sia configurato e in esecuzione, quindi avvia il server Express:
      ```bash
      cd server
      npm run start
      ```
  4. **Avvia React Client**:
     In una nuova finestra del terminale, avvia il client React con:
      ```bash
      cd ../client
      npm run dev
      ```
  5. **Apri l'applicazione**:
     Apri il browser e vai all'indirizzo http://localhost:5173

<!-- @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ -->
## Installazione e Setup in EC2
Segui i passaggi elencati nel seguente link per installare e configurare l'applicazione su un'istanza EC2 di AWS: [Deploying Full Stack Apps to AWS EC2](https://www.sammeechward.com/deploying-full-stack-js-to-aws-ec2)

### 1. **Build del Frontend**:
  Esegui il build del frontend nella directory `client/`:
   ```bash
   cd client 
   npm run build
   ```

### 2. **Configurazione di server/app.js:**
Verifica che nel file [server/app.js](./server/app.js) le righe dalla 26 alla 31 siano decommentate per usare i file statici del frontend.

### 3. **Trasferimento dei File su EC2**:
Utilizza `rsync` per trasferire i file sul server EC2:
  - **Client**:
    ```bash
    rsync -avz -e "ssh -i mapsnap-webapp.pem" /mnt/<path>/<to>/<your>/<project>/MapSnap/client/dist ubuntu@ec2-35-159-31-228.eu-central-1.compute.amazonaws.com:/home/ubuntu/MapSnap/client
    ```
  - **Server**:
    ```bash
    rsync -avz --exclude 'node_modules' --exclude '.gitignore' -e "ssh -i mapsnap-webapp.pem" /mnt/<path>/<to>/<your>/<project>/MapSnap/server ubuntu@ec2-35-159-31-228.eu-central-1.compute.amazonaws.com:/home/ubuntu/MapSnap/
    ```
  - **JavaApp**:
    ```bash
    rsync -avz --exclude 'target' --exclude '.gitignore' -e "ssh -i mapsnap-webapp.pem" /mnt/<path>/<to>/<your>/<project>/MapSnap/javaApp
    ```

  Se riscontri problemi con i permessi della chiave SSH, esegui:
  ```bash
  sudo chmod 755 /home/ubuntu
  sudo chown ubuntu:ubuntu /home/ubuntu
  sudo chmod 700 /home/ubuntu/.ssh
  sudo chmod 600 /home/ubuntu/.ssh/authorized_keys
  sudo chown ubuntu:ubuntu /home/ubuntu/.ssh
  sudo chown ubuntu:ubuntu /home/ubuntu/.ssh/authorized_keys
  sudo systemctl restart ssh
  ```
### 4. **Crea il file `MapSnap.service`**:
  Sulla tua istanza EC2, crea un file di servizio per il server Node.js:
  ```bash
  sudo nano /etc/systemd/system/MapSnap.service
  ```
  Incolla il seguente contenuto nel file:
  ```bash
  [Unit]
  Description=Node.js App
  After=network.target multi-user.target

  [Service]
  User=ubuntu
  WorkingDirectory=/home/ubuntu/MapSnap/server
  ExecStart=/usr/bin/npm start
  Restart=always
  Environment=NODE_ENV=production
  EnvironmentFile=/etc/MapSnap.env
  StandardOutput=syslog
  StandardError=syslog
  SyslogIdentifier=MapSnap_app

  [Install]
  WantedBy=multi-user.target
  ```
### 5. **Installazione di Mosquitto su EC2**:
  Esegui i seguenti comandi per installare Mosquitto:
  ```bash
  sudo apt update
  sudo apt upgrade
  sudo apt install mosquitto
  ```

### 6. **Installazione di Java e Maven su EC2**:
  Esegui i seguenti comandi per installare Java 21 e Maven:
  ```bash
  sudo apt update
  sudo apt upgrade
  sudo apt install openjdk-21-jdk
  sudo apt install maven
  ```
<!-- @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ -->
## Avvio in EC2

### 1. **Avvia il Broker MQTT**:
  Esegui:
  ```bash
  sudo systemctl start mosquitto
  ```
### 2. **Avvia la JavaApp**:
  Esegui:
  ```bash
  nohup java -jar ~/MapSnap/JavaApp/target/JavaApp-1.0-SNAPSHOT-jar-with-dependencies.jar > javaapp.log 2>&1 &
  ```
### 3. **Avvia il Server Node.js**:
  Esegui:
  ```bash
  sudo systemctl start MapSnap.service
  ```
### 4. **Avvia Caddy**:
  Esegui:
  ```bash
  sudo systemctl start caddy
  ```
### 5. **Apri l'Applicazione**:
  Vai all'indirizzo IP pubblico della tua istanza EC2.

<!-- @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ -->

## Contribuire

Contributi sono benvenuti! Segui questi passi per contribuire:

- Fai un fork del progetto.
- Crea un nuovo branch (git checkout -b feature/AmazingFeature).
- Fai un commit delle tue modifiche (git commit -m 'Add some AmazingFeature').
- Pusha il branch (git push origin feature/AmazingFeature).
- Apri una pull request.
