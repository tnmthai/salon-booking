import { useState, useEffect } from 'react'
import { api } from '../utils/api'

export default function AdminShops() {
  const [salons, setSalons] = useState([])
  const [loading, setLoading] = useState(true)

  const load = () => {
    api.getSalons().then(s => { setSalons(s); setLoading(false) }).catch(console.error)
  }

  useEffect(() => { load() }, [])

  if (loading) return <div className="p-8 text-center">Loading...</div>

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">🏪 All Registered Shops</h1>
        <span className="bg-pink-100 text-pink-600 px-3 py-1 rounded-full text-sm font-medium">{salons.length} shops</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {salons.map(s => (
          <div key={s.id} className="bg-white rounded-xl shadow hover:shadow-lg transition p-6">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-semibold text-lg">{s.name}</h3>
                <p className="text-sm text-pink-600">/{s.slug}</p>
              </div>
              <span className="bg-green-100 text-green-600 text-xs px-2 py-1 rounded-full">Active</span>
            </div>

            {s.address && (
              <p className="text-sm text-gray-500 mb-1">📍 {s.address}</p>
            )}
            {s.phone && (
              <p className="text-sm text-gray-500 mb-1">📞 {s.phone}</p>
            )}
            {s.description && (
              <p className="text-sm text-gray-400 mt-2">{s.description}</p>
            )}

            <div className="mt-4 flex gap-2">
              <a href={`/${s.slug}/book`} target="_blank" rel="noreferrer"
                className="flex-1 text-center bg-pink-50 text-pink-600 px-3 py-2 rounded-lg text-sm hover:bg-pink-100">
                Booking Page ↗
              </a>
            </div>
          </div>
        ))}
      </div>

      {salons.length === 0 && (
        <div className="text-center py-20 text-gray-400">
          <div className="text-4xl mb-4">🏪</div>
          <p>No shops registered yet</p>
        </div>
      )}
    </div>
  )
}
