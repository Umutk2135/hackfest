/**
 * OWNER: P1 (Frontend)
 * React entry. Wires Router + Toaster.
 */
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'sonner';
import App from './App';
import './index.css';

const root = document.getElementById('root');
if (!root) throw new Error('#root not found');

createRoot(root).render(
  <StrictMode>
    <BrowserRouter>
      <App />
      <Toaster richColors closeButton position="top-right" theme="light" />
    </BrowserRouter>
  </StrictMode>,
);
