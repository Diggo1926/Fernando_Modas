import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: {
            fontFamily: 'Montserrat, sans-serif',
            fontSize: '13px',
            fontWeight: '400',
            borderRadius: '8px',
          },
          success: { style: { background: '#F0F7F3', color: '#4A8C65', border: '1px solid #4A8C65' } },
          error: { style: { background: '#FBF0EE', color: '#B85A4A', border: '1px solid #B85A4A' } },
        }}
      />
    </BrowserRouter>
  </React.StrictMode>
);
