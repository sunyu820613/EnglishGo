import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import './theme/fonts.css';
import './theme/tokens.css';
import './theme/themes/starlight.css';
import './theme/themes/dino.css';
import './theme/themes/robot.css';
import './theme/themes/moon-garden.css';
import './theme/themes/ballet-castle.css';
import './theme/themes/dessert.css';

const rootEl = document.getElementById('root');
if (!rootEl) throw new Error('#root element not found');

createRoot(rootEl).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
