import { createRoot } from 'react-dom/client';
import { PetsProvider } from "./contexts/PetsContext";
import App from './App.jsx';

const container = document.getElementById('root');

const root = createRoot(container);
root.render(
  <PetsProvider>
    <App />
  </PetsProvider>
);