// Ensure window.fetch setter exists before any application or module logic executes
try {
  const target = window;
  const desc = Object.getOwnPropertyDescriptor(Window.prototype, 'fetch') || Object.getOwnPropertyDescriptor(target, 'fetch');
  if (desc && desc.get && !desc.set) {
    let currentFetch = target.fetch ? target.fetch.bind(target) : fetch;
    Object.defineProperty(target, 'fetch', {
      get() { return currentFetch; },
      set(newFetch) { currentFetch = newFetch; },
      configurable: true,
      enumerable: true,
    });
  }
} catch (_e) {
  // Ignore
}

import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
