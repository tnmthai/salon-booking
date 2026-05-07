import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import './index.css'
import Dashboard from './pages/Dashboard'
import Services from './pages/Services'
import Staff from './pages/Staff'
import Calendar from './pages/Calendar'
import Booking from './pages/Booking'

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        {/* Navbar */}
        <nav className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
            <Link to="/" className="text-xl font-bold text-pink-600 flex items-center gap-2">
              ✂️ Salon Booking
            </Link>
            <div className="flex gap-4 text-sm">
              <Link to="/" className="text-gray-600 hover:text-pink-600">Dashboard</Link>
              <Link to="/services" className="text-gray-600 hover:text-pink-600">Services</Link>
              <Link to="/staff" className="text-gray-600 hover:text-pink-600">Staff</Link>
              <Link to="/calendar" className="text-gray-600 hover:text-pink-600">Calendar</Link>
              <Link to="/book" className="bg-pink-600 text-white px-3 py-1 rounded-full hover:bg-pink-700">Book Now</Link>
            </div>
          </div>
        </nav>

        {/* Routes */}
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/services" element={<Services />} />
          <Route path="/staff" element={<Staff />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/book" element={<Booking />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />)
