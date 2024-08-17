import React from 'react';
import goToPicVideo from '/InfoImg/goToPic.mp4';

const MyPhotoInfo = () => (
  <div className="photo-info-popup">
    <h2>Your Photo Gallery</h2>
    <p>Here, you will be shown your beautiful photos.</p>
    <p>For each photo, you can:</p>
    <ol>
      <li>Delete it</li>
      <li>Show the location where you posted it</li>
    </ol>
    <p>
      Watch the video below to see how to do this:
      <video src={goToPicVideo} className="info-image" autoPlay loop muted>
      Your browser does not support the video tag.
    </video>
    </p>
  </div>
);

export default MyPhotoInfo;
