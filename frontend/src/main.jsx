import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';
import { AuthProvider } from './context/AuthContext';
import { FarmerProvider } from './context/FarmerContext';
import axios from 'axios';

axios.defaults.withCredentials = true;

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <FarmerProvider>
          <App />
        </FarmerProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
