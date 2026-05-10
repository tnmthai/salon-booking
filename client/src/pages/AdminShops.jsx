import { useState, useEffect } from 'react'
import { api } from '../utils/api'
import { sanitizeName, sanitizePhone } from '../utils/validation'

export default function AdminShops() {
  const [salons, setSalons] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingSalon, setEditingSalon] = useState(null)
  const [showCreateForm, setShowCreateForm] = useState(null)
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [resetUser, setResetUser] = useState(null)
  const [newPassword, setNewPassword] = useState('')
  const [resetting, setResetting] = useState(false)
  const [deleting, setDeleting] = useState(null)
  const [editSalon, setEditSalon] = useState(null)
  const [salonForm, setSalonForm] = useState({ name: '', slug: '', phone: '', email: '', address: '', description: '' })

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

  const handleResetPassword = async (e) => {
    e.preventDefault()
    if (!resetUser || !newPassword) return
    setResetting(true)
    try {
      await api.resetPassword(resetUser.id, newPassword)
      alert(`Password reset for ${resetUser.name} (${resetUser.email})`)
      setResetUser(null)
      setNewPassword('')
    } catch (err) {
      alert(err.message)
    }
    setResetting(false)
  }

  const handleDeleteSalon = async (salon) => {
    if (!confirm(`Delete "${salon.name}"? This will remove ALL data (services, staff, appointments, customers) for this shop. This cannot be undone.`)) return
    setDeleting(salon.id)
    try {
      const token = localStorage.getItem('salon_token')
      const res = await fetch(`/api/salons/${salon.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (!res.ok) {
        const err = await res.json()
        alert(err.error)
        return
      }
      load()
    } catch (err) {
      alert(err.message)
    }
    setDeleting(null)
  }

  const startEditSalon = (s) => {
    setSalonForm({ name: s.name, slug: s.slug, phone: s.phone || '', email: s.email || '', address: s.address || '', description: s.description || '' })
    setEditSalon(s.id)
  }

  const handleSaveSalon = async (e) => {
    e.preventDefault()
    const token = localStorage.getItem('salon_token')
    try {
      const res = await fetch(`/api/salons/${editSalon}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(salonForm)
      })
      if (!res.ok) {
        const err = await res.json()
        alert(err.error)
        return
      }
      setEditSalon(null)
      load()
    } catch (err) {
      alert(err.message)
    }
  }

  if (loading) return <div className="p-8 text-center">Loading...</div>

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Shops Section */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">🏪 All Registered Shops</h1>
        <span className="bg-pink-100 text-pink-600 px-3 py-1 rounded-full text-sm font-medium">{salons.length} shops</span>
      </div>

      <div className="grid grid-cols-1 gap-4 mb-10">
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
                        </button>
                      ))}
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
              </div>

              <div className="flex gap-2 ml-4 whitespace-nowrap">
                <button onClick={() => startEditSalon(s)}
                  className="bg-blue-50 text-blue-600 px-3 py-2 rounded-lg text-sm hover:bg-blue-100">
                  ✏️ Edit
                </button>
                <a href={`/${s.slug}/book`} target="_blank" rel="noreferrer"
                  className="bg-pink-50 text-pink-600 px-4 py-2 rounded-lg text-sm hover:bg-pink-100">
                  Booking ↗
                </a>
                <button onClick={() => handleDeleteSalon(s)} disabled={deleting === s.id}
                  className="bg-red-50 text-red-600 px-3 py-2 rounded-lg text-sm hover:bg-red-100 disabled:opacity-50">
                  {deleting === s.id ? '...' : '🗑️'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Salon Modal */}
      {editSalon && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setEditSalon(null)}>
          <form onSubmit={handleSaveSalon} className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-lg" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-4">✏️ Edit Shop</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Shop Name</label>
                <input value={salonForm.name} onChange={e => setSalonForm({...salonForm, name: e.target.value})}
                  className="border rounded-lg px-3 py-2 w-full" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Slug (URL)</label>
                <input value={salonForm.slug} onChange={e => setSalonForm({...salonForm, slug: e.target.value})}
                  className="border rounded-lg px-3 py-2 w-full" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input value={salonForm.phone} onChange={e => setSalonForm({...salonForm, phone: e.target.value})}
                  className="border rounded-lg px-3 py-2 w-full" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input type="email" value={salonForm.email} onChange={e => setSalonForm({...salonForm, email: e.target.value})}
                  className="border rounded-lg px-3 py-2 w-full" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <input value={salonForm.address} onChange={e => setSalonForm({...salonForm, address: e.target.value})}
                  className="border rounded-lg px-3 py-2 w-full" />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea value={salonForm.description} onChange={e => setSalonForm({...salonForm, description: e.target.value})}
                  className="border rounded-lg px-3 py-2 w-full" rows={2} />
              </div>
            </div>
            <div className="flex gap-2 justify-end mt-4">
              <button type="button" onClick={() => setEditSalon(null)}
                className="border px-4 py-2 rounded-lg text-sm hover:bg-gray-50">Cancel</button>
              <button type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">Save</button>
            </div>
          </form>
        </div>
      )}

      {/* Users Section */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">👥 All Users</h2>
        <span className="bg-purple-100 text-purple-600 px-3 py-1 rounded-full text-sm font-medium">{users.length} users</span>
      </div>

      {/* Reset Password Modal */}
      {resetUser && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => { setResetUser(null); setNewPassword('') }}>
          <form onSubmit={handleResetPassword} className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-1">🔑 Reset Password</h3>
            <p className="text-sm text-gray-500 mb-4">
              Reset password for <span className="font-medium text-gray-700">{resetUser.name}</span> ({resetUser.email})
            </p>
            <input type="password" placeholder="New password (min 6 chars)" value={newPassword}
              onChange={e => setNewPassword(e.target.value)} className="border rounded-lg px-3 py-2 w-full mb-4" required minLength={6} autoFocus />
            <div className="flex gap-2 justify-end">
              <button type="button" onClick={() => { setResetUser(null); setNewPassword('') }}
                className="border px-4 py-2 rounded-lg text-sm hover:bg-gray-50">Cancel</button>
              <button type="submit" disabled={resetting}
                className="bg-orange-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-orange-600 disabled:opacity-50">
                {resetting ? 'Resetting...' : 'Reset Password'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-3 text-sm font-medium text-gray-500">Name</th>
              <th className="text-left p-3 text-sm font-medium text-gray-500">Email</th>
              <th className="text-left p-3 text-sm font-medium text-gray-500">Role</th>
              <th className="text-left p-3 text-sm font-medium text-gray-500">Shop</th>
              <th className="text-left p-3 text-sm font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} className="border-t hover:bg-gray-50">
                <td className="p-3 text-sm font-medium">{u.name}</td>
                <td className="p-3 text-sm text-gray-500">{u.email}</td>
                <td className="p-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    u.role === 'super_admin' ? 'bg-orange-100 text-orange-700' :
                    u.role === 'owner' ? 'bg-green-100 text-green-700' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {u.role === 'super_admin' ? '⭐ Super Admin' : u.role === 'owner' ? '👑 Owner' : '👤 Staff'}
                  </span>
                </td>
                <td className="p-3 text-sm text-gray-500">{u.salon_name || '—'}</td>
                <td className="p-3">
                  <button onClick={() => { setResetUser(u); setNewPassword('') }}
                    className="text-sm text-orange-600 hover:text-orange-700 font-medium">
                    🔑 Reset Password
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
