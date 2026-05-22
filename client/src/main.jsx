import React, { useState, useEffect, useRef } from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom'
import './index.css'
import { api, setToken, clearToken, isLoggedIn, setSalonTimezone } from './utils/api'
import { I18nProvider, useI18n } from './utils/i18n'

// Pages
import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Services from './pages/Services'
import Staff from './pages/Staff'
import StaffBookings from './pages/StaffBookings'
import Calendar from './pages/Calendar'
import Booking from './pages/Booking'
import Lookup from './pages/Lookup'
import Terms from './pages/Terms'
import Privacy from './pages/Privacy'
import Cookies from './pages/Cookies'
import Legal from './pages/Legal'
import Users from './pages/Users'
import AdminShops from './pages/AdminShops'
import StaffSchedule from './pages/StaffSchedule'
import Reports from './pages/Reports'
import StaffDashboard from './pages/StaffDashboard'
import Gallery from './pages/Gallery'
import Reviews from './pages/Reviews'
import Overrides from './pages/Overrides'
import PlanSettings from './pages/PlanSettings'
import Settings from './pages/Settings'
import Loyalty from './pages/Loyalty'
import Features from './pages/Features'
import Pricing from './pages/Pricing'
import About from './pages/About'
import ContactPage from './pages/ContactPage'
import Explore from './pages/Explore'
import CompareTimely from './pages/CompareTimely'

function ProtectedRoute({ children }) {
  if (!isLoggedIn()) return <Navigate to="/login" />;
  return children;
}

