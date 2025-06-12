import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import {BrowserRouter} from 'react-router-dom'
import App from './App.jsx'
import React from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
const queryclient = new QueryClient({
  defaultOptions:{
    queries:{
      refetchOnWindowFocus:false,
    }
  }
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
    <QueryClientProvider client={queryclient}>
    <App />
    </QueryClientProvider>
    </BrowserRouter>
  </StrictMode>,
)
