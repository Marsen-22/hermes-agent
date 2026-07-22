/**
 * AICompany desktop — main entry.
 *
 * Loads the global AICompany API (exposed by the preload script) and renders
 * the App. We use the system dark theme from styles.css.
 */
import { createRoot } from 'react-dom/client';
import { App } from './App';

const rootEl = document.getElementById('root');
if (!rootEl) {
  throw new Error('AICompany: #root not found');
}

createRoot(rootEl).render(<App />);
