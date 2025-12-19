import { createRoot } from 'react-dom/client'
import { PayPalScriptProvider } from '@paypal/react-paypal-js'
import 'leaflet/dist/leaflet.css';
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
    <App />
)
