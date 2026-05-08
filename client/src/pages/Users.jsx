import { useState, useEffect } from 'react'
import { api } from '../utils/api'

export default function Users() {
  const [users, setUsers] = useState([])
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ name: '', email: '', role: 'owner' })
  const [resetUser, setResetUser] = useState(null)
  const [newPassword, setNewPassword] = useState('')
  const [resetting, setResetting] = useState(false)

  const load = () => api.getUsers().then(setUsers).catch(console.error)
  useEffect(() => { load() }, [])

  const handleUpdate = async (e) => {
    e.preventDefault()
    try {
      await api.updateUser(editing, form)
      setEditing(null)
      load()
    } catch (err) { alert(err.message) }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this user?')) return
    await api.deleteUser(id)
    load()
  }

  const handleResetPassword = async (e) => {
    e.preventDefault()
    if (!resetUser || !newPassword) return
    setResetting(true)
    try {
      await api.resetPassword(resetUser.id, newPassword)
      alert(`Password reset for ${resetUser.name}`)
      setResetUser(null)
      setNewPassword('')
    } catch (err) {
      alert(err.message)
    }
    setResetting(false)
  }

  const startEdit = (u) => {
    setForm({ name: u.name, email: u.email, role: u.role })
    setEditing(u.id)
  }

  const isSuperAdmin = (() => {
    try {
      const token = localStorage.getItem('salon_token')
      if (!token) return false
      return JSON.parse(atob(token.split('.')[1])).email === 'admin@tnmthai.com'
    } catch { return false }
  })()

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">👤 User Management</h1>

      {/* Edit Form */}
      {editing && (
        <form onSubmit={handleUpdate} className="bg-white rounded-xl shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Edit User</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input placeholder="Name" value={form.name} onChange={e => setForm({...form, name: e.target.value})}
              className="border rounded-lg px-3 py-2" required />
            <input type="email" placeholder="Email" value={form.email} onChange={e => setForm({...form, email: e.target.value})}
              className="border rounded-lg px-3 py-2" required />
            <select value={form.role} onChange={e => setForm({...form, role: e.target.value})}
              className="border rounded-lg px-3 py-2">
              <option value="owner">Owner</option>
              <option value="staff">Staff</option>
            </select>
          </div>
          <div className="mt-4 flex gap-2">
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">Update</button>
            <button type="button" onClick={() => setEditing(null)} className="border px-4 py-2 rounded-lg hover:bg-gray-50">Cancel</button>
          </div>
        </form>
      )}

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

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-3 text-sm font-medium text-gray-500">Name</th>
              <th className="text-left p-3 text-sm font-medium text-gray-500">Email</th>
              <th className="text-left p-3 text-sm font-medium text-gray-500">Role</th>
              <th className="text-left p-3 text-sm font-medium text-gray-500">Joined</th>
              <th className="text-left p-3 text-sm font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr><td colSpan={5} className="p-8 text-center text-gray-400">No users</td></tr>
            ) : users.map(u => (
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
                <td className="p-3 text-sm text-gray-400">{new Date(u.created_at).toLocaleDateString('en-NZ')}</td>
                <td className="p-3">
                  <div className="flex gap-2">
                    <button onClick={() => startEdit(u)} className="text-sm text-blue-600 hover:underline">Edit</button>
                    {isSuperAdmin && (
                      <button onClick={() => { setResetUser(u); setNewPassword('') }}
                        className="text-sm text-orange-600 hover:underline">🔑 Reset</button>
                    )}
                    <button onClick={() => handleDelete(u.id)} className="text-sm text-red-600 hover:underline">Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
