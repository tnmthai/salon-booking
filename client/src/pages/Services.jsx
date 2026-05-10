import { useState, useEffect } from 'react'
import { api } from '../utils/api'
import { sanitizeName } from '../utils/validation'
import { translations } from '../utils/translations'


export default function Services() {
  const t = (k) => translations[k] || k
  const [services, setServices] = useState([])
  const [form, setForm] = useState({ name: '', description: '', duration_min: 30, price: '', category: '' })
  const [editing, setEditing] = useState(null)

  const load = () => api.getServices().then(setServices).catch(console.error)
  useEffect(() => { load() }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    // Validate
    if (!form.name || form.name.trim().length < 2) {
      alert('Service name must be at least 2 characters')
      return
    }
    if (!form.duration_min || form.duration_min < 5) {
      alert('Duration must be at least 5 minutes')
      return
    }
    if (!form.price || form.price <= 0) {
      alert('Price must be greater than 0')
      return
    }
    try {
      if (editing) {
        await api.updateService(editing, { ...form, active: true })
        setEditing(null)
      } else {
        await api.createService({ ...form, name: form.name.trim(), category: form.category?.trim() || '' })
      }
      setForm({ name: '', description: '', duration_min: 30, price: '', category: '' })
      load()
    } catch (err) { alert(err.message) }
  }

  const handleEdit = (s) => {
    setForm({ name: s.name, description: s.description || '', duration_min: s.duration_min, price: s.price, category: s.category || '' })
    setEditing(s.id)
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this service?')) return
    await api.deleteService(id)
    load()
  }

  const categories = [...new Set(services.map(s => s.category).filter(Boolean))]

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">💅 {t('services')}</h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow p-6 mb-8">
        <h2 className="text-lg font-semibold mb-4">{editing ? t('editService') : t('addService')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input placeholder={t('serviceName')} value={form.name} onChange={e => setForm({...form, name: e.target.value})}
            className="border rounded-lg px-3 py-2" required minLength={2} />
          <input placeholder={t('category')} value={form.category} onChange={e => setForm({...form, category: e.target.value})}
            className="border rounded-lg px-3 py-2" list="categories" />
          <datalist id="categories">{categories.map(c => <option key={c} value={c} />)}</datalist>
          <input type="number" placeholder={t('duration')} value={form.duration_min} onChange={e => setForm({...form, duration_min: +e.target.value})}
            className="border rounded-lg px-3 py-2" required />
          <input type="number" placeholder={t('priceLabel')} value={form.price} onChange={e => setForm({...form, price: +e.target.value})}
            className="border rounded-lg px-3 py-2" required step="0.01" />
          <textarea placeholder={t('description')} value={form.description} onChange={e => setForm({...form, description: e.target.value})}
            className="border rounded-lg px-3 py-2 md:col-span-2" rows={2} />
        </div>
        <div className="mt-4 flex gap-2">
          <button type="submit" className="bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700">
            {editing ? t('update') : t('add')}
          </button>
          {editing && <button type="button" onClick={() => { setEditing(null); setForm({ name: '', description: '', duration_min: 30, price: '', category: '' }) }}
            className="border px-4 py-2 rounded-lg hover:bg-gray-50">{t('cancelBtn')}</button>}
        </div>
      </form>

      {categories.length > 0 && (
        <div className="flex gap-2 mb-4 flex-wrap">
          {categories.map(c => (
            <span key={c} className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm">{c}</span>
          ))}
        </div>
      )}

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
              <button onClick={() => handleEdit(s)} className="text-sm text-blue-600 hover:underline">{t('edit')}</button>
              <button onClick={() => handleDelete(s.id)} className="text-sm text-red-600 hover:underline">{t('delete')}</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
