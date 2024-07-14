import React from 'react';
import { Link } from 'react-router-dom';
import 'style/pages/NotFound.scss';
import { UtilsContext } from '../contexts/utilsProvider';

const NotFound = () => {
  const { appRoutes } = React.useContext(UtilsContext);

  return (
    <div className="not-found">
      <h1>404 - Page Not Found</h1>
      <p>Sorry, the page you are looking for does not exist.</p>
      <Link to={appRoutes.HOME}>Go back to the homepage</Link>
    </div>
  );
};

export default NotFound;
