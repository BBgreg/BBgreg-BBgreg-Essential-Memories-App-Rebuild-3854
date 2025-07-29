import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './index.css';

console.log('🚀 Essential Memories App Starting...');

// Error boundary for the entire app
window.addEventListener('error', (event) => {
  console.error('🔴 GLOBAL ERROR:', event.error);
  
  // Display a user-friendly error message
  const rootElement = document.getElementById('root');
  if (rootElement) {
    rootElement.innerHTML = `
      <div style="padding: 20px; text-align: center; font-family: sans-serif;">
        <h2 style="color: #d00;">Something went wrong</h2>
        <p>We're sorry, but the app couldn't load properly.</p>
        <p style="color: #666; margin-top: 20px;">
          Please check your console for details or try refreshing the page.
        </p>
        <button style="margin-top: 20px; padding: 10px 20px; background: #5046e5; color: white; border: none; border-radius: 4px; cursor: pointer;"
          onclick="window.location.reload()">
          Refresh Page
        </button>
      </div>
    `;
  }
});

try {
  createRoot(document.getElementById('root')).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
  console.log('✅ React app mounted successfully');
} catch (error) {
  console.error('🔴 FATAL ERROR during app initialization:', error);
}