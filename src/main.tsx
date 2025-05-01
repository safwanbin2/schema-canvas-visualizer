
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Use createRoot API with proper React import
const root = createRoot(document.getElementById("root")!);
root.render(<App />);
