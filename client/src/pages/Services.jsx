import { useState, useEffect } from 'react'
import { api } from '../utils/api'

export default function Services() {
  const [services, setServices] = useState([])
  const [form, setForm] = useState({ name: '', description: '', duration_min: 30, price: '', category: '' })
  const [editing, setEditing] = useState(null)

  const load = () => api.getServices().then(setServices).catch(console.error)
  useEffect(() => { load() }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editing) {
        await api.updateService(editing, { ...form, active: true })
        setEditing(null)
      } else {
        await api.createService(form)
      }
      setForm({ name: '', description: '', duration_min: 30, price: '', category: '' })
      load()
    } catch (err) { alert(err.message) }
  }

  const handleEdit = (s) => {
    setForm({ name: s.name, description: s.description, duration_min: s.duration_min, price: s.price, category: s.category })
    setEditing(s.id)
  }

  const handleDelete = async (id) => {
    if (!confirm('Xóa service này?')) return
    await api.deleteService(id)
    load()
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">💇 Services</h1>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow p-6 mb-8">
        <h2 className="text-lg font-semibold mb-4">{editing ? 'Edit Service' : 'Add Service'}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input placeholder="Tên dịch vụ" value={form.name} onChange={e => setForm({...form, name: e.target.value})}
            className="border rounded-lg px-3 py-2" required />
          <input placeholder="Danh mục (Hair, Nails...)" value={form.category} onChange={e => setForm({...form, category: e.target.value})}
            className="border rounded-lg px-3 py-2" />
          <input type="number" placeholder="Thời gian (phút)" value={form.duration_min} onChange={e => setForm({...form, duration_min: +e.target.value})}
            className="border rounded-lg px-3 py-2" required />
          <input type="number" placeholder="Giá ($)" value={form.price} onChange={e => setForm({...form, price: +e.target.value})}
            className="border rounded-lg px-3 py-2" required />
          <textarea placeholder="Mô tả" value={form.description} onChange={e => setForm({...form, description: e.target.value})}
            className="border rounded-lg px-3 py-2 md:col-span-2" rows={2} />
        </div>
        <div className="mt-4 flex gap-2">
          <button type="submit" className="bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700">
            {editing ? 'Update' : 'Add'}
          </button>
          {editing && <button type="button" onClick={() => { setEditing(null); setForm({ name: '', description: '', duration_min: 30, price: '', category: '' }) }}
            className="border px-4 py-2 rounded-lg hover:bg-gray-50">Cancel</button>}
        </div>
      </form>

      {/* List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {services.map(s => (
          <div key={s.id} className="bg-white rounded-xl shadow p-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold">{s.name}</h3>
                <p className="text-sm text-gray-500">{s.category}</p>
                {s.description && <p className="text-sm text-gray-400 mt-1">{s.description}</p>}
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-pink-600">${s.price}</div>
                <div className="text-xs text-gray-400">{s.duration_min} min</div>
              </div>
            </div>
            <div className="mt-3 flex gap-2">
              <button onClick={() => handleEdit(s)} className="text-sm text-blue-600 hover:underline">Edit</button>
              <button onClick={() => handleDelete(s.id)} className="text-sm text-red-600 hover:underline">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
