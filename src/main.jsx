import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import App from './App'
import './index.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#1c1a16',
              color: '#e8e8e0',
              border: '1px solid rgba(212,168,83,0.2)',
              borderRadius: '10px',
              fontFamily: '"DM Sans", sans-serif',
              fontSize: '14px',
            },
            success: { iconTheme: { primary: '#D4A853', secondary: '#050403' } },
            error:   { iconTheme: { primary: '#ef4444', secondary: '#050403' } },
          }}
        />
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>,
)
