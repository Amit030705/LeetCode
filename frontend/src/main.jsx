import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from "react-router";
import {store} from "./store/store.js"
import { Provider } from 'react-redux';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { Toaster } from 'react-hot-toast';

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
            borderRadius: '14px',
            border: '1px solid #e2e8f0',
            color: '#0f172a',
            fontWeight: 600,
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
