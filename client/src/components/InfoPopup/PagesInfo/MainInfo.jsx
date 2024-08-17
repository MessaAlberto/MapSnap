import React from 'react';

const MainInfo = () => (
  <div className="main-info">
    <h2>Welcome to the Home Page</h2>
    <p>Here, you can explore the map to search for photos that interest you. There are two easy ways to search:</p>
    <ol>
      <li>
        <strong>Place:</strong> Move the map with the pointer, or type the place in the search box and press the magnifying glass to search.<br />
        <img src="/InfoImg/placeInput.png" alt="Search Box" className="info-image" />
      </li>
      <li>
        <strong>Hashtag:</strong> Enter a hashtag in the input box and press enter or click the magnifying glass to search.<br />
        <img src="/InfoImg/topicInput.png" alt="Hashtag Input" className="info-image" />
      </li>
    </ol>
    <p>
      FOR EXAMPLE:<br />
      Try with the hashtag <strong>#mountain</strong> to see some photos and search them on the city of <strong>Trento</strong>.
    </p>
    <p>
      Watch the map. If a loading indicator appears in the top right corner, please wait.<br />
      <video src="/InfoImg/loading.mp4" alt="Loading Indicator" className="info-image" autoPlay loop muted/><br />
      If not, a message will appear telling you that no photos are found in that area.<br />
      <img src="/InfoImg/noPhoto.png" alt="No Photos Popup" className="info-image" />
    </p>
    <p>
      To come back to the home page, click the 'MapSnap' button:<br />
      <img src="/InfoImg/homeButton.png" alt="MapSnap Button" className="info-image" />
    </p>
    <p>
      If you're logged in, you can share your photos by clicking the 'Add Your Photo' button<br />
      <img src="/InfoImg/addPhoto.png" alt="Add Photo Button" className="info-image" />
    </p>
    <p>
      And you can view your photos in the 'See My Pics' menu:<br />
      <img src="/InfoImg/myPics.png" alt="See My Pics Menu" className="info-image" />
    </p>
    <p>
      To login or sign up, click the 'Login' or 'Sign Up' button:<br />
      <img src="/InfoImg/logInUp.png" alt="Login and Sign Up Buttons" className="info-image" />
    </p>
    <p>
      To logout, click the 'Logout' button:<br />
      <img src="/InfoImg/logOut.png" alt="Logout Button" className="info-image" />
    </p>
  </div>
);

export default MainInfo;
