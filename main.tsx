import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App'; // Note: App.tsx is in the root
import { LanguageProvider } from './components/LanguageContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import './astryx-styles.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

import { SmoothScroll } from './components/SmoothScroll';

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <ErrorBoundary>
            <BrowserRouter>
                <LanguageProvider>
                    <SmoothScroll>
                        <App />
                    </SmoothScroll>
                </LanguageProvider>
            </BrowserRouter>
        </ErrorBoundary>
    </React.StrictMode>
);
