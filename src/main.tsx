import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

const rootEl = document.getElementById('root');
if (!rootEl) {
  throw new Error('Root element with id "root" not found in index.html');
}

ReactDOM.createRoot(rootEl as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
