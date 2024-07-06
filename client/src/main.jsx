import { AuthProvider } from 'contexts/auth'
import React from 'react'
import ReactDOM from 'react-dom/client'
import 'style/_variables.scss'
import App from './App'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>,
)
