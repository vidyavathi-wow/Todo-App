import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import { AppProvider } from './context/AppContext.jsx';
import FunctionalErrorBoundary from './components/common/ErrorBoundary.jsx';
import './index.css';
import 'react-big-calendar/lib/css/react-big-calendar.css';
//import './pages/calendar.css';

const root = createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <FunctionalErrorBoundary>
      <BrowserRouter>
        <AppProvider>
          <App />
        </AppProvider>
      </BrowserRouter>
    </FunctionalErrorBoundary>
  </React.StrictMode>
);
