import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import ControlPanel from './pages/ControlPanel'
import './styles/global.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/control" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/control" element={<ControlPanel />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
)