function NavDropdown({ label, icon, children }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);
  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(!open)} className="text-gray-600 hover:text-pink-600 flex items-center gap-0.5">
        {icon && <span>{icon}</span>}{label}<svg className={`w-3 h-3 transition ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg border py-1 min-w-[160px] z-50">
          {React.Children.map(children, child => React.cloneElement(child, { onClick: () => setOpen(false) }))}
        </div>
      )}
    </div>
  );
}

function NavDropdownItem({ to, children, onClick }) {
  return <Link to={to} onClick={onClick} className="block px-4 py-2 text-sm text-gray-700 hover:bg-pink-50 hover:text-pink-600">{children}</Link>;
}

function AdminLayout({ salon, user, onLogout }) {
  const isSuperAdmin = user?.email === 'admin@tnmthai.com';
  const isOwner = user?.role === 'owner' || isSuperAdmin;
  const isStaff = user?.role === 'staff';
  const { t, lang, switchLang } = useI18n();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-3">
          {/* Top bar */}
          <div className="flex items-center justify-between">
            <Link to="/admin" className="text-lg md:text-xl font-bold text-pink-600 flex items-center gap-2">
              <img src="/logo.png" alt="Timia" className="w-7 h-7 md:w-8 md:h-8 rounded-full" /> {isSuperAdmin ? 'Timia' : (salon?.name || 'Timia')}
              {isSuperAdmin && <span className="text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full hidden sm:inline">Super Admin</span>}
            </Link>
            <div className="flex items-center gap-2">
              {salon?.slug && !isSuperAdmin && isOwner && (
                <a href={`/${salon.slug}/book`} target="_blank" rel="noreferrer"
                  className="bg-pink-600 text-white px-3 py-1.5 rounded-full hover:bg-pink-700 text-xs">
                  Booking ↗
                </a>
              )}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-gray-600 hover:text-gray-900"
                aria-label="Menu"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {mobileMenuOpen
                    ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
                </svg>
              </button>
            </div>
          </div>

          {/* Desktop nav */}
          <div className="hidden md:flex gap-3 text-sm items-center mt-2 flex-wrap">
            <Link to="/admin" className="text-gray-600 hover:text-pink-600">Dashboard</Link>
            {isSuperAdmin && (
              <>
                <Link to="/admin/users" className="text-orange-600 hover:text-orange-700 font-medium">👥 Users</Link>
                <Link to="/admin/shops" className="text-orange-600 hover:text-orange-700 font-medium">🏪 All Shops</Link>
              </>
            )}
            {!isSuperAdmin && isOwner && (
              <>
                <Link to="/admin/calendar" className="text-gray-600 hover:text-pink-600">📅 Calendar</Link>
                <NavDropdown label="Team">
                  <NavDropdownItem to="/admin/staff">👥 Staff</NavDropdownItem>
                  <NavDropdownItem to="/admin/schedule">📅 Schedule</NavDropdownItem>
                  <NavDropdownItem to="/admin/overrides">🗓 Days Off</NavDropdownItem>
                </NavDropdown>
                <NavDropdown label="More">
                  <NavDropdownItem to="/admin/services">💅 Services</NavDropdownItem>
                  <NavDropdownItem to="/admin/gallery">🖼 Gallery</NavDropdownItem>
                  <NavDropdownItem to="/admin/reviews">⭐ Reviews</NavDropdownItem>
                  <NavDropdownItem to="/admin/reports">📊 Reports</NavDropdownItem>
                  <NavDropdownItem to="/admin/users">👥 Users</NavDropdownItem>
                </NavDropdown>
                <NavDropdown label="Account">
                  <NavDropdownItem to="/admin/loyalty">⭐ Loyalty</NavDropdownItem>
                  <NavDropdownItem to="/admin/plan">📦 Plan</NavDropdownItem>
                  <NavDropdownItem to="/admin/settings">⚙️ Settings</NavDropdownItem>
                </NavDropdown>
              </>
            )}
            {isStaff && (
              <>
                <Link to="/admin/staff-dashboard" className="text-gray-600 hover:text-pink-600">🏠 My Dashboard</Link>
                <Link to="/admin/schedule" className="text-gray-600 hover:text-pink-600">📅 My Schedule</Link>
              </>
            )}
            <div className="flex items-center gap-2 ml-auto border-l pl-3">
              <select value={lang} onChange={e => switchLang(e.target.value)} className="text-xs border rounded px-1 py-0.5">
                <option value="en">EN</option>
                <option value="vi">VI</option>
              </select>
              <span className="text-gray-500 text-xs">{user?.name}</span>
              <button onClick={onLogout} className="text-gray-400 hover:text-red-500 text-sm">Logout</button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 shadow-lg">
            <div className="px-4 py-3 space-y-1">
              <Link to="/admin" onClick={() => setMobileMenuOpen(false)} className="block py-2.5 px-3 text-sm text-gray-700 hover:text-pink-600 hover:bg-pink-50 rounded-lg">📊 Dashboard</Link>
              {!isSuperAdmin && isOwner && (
                <>
                  <Link to="/admin/calendar" onClick={() => setMobileMenuOpen(false)} className="block py-2.5 px-3 text-sm text-gray-700 hover:text-pink-600 hover:bg-pink-50 rounded-lg">📅 Calendar</Link>
                  <Link to="/admin/staff" onClick={() => setMobileMenuOpen(false)} className="block py-2.5 px-3 text-sm text-gray-700 hover:text-pink-600 hover:bg-pink-50 rounded-lg">👥 Staff</Link>
                  <Link to="/admin/schedule" onClick={() => setMobileMenuOpen(false)} className="block py-2.5 px-3 text-sm text-gray-700 hover:text-pink-600 hover:bg-pink-50 rounded-lg">📅 Schedule</Link>
                  <Link to="/admin/services" onClick={() => setMobileMenuOpen(false)} className="block py-2.5 px-3 text-sm text-gray-700 hover:text-pink-600 hover:bg-pink-50 rounded-lg">💅 Services</Link>
                  <Link to="/admin/gallery" onClick={() => setMobileMenuOpen(false)} className="block py-2.5 px-3 text-sm text-gray-700 hover:text-pink-600 hover:bg-pink-50 rounded-lg">🖼 Gallery</Link>
                  <Link to="/admin/reviews" onClick={() => setMobileMenuOpen(false)} className="block py-2.5 px-3 text-sm text-gray-700 hover:text-pink-600 hover:bg-pink-50 rounded-lg">⭐ Reviews</Link>
                  <Link to="/admin/reports" onClick={() => setMobileMenuOpen(false)} className="block py-2.5 px-3 text-sm text-gray-700 hover:text-pink-600 hover:bg-pink-50 rounded-lg">📊 Reports</Link>
                  <Link to="/admin/users" onClick={() => setMobileMenuOpen(false)} className="block py-2.5 px-3 text-sm text-gray-700 hover:text-pink-600 hover:bg-pink-50 rounded-lg">👥 Customers</Link>
                  <Link to="/admin/overrides" onClick={() => setMobileMenuOpen(false)} className="block py-2.5 px-3 text-sm text-gray-700 hover:text-pink-600 hover:bg-pink-50 rounded-lg">🗓 Days Off</Link>
                  <Link to="/admin/loyalty" onClick={() => setMobileMenuOpen(false)} className="block py-2.5 px-3 text-sm text-gray-700 hover:text-pink-600 hover:bg-pink-50 rounded-lg">⭐ Loyalty</Link>
                  <Link to="/admin/plan" onClick={() => setMobileMenuOpen(false)} className="block py-2.5 px-3 text-sm text-gray-700 hover:text-pink-600 hover:bg-pink-50 rounded-lg">📦 Plan</Link>
                  <Link to="/admin/settings" onClick={() => setMobileMenuOpen(false)} className="block py-2.5 px-3 text-sm text-gray-700 hover:text-pink-600 hover:bg-pink-50 rounded-lg">⚙️ Settings</Link>
                </>
              )}
              {isSuperAdmin && (
                <>
                  <Link to="/admin/users" onClick={() => setMobileMenuOpen(false)} className="block py-2.5 px-3 text-sm text-orange-600 hover:bg-orange-50 rounded-lg font-medium">👥 Users</Link>
                  <Link to="/admin/shops" onClick={() => setMobileMenuOpen(false)} className="block py-2.5 px-3 text-sm text-orange-600 hover:bg-orange-50 rounded-lg font-medium">🏪 All Shops</Link>
                </>
              )}
              {isStaff && (
                <>
                  <Link to="/admin/staff-dashboard" onClick={() => setMobileMenuOpen(false)} className="block py-2.5 px-3 text-sm text-gray-700 hover:text-pink-600 hover:bg-pink-50 rounded-lg">🏠 My Dashboard</Link>
                  <Link to="/admin/schedule" onClick={() => setMobileMenuOpen(false)} className="block py-2.5 px-3 text-sm text-gray-700 hover:text-pink-600 hover:bg-pink-50 rounded-lg">📅 My Schedule</Link>
                </>
              )}
              <div className="border-t border-gray-100 mt-2 pt-2 flex items-center justify-between px-3">
                <div className="flex items-center gap-2">
                  <select value={lang} onChange={e => switchLang(e.target.value)} className="text-xs border rounded px-1 py-0.5">
                    <option value="en">EN</option>
                    <option value="vi">VI</option>
                  </select>
                  <span className="text-gray-500 text-xs">{user?.name}</span>
                </div>
                <button onClick={() => { onLogout(); setMobileMenuOpen(false); }} className="text-red-500 text-sm">Logout</button>
              </div>
            </div>
          </div>
        )}
      </nav>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        {isOwner && <Route path="/services" element={<Services />} />}
        {isOwner && <Route path="/staff" element={<Staff />} />}
        {isOwner && <Route path="/staff/:staffId/bookings" element={<StaffBookings />} />}
        {isOwner && <Route path="/schedule" element={<StaffSchedule />} />}
        {isStaff && <Route path="/schedule" element={<StaffSchedule />} />}
        {isOwner && <Route path="/calendar" element={<Calendar />} />}
        {isOwner && <Route path="/users" element={<Users />} />}
        {isOwner && <Route path="/reviews" element={<Reviews />} />}
        {isOwner && <Route path="/gallery" element={<Gallery />} />}
        {isOwner && <Route path="/overrides" element={<Overrides />} />}
        {isOwner && <Route path="/reports" element={<Reports />} />}
        {isOwner && <Route path="/plan" element={<PlanSettings />} />}
          {isOwner && <Route path="/settings" element={<Settings />} />}
          {isOwner && <Route path="/loyalty" element={<Loyalty />} />}
        {isStaff && <Route path="/staff-dashboard" element={<StaffDashboard />} />}
        {isSuperAdmin && <Route path="/shops" element={<AdminShops />} />}
      </Routes>
    </div>
  );
}

function AppInner() {
  const [salon, setSalon] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isLoggedIn()) {
      api.me().then(data => {
        setSalon(data.salon);
        setUser(data.user);
        if (data.salon?.timezone) setSalonTimezone(data.salon.timezone);
        setLoading(false);
      }).catch(() => {
        clearToken();
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, []);

  const handleLogin = (token, salonData, userData) => {
    setToken(token);
    setSalon(salonData);
    setUser(userData);
    if (salonData?.timezone) setSalonTimezone(salonData.timezone);
  };

  const handleLogout = () => {
    clearToken();
    setSalon(null);
    setUser(null);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="text-xl">Loading...</div></div>;

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={isLoggedIn() ? <Navigate to="/admin" /> : <Login onLogin={handleLogin} />} />
        <Route path="/register" element={isLoggedIn() ? <Navigate to="/admin" /> : <Register onLogin={handleLogin} />} />
        <Route path="/lookup" element={<Lookup />} />
        <Route path="/features" element={<Features />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/explore" element={<Explore />} />
        <Route path="/compare/timely" element={<CompareTimely />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/cookies" element={<Cookies />} />
        <Route path="/legal" element={<Legal />} />
        <Route path="/:slug/book" element={<Booking />} />
        <Route path="/admin/*" element={
          <ProtectedRoute>
            <AdminLayout salon={salon} user={user} onLogout={handleLogout} />
          </ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
}

function App() { window.__v=3
  return (
    <I18nProvider>
      <AppInner />
    </I18nProvider>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />)
