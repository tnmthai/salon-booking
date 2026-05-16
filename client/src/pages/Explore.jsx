import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../utils/api'

export default function Explore() {
  const [salons, setSalons] = useState([])
  const [ratings, setRatings] = useState({})
  const [services, setServices] = useState({})
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.getExploreSalons().then(async (data) => {
      setSalons(data)
      setLoading(false)
      // Fetch ratings + services in parallel
      const r = {}
      const svc = {}
      await Promise.all(data.map(async (s) => {
        try {
          const rating = await api.getSalonRating(s.slug)
          if (rating.total_reviews > 0) r[s.id] = rating
        } catch {}
        try {
          const pubServices = await api.getPublicServices(s.slug)
          svc[s.id] = pubServices
        } catch {}
      }))
      setRatings(r)
      setServices(svc)
    }).catch(() => setLoading(false))
  }, [])

  // Extract unique categories from all services
  const allCategories = useMemo(() => {
    const cats = new Set()
    Object.values(services).forEach(svcList => {
      svcList.forEach(s => { if (s.category) cats.add(s.category) })
    })
    return Array.from(cats).sort()
  }, [services])

  const [selectedCategory, setSelectedCategory] = useState('')

  const filtered = useMemo(() => {
    let list = salons
    const q = search.toLowerCase().trim()
    if (q) {
      list = list.filter(s =>
        s.name?.toLowerCase().includes(q) ||
        s.address?.toLowerCase().includes(q) ||
        s.description?.toLowerCase().includes(q)
      )
    }
    if (selectedCategory) {
      list = list.filter(s => {
        const svcList = services[s.id] || []
        return svcList.some(sv => sv.category === selectedCategory)
      })
    }
    return list
  }, [salons, search, selectedCategory, services])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="fixed top-0 w-full bg-white/90 backdrop-blur-md border-b border-gray-100 z-50">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-lg font-bold">
            <img src="/logo.png" alt="Timia" className="w-8 h-8 rounded-full" />
            <span className="bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">Timia</span>
          </Link>
          <div className="hidden md:flex items-center gap-1">
            <Link to="/features" className="text-sm text-gray-600 hover:text-gray-900 transition px-3 py-2">Features</Link>
            <Link to="/pricing" className="text-sm text-gray-600 hover:text-gray-900 transition px-3 py-2">Pricing</Link>
            <Link to="/about" className="text-sm text-gray-600 hover:text-gray-900 transition px-3 py-2">About</Link>
            <Link to="/explore" className="text-sm text-pink-600 font-medium transition px-3 py-2">Explore</Link>
            <Link to="/login" className="text-sm text-gray-600 hover:text-gray-900 transition px-3 py-2">Sign in</Link>
            <Link to="/register" className="text-sm bg-gray-900 text-white px-5 py-2 rounded-full hover:bg-gray-800 transition ml-1">Get Started</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-24 md:pt-28 pb-8 px-4 md:px-6 bg-gradient-to-b from-pink-50 to-gray-50">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Explore <span className="bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">salons</span>
          </h1>
          <p className="text-gray-500 text-sm md:text-base mb-6">Find your perfect salon and book instantly.</p>

          {/* Search */}
          <div className="max-w-xl mx-auto">
            <div className="relative">
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by name, location, or description..."
                className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent shadow-sm"
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Category filters */}
      {allCategories.length > 0 && (
        <section className="px-4 md:px-6 py-4 border-b border-gray-100 bg-white sticky top-[57px] z-40">
          <div className="max-w-6xl mx-auto flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            <button
              onClick={() => setSelectedCategory('')}
              className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition ${
                !selectedCategory ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            {allCategories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(selectedCategory === cat ? '' : cat)}
                className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition ${
                  selectedCategory === cat ? 'bg-pink-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Results */}
      <section className="px-4 md:px-6 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Count */}
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-gray-500">
              {loading ? 'Loading...' : `${filtered.length} salon${filtered.length !== 1 ? 's' : ''} found`}
              {search && <span className="text-gray-400"> for "{search}"</span>}
              {selectedCategory && <span className="text-gray-400"> in {selectedCategory}</span>}
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[1,2,3].map(i => (
                <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6 animate-pulse">
                  <div className="h-5 bg-gray-200 rounded w-2/3 mb-3" />
                  <div className="h-4 bg-gray-100 rounded w-full mb-2" />
                  <div className="h-4 bg-gray-100 rounded w-3/4" />
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-5xl mb-4">🔍</div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">No salons found</h3>
              <p className="text-sm text-gray-400">Try a different search term or clear filters.</p>
              {(search || selectedCategory) && (
                <button
                  onClick={() => { setSearch(''); setSelectedCategory('') }}
                  className="mt-4 text-sm text-pink-600 hover:text-pink-700 font-medium"
                >
                  Clear all filters
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map(s => {
                const svcList = services[s.id] || []
                const cats = [...new Set(svcList.map(sv => sv.category).filter(Boolean))]
                return (
                  <Link
                    key={s.id}
                    to={`/${s.slug}/book`}
                    className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-lg hover:border-pink-100 transition group"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-semibold text-gray-900 text-lg group-hover:text-pink-600 transition line-clamp-1">
                        {s.name}
                      </h3>
                      {ratings[s.id] && (
                        <span className="shrink-0 ml-2 text-sm text-yellow-500 flex items-center gap-1">
                          ⭐ {ratings[s.id].average_rating}
                          <span className="text-gray-400">({ratings[s.id].total_reviews})</span>
                        </span>
                      )}
                    </div>

                    {s.address && (
                      <p className="text-sm text-gray-400 flex items-center gap-1 mb-2">
                        📍 {s.address}
                      </p>
                    )}

                    {s.description && (
                      <p className="text-sm text-gray-400 line-clamp-2 mb-3">{s.description}</p>
                    )}

                    {/* Service info */}
                    <div className="flex items-center justify-between">
                      <div className="flex flex-wrap gap-1.5">
                        {cats.slice(0, 3).map(cat => (
                          <span key={cat} className="text-xs bg-gray-50 text-gray-500 px-2.5 py-1 rounded-full">
                            {cat}
                          </span>
                        ))}
                        {cats.length > 3 && (
                          <span className="text-xs text-gray-400">+{cats.length - 3}</span>
                        )}
                        {cats.length === 0 && svcList.length > 0 && (
                          <span className="text-xs text-gray-400">{svcList.length} service{svcList.length > 1 ? 's' : ''}</span>
                        )}
                      </div>
                      <span className="text-pink-600 text-sm font-medium group-hover:translate-x-1 transition-transform">
                        Book →
                      </span>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8 px-4 bg-white">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 bg-gradient-to-br from-pink-600 to-purple-600 rounded flex items-center justify-center text-white font-bold text-xs">T</span>
            <span className="text-sm text-gray-400">© 2026 Timia</span>
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-gray-400">
            <Link to="/features" className="hover:text-gray-600">Features</Link>
            <Link to="/pricing" className="hover:text-gray-600">Pricing</Link>
            <Link to="/about" className="hover:text-gray-600">About</Link>
            <Link to="/terms" className="hover:text-gray-600">Terms</Link>
            <Link to="/privacy" className="hover:text-gray-600">Privacy</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
