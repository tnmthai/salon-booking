import { useState, useEffect } from 'react'
import { api } from '../utils/api'

export default function AdminShops() {
  const [salons, setSalons] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingSalon, setEditingSalon] = useState(null)
  const [showCreateForm, setShowCreateForm] = useState(null)
  const [form, setForm] = useState({ name: '', email: '', password: '' })

  const load = () => {
    Promise.all([
      fetch('/api/salons').then(r => r.json()),
      api.getAllUsers()
    ]).then(([s, u]) => {
      setSalons(s)
      setUsers(u)
      setLoading(false)
    }).catch(console.error)
  }

  useEffect(() => { load() }, [])

  const handleAssignOwner = async (salonId, userId) => {
    const token = localStorage.getItem('salon_token')
    await fetch(`/api/salons/${salonId}/owner`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ user_id: userId })
    })
    setEditingSalon(null)
    load()
  }

  const handleCreateOwner = async (e) => {
    e.preventDefault()
    const token = localStorage.getItem('salon_token')
    try {
      const res = await fetch(`/api/salons/${showCreateForm}/owner`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(form)
      })
      if (!res.ok) {
        const err = await res.json()
        alert(err.error)
        return
      }
      setShowCreateForm(null)
      setForm({ name: '', email: '', password: '' })
      load()
    } catch (err) {
      alert(err.message)
    }
  }

  if (loading) return <div className="p-8 text-center">Loading...</div>

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">🏪 All Registered Shops</h1>
        <span className="bg-pink-100 text-pink-600 px-3 py-1 rounded-full text-sm font-medium">{salons.length} shops</span>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {salons.map(s => (
          <div key={s.id} className="bg-white rounded-xl shadow hover:shadow-lg transition p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-semibold text-lg">{s.name}</h3>
                  <span className="text-sm text-pink-600 bg-pink-50 px-2 py-0.5 rounded">/{s.slug}</span>
                </div>

                {/* Owner info */}
                <div className="flex items-center gap-2 mb-3">
                  {s.owner_name ? (
                    <div className="flex items-center gap-2 bg-green-50 text-green-700 px-3 py-1.5 rounded-lg text-sm">
                      <span className="font-medium">👤 {s.owner_name}</span>
                      <span className="text-green-500">({s.owner_email})</span>
                    </div>
                  ) : (
                    <span className="bg-red-50 text-red-600 px-3 py-1.5 rounded-lg text-sm">⚠️ No owner assigned</span>
                  )}
                  <button onClick={() => setEditingSalon(editingSalon === s.id ? null : s.id)}
                    className="text-sm text-blue-600 hover:text-blue-700 underline">
                    {editingSalon === s.id ? 'Cancel' : 'Change'}
                  </button>
                </div>

                {/* Assign existing user as owner */}
                {editingSalon === s.id && (
                  <div className="bg-gray-50 rounded-lg p-4 mb-3">
                    <p className="text-sm font-medium text-gray-700 mb-2">Assign existing user as owner:</p>
                    <div className="flex gap-2 flex-wrap mb-3">
                      {users.filter(u => u.role !== 'owner' || u.salon_slug !== s.slug).map(u => (
                        <button key={u.id} onClick={() => handleAssignOwner(s.id, u.id)}
                          className="bg-white border rounded-lg px-3 py-2 text-sm hover:border-pink-300 hover:bg-pink-50 transition">
                          <span className="font-medium">{u.name}</span>
                          <span className="text-gray-400 ml-1">({u.email})</span>
                          <span className="text-xs text-gray-400 ml-1">— {u.salon_name}</span>
                        </button>
                      ))}
                      {users.filter(u => u.role !== 'owner' || u.salon_slug !== s.slug).length === 0 && (
                        <span className="text-sm text-gray-400">No other users available</span>
                      )}
                    </div>
                    <button onClick={() => { setShowCreateForm(s.id); setForm({ name: '', email: '', password: '' }) }}
                      className="text-sm text-pink-600 hover:text-pink-700 font-medium">
                      + Create new owner account
                    </button>
                  </div>
                )}

                {/* Create new owner form */}
                {showCreateForm === s.id && (
                  <form onSubmit={handleCreateOwner} className="bg-pink-50 rounded-lg p-4 mb-3">
                    <p className="text-sm font-medium text-pink-700 mb-3">Create new owner for {s.name}:</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <input placeholder="Full name" value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                        className="border rounded-lg px-3 py-2 text-sm" required />
                      <input type="email" placeholder="Email" value={form.email} onChange={e => setForm({...form, email: e.target.value})}
                        className="border rounded-lg px-3 py-2 text-sm" required />
                      <input type="password" placeholder="Password" value={form.password} onChange={e => setForm({...form, password: e.target.value})}
                        className="border rounded-lg px-3 py-2 text-sm" required minLength={6} />
                    </div>
                    <div className="flex gap-2 mt-3">
                      <button type="submit" className="bg-pink-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-pink-700">
                        Create Owner
                      </button>
                      <button type="button" onClick={() => setShowCreateForm(null)}
                        className="border px-4 py-2 rounded-lg text-sm hover:bg-white">
                        Cancel
                      </button>
                    </div>
                  </form>
                )}

                {s.address && <p className="text-sm text-gray-500">📍 {s.address}</p>}
                {s.phone && <p className="text-sm text-gray-500">📞 {s.phone}</p>}
                {s.description && <p className="text-sm text-gray-400 mt-1">{s.description}</p>}
              </div>

              <a href={`/${s.slug}/book`} target="_blank" rel="noreferrer"
                className="bg-pink-50 text-pink-600 px-4 py-2 rounded-lg text-sm hover:bg-pink-100 ml-4 whitespace-nowrap">
                Booking ↗
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
