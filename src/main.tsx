// Ensure window.fetch setter exists before any application or module logic executes
(function patchFetchSetter() {
  try {
    const origFetch = typeof window !== 'undefined' && window.fetch ? window.fetch.bind(window) : undefined;
    let currentFetch = origFetch;

    const descriptor: PropertyDescriptor = {
      get() {
        return currentFetch;
      },
      set(newFetch: any) {
        currentFetch = typeof newFetch === 'function' ? newFetch : currentFetch;
      },
      configurable: true,
      enumerable: true,
    };

    if (typeof Window !== 'undefined' && Window.prototype) {
      try {
        Object.defineProperty(Window.prototype, 'fetch', descriptor);
      } catch (_e) {
        // ignore
      }
    }

    if (typeof window !== 'undefined') {
      try {
        Object.defineProperty(window, 'fetch', descriptor);
      } catch (_e) {
        // ignore
      }
    }
  } catch (_e) {
    // ignore
  }
})();

import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
