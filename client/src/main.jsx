import { AuthProvider } from 'contexts/auth';
import { UtilsProvider } from 'contexts/utilsProvider';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from "react-router-dom";
import 'style/_variables.scss';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <UtilsProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </UtilsProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
