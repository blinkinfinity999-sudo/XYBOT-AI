import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Register Service Worker for Progressive Web App (PWA)
if ('serviceWorker' in navigator && (import.meta as any).env?.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register(`${(import.meta as any).env.BASE_URL}sw.js`)
      .then((registration) => {
        console.log('[PWA] Service Worker registered successfully with scope:', registration.scope);
      })
      .catch((error) => {
        console.error('[PWA] Service Worker registration failed:', error);
      });
  });
} else if ('serviceWorker' in navigator) {
  // Register in dev mode too for easier local verification if needed
  window.addEventListener('load', () => {
    navigator.serviceWorker.register(`${(import.meta as any).env.BASE_URL}sw.js`)
      .then((registration) => {
        console.log('[PWA] Service Worker (Dev Mode) registered:', registration.scope);
      })
      .catch((err) => console.log('[PWA] SW Dev registration skipped or failed:', err));
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
