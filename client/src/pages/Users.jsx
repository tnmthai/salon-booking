import { useState, useEffect } from 'react'
import { api } from '../utils/api'
import { translations } from '../utils/translations'

export default function Users() {
  const [users, setUsers] = useState([])
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ name: '', email: '', role: 'owner' })

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

  const startEdit = (u) => {
    setForm({ name: u.name, email: u.email, role: u.role })
    setEditing(u.id)
  }

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
              <option value="admin">Admin</option>
              <option value="staff">Staff</option>
            </select>
          </div>
          <div className="mt-4 flex gap-2">
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">Update</button>
            <button type="button" onClick={() => setEditing(null)} className="border px-4 py-2 rounded-lg hover:bg-gray-50">Cancel</button>
          </div>
        </form>
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
                    u.role === 'owner' ? 'bg-purple-100 text-purple-600' :
                    u.role === 'admin' ? 'bg-blue-100 text-blue-600' :
                    'bg-gray-100 text-gray-600'
                  }`}>{u.role}</span>
                </td>
                <td className="p-3 text-sm text-gray-400">{new Date(u.created_at).toLocaleDateString('en-NZ')}</td>
                <td className="p-3">
                  <div className="flex gap-2">
                    <button onClick={() => startEdit(u)} className="text-sm text-blue-600 hover:underline">Edit</button>
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
