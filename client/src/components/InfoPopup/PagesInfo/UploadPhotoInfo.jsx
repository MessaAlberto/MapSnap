import React from 'react';

const UploadPhotoInfo = () => (
  <div>
    <h2>Photo Upload Information</h2>
    <p>Here you can upload your photos.</p>
    <p>To get started:</p>
    <ol>
      <li>
        Click here to take or select a photo:
        <br />
        <img src="/InfoImg/dragAndDrop.png" alt="Drag and Drop or Select Photo" className="info-image" />
      </li>
      <li>
        Enter relevant hashtags to describe your photo. For example, if your photo is of a sunset, you might use hashtags like <strong>#sunset</strong> or <strong>#evening</strong>.
      </li>
      <li>
        Complete the CAPTCHA and remember to consent to geolocation. The photo will be uploaded to the map at your current location.
        <br />
        <img src="/InfoImg/allowLocation.png" alt="Allow Location Access" className="info-image" />
      </li>
    </ol>
    <p>
      Example of uploading a photo:
      <br />
      <video src="/InfoImg/uploadPhoto.mp4" alt="Photo Upload Example" className="info-image" autoPlay loop muted />
    </p>
  </div>
);

export default UploadPhotoInfo;
