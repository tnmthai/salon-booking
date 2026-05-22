import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="border-t border-gray-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Brand row */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 bg-gradient-to-br from-pink-600 to-purple-600 rounded flex items-center justify-center text-white font-bold text-xs">T</span>
              <span className="text-sm text-gray-400">© 2026 Timia</span>
            </div>

          </div>
        </div>

        {/* Links grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-3 text-sm text-gray-400">
          <div className="space-y-2">
            <p className="font-medium text-gray-500 text-xs uppercase tracking-wider">Product</p>
            <Link to="/features" className="block hover:text-gray-600 transition">Features</Link>
            <Link to="/pricing" className="block hover:text-gray-600 transition">Pricing</Link>
            <Link to="/lookup" className="block hover:text-gray-600 transition">Find booking</Link>
          </div>
          <div className="space-y-2">
            <p className="font-medium text-gray-500 text-xs uppercase tracking-wider">Company</p>
            <Link to="/about" className="block hover:text-gray-600 transition">About</Link>
            <Link to="/contact" className="block hover:text-gray-600 transition">Contact</Link>
          </div>
          <div className="space-y-2">
            <p className="font-medium text-gray-500 text-xs uppercase tracking-wider">Account</p>
            <Link to="/login" className="block hover:text-gray-600 transition">Sign in</Link>
            <Link to="/register" className="block hover:text-gray-600 transition">Sign up</Link>
          </div>
          <div className="space-y-2">
            <p className="font-medium text-gray-500 text-xs uppercase tracking-wider">Legal</p>
            <Link to="/terms" className="block hover:text-gray-600 transition">Terms</Link>
            <Link to="/privacy" className="block hover:text-gray-600 transition">Privacy</Link>
            <Link to="/cookies" className="block hover:text-gray-600 transition">Cookies</Link>
            <Link to="/legal" className="block hover:text-gray-600 transition">Legal</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
