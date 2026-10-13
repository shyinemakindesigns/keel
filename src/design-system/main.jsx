import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '../styles/tokens.css';
import '../styles/base.css';
import '../shared/site-header.css';
import './design-system.css';
import '../../assets/css/glass.css';
import '../../assets/css/motion.css';
import { applyPrefs } from '../shared/prefs.js';
import App from './App.jsx';

applyPrefs();
createRoot(document.getElementById('root')).render(<StrictMode><App /></StrictMode>);
