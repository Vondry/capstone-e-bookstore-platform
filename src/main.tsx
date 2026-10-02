import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/global.css';

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Root element not found');

// Mock mode (the default) answers the API from MSW in the browser; live mode uses Medusa (plan 14)
async function enableMocking() {
  // Compared inline (not via isMockMode) so a live build drops the mocks from the bundle entirely
  if (import.meta.env.VITE_API_MODE === 'live') return;

  const { worker } = await import('./mocks/browser');
  return worker.start({
    onUnhandledFrame: 'bypass',
  });
}

void enableMocking().then(() => {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
});
