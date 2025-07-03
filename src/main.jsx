import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'

console.log('Main.tsx loaded - about to render App');
console.log('App component:', App);

createRoot(document.getElementById("root")).render(<App />);
