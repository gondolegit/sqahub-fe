// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'; // <-- Import React Query
import { ThemeProvider } from 'next-themes';
import App from './App';
import { AuthProvider } from '@/contexts/AuthContext';
import './i18n'; // Side-effect: inisialisasi i18next sebelum App dirender.
import './index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // Data dianggap fresh selama 5 menit
    },
  },
});

const rootElement = document.getElementById('root');

if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
        <BrowserRouter>
          <AuthProvider>
            {/* WRAPPER BARU UNTUK ASYNCHRONOUS STATE MANAGEMENT */}
            <QueryClientProvider client={queryClient}>
              <App />
            </QueryClientProvider>
          </AuthProvider>
        </BrowserRouter>
      </ThemeProvider>
    </React.StrictMode>,
  );
} else {
  console.error("Failed to find the root element in index.html.");
}