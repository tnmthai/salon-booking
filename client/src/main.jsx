import React, { useState, useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, Link, Navigate, useParams } from 'react-router-dom'
import './index.css'
import { api, setToken, clearToken, isLoggedIn } from './utils/api'

// Pages
import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Services from './pages/Services'
import Staff from './pages/Staff'
import Calendar from './pages/Calendar'
import Booking from './pages/Booking'

function ProtectedRoute({ children }) {
  if (!isLoggedIn()) return <Navigate to="/login" />;
  return children;
}

function AdminLayout({ salon, onLogout }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/admin" className="text-xl font-bold text-pink-600 flex items-center gap-2">
            ✂️ {salon?.name || 'Salon'}
          </Link>
          <div className="flex gap-4 text-sm items-center">
            <Link to="/admin" className="text-gray-600 hover:text-pink-600">Dashboard</Link>
            <Link to="/admin/services" className="text-gray-600 hover:text-pink-600">Services</Link>
            <Link to="/admin/staff" className="text-gray-600 hover:text-pink-600">Staff</Link>
            <Link to="/admin/calendar" className="text-gray-600 hover:text-pink-600">Calendar</Link>
            {salon?.slug && (
              <a href={`/${salon.slug}/book`} target="_blank" className="bg-pink-600 text-white px-3 py-1 rounded-full hover:bg-pink-700">
                Booking Page ↗
              </a>
            )}
            <button onClick={onLogout} className="text-gray-400 hover:text-red-500 text-sm">Logout</button>
          </div>
        </div>
      </nav>
      <Routes>
        <Route path="/admin" element={<Dashboard />} />
        <Route path="/admin/services" element={<Services />} />
        <Route path="/admin/staff" element={<Staff />} />
        <Route path="/admin/calendar" element={<Calendar />} />
      </Routes>
    </div>
  );
}

function App() {
  const [salon, setSalon] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isLoggedIn()) {
      api.me().then(data => {
        setSalon(data.salon);
        setLoading(false);
      }).catch(() => {
        clearToken();
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, []);

  const handleLogin = (token, salonData) => {
    setToken(token);
    setSalon(salonData);
  };

  const handleLogout = () => {
    clearToken();
    setSalon(null);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="text-xl">Loading...</div></div>;

  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={isLoggedIn() ? <Navigate to="/admin" /> : <Login onLogin={handleLogin} />} />
        <Route path="/register" element={isLoggedIn() ? <Navigate to="/admin" /> : <Register onLogin={handleLogin} />} />

        {/* Public booking */}
        <Route path="/:slug/book" element={<Booking />} />

        {/* Admin (protected) */}
        <Route path="/admin/*" element={
          <ProtectedRoute>
            <AdminLayout salon={salon} onLogout={handleLogout} />
          </ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />)
