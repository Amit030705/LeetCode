import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from "react-router";
import {store} from "./store/store.js"
import { Provider } from 'react-redux';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { Toaster } from 'react-hot-toast';

const savedTheme = localStorage.getItem('leecoai-theme') === 'dark' ? 'dark' : 'light';
document.documentElement.dataset.theme = savedTheme;

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
const app = (
  <Provider store={store}>
    <BrowserRouter>
      <App />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3600,
          style: {
            background: 'var(--toast-bg)',
            border: '1px solid var(--toast-border)',
            borderRadius: '8px',
            color: 'var(--toast-color)',
            fontWeight: 600,
            boxShadow: '0 18px 60px rgba(0,0,0,0.28)',
          },
          success: {
            iconTheme: {
              primary: '#34d399',
              secondary: '#020617',
            },
          },
          error: {
            iconTheme: {
              primary: '#f87171',
              secondary: '#020617',
            },
          },
        }}
      />
    </BrowserRouter>
  </Provider>
);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {googleClientId ? <GoogleOAuthProvider clientId={googleClientId}>{app}</GoogleOAuthProvider> : app}
  </StrictMode>,
)
