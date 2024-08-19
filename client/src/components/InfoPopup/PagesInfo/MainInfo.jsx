import React from 'react';

const MainInfo = () => (
  <div className="main-info">
    <h2>Welcome to MapSnap!</h2>
    <p>Explore the map and discover photos in two simple ways:</p>
    <ol>
      <li>
        <strong>Search by Place:</strong> Move the map or type a location in the search box, then click the magnifying glass.<br />
        <img src="/InfoImg/placeInput.png" alt="Search Box" className="info-image" />
      </li>
      <li>
        <strong>Search by Hashtag:</strong> Enter a hashtag in the input box, press enter or click the magnifying glass.<br />
        <img src="/InfoImg/topicInput.png" alt="Hashtag Input" className="info-image" />
      </li>
    </ol>
    <p>For a quick start, try searching with <strong>#mountain</strong> in <strong>Trento</strong>.</p>

    <p>
      <strong>Random Research:</strong> Click the "Random Research" button to see random images from the currently viewed map area.<br />
      <img src="/InfoImg/randomResearch.png" alt="Random Research Button" className="info-image" />
    </p>

    <p>
      While searching, if you see a loading indicator in the top right corner, please wait.<br />
      <video src="/InfoImg/loading.mp4" alt="Loading Indicator" className="info-image" autoPlay loop muted/><br />
      If no photos are found, a message will inform you.<br />
      <img src="/InfoImg/noPhoto.png" alt="No Photos Popup" className="info-image" />
    </p>

    <p>
      <strong>Navigation:</strong> Use these buttons for easy navigation:
      <ul>
        <li>Go back to the home page with the 'MapSnap' button:<br />
          <img src="/InfoImg/homeButton.png" alt="MapSnap Button" className="info-image" />
        </li>
        <li>If you're logged in, share your photos with 'Add Your Photo':<br />
          <img src="/InfoImg/addPhoto.png" alt="Add Photo Button" className="info-image" />
        </li>
        <li>View your photos in 'See My Pics':<br />
          <img src="/InfoImg/myPics.png" alt="See My Pics Menu" className="info-image" />
        </li>
      </ul>
    </p>

    <p>
      <strong>Account Management:</strong> 
      <ul>
        <li>Login or Sign Up with the respective buttons:<br />
          <img src="/InfoImg/logInUp.png" alt="Login and Sign Up Buttons" className="info-image" />
        </li>
        <li>Logout by clicking 'Logout':<br />
          <img src="/InfoImg/logOut.png" alt="Logout Button" className="info-image" />
        </li>
      </ul>
    </p>
  </div>
);

export default MainInfo;
