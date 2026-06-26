import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App'; // Note: App.tsx is in the root
import { LanguageProvider } from './components/LanguageContext';
import { ErrorBoundary } from './components/ErrorBoundary';

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <ErrorBoundary>
            <BrowserRouter>
                <LanguageProvider>
                    <App />
                </LanguageProvider>
            </BrowserRouter>
        </ErrorBoundary>
    </React.StrictMode>
);
