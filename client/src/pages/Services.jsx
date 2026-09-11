import { useState, useEffect } from 'react'
import { api } from '../utils/api'
import { sanitizeName } from '../utils/validation'
import { useI18n } from '../utils/i18n'
import { toast, confirmDialog } from '../utils/notify'


export default function Services() {
  const { t } = useI18n()
  const [services, setServices] = useState([])
  const [form, setForm] = useState({ name: '', description: '', duration_min: 30, price: '', category: '' })
  const [editing, setEditing] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState(null)

  const load = () => api.getServices().then(setServices).catch(console.error)
  useEffect(() => { load() }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    // Validate
    if (!form.name || form.name.trim().length < 2) {
      toast('Service name must be at least 2 characters', 'error')
      return
    }
    if (!form.duration_min || form.duration_min < 5) {
      toast('Duration must be at least 5 minutes', 'error')
      return
    }
    if (!form.price || form.price <= 0) {
      toast('Price must be greater than 0', 'error')
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
    } catch (err) { toast(err.message, 'error') }
  }

  const handleEdit = (s) => {
    setForm({ name: s.name, description: s.description || '', duration_min: s.duration_min, price: s.price, category: s.category || '' })
    setEditing(s.id)
  }

  const handleDelete = async (id) => {
    if (!await confirmDialog({ message: 'Delete this service?', confirmLabel: 'Delete', danger: true })) return
    await api.deleteService(id)
    load()
  }

  const categories = [...new Set(services.map(s => s.category).filter(Boolean))]
  const filteredServices = selectedCategory
    ? services.filter(s => s.category === selectedCategory)
    : services

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">💅 {t('services')}</h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow p-6 mb-8">
        <h2 className="text-lg font-semibold mb-4">{editing ? t('editService') : t('addService')}</h2>
        {/* Labels, not placeholders. This is the first screen a new salon has
            to fill in, and once a field had a value there was nothing left to
            say what it was. */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="svc-name" className="block text-sm font-medium text-gray-700 mb-1">
              {t('serviceName')} <span className="text-pink-600">*</span>
            </label>
            <input id="svc-name" placeholder={t('svcNamePlaceholder')} value={form.name} onChange={e => setForm({...form, name: e.target.value})}
              className="w-full border rounded-lg px-3 py-2" required minLength={2} />
          </div>
          <div>
            <label htmlFor="svc-category" className="block text-sm font-medium text-gray-700 mb-1">{t('category')}</label>
            <input id="svc-category" placeholder={t('svcCategoryPlaceholder')} value={form.category} onChange={e => setForm({...form, category: e.target.value})}
              className="w-full border rounded-lg px-3 py-2" list="categories" />
            <datalist id="categories">{categories.map(c => <option key={c} value={c} />)}</datalist>
            <p className="text-xs text-gray-400 mt-1">{t('svcCategoryHint')}</p>
          </div>
          <div>
            <label htmlFor="svc-duration" className="block text-sm font-medium text-gray-700 mb-1">
              {t('duration')} <span className="text-pink-600">*</span>
            </label>
            <input id="svc-duration" type="number" min="5" step="5" value={form.duration_min} onChange={e => setForm({...form, duration_min: +e.target.value})}
              className="w-full border rounded-lg px-3 py-2" required />
            <p className="text-xs text-gray-400 mt-1">{t('svcDurationHint')}</p>
          </div>
          <div>
            <label htmlFor="svc-price" className="block text-sm font-medium text-gray-700 mb-1">
              {t('priceLabel')} <span className="text-pink-600">*</span>
            </label>
            <input id="svc-price" type="number" min="0" value={form.price} onChange={e => setForm({...form, price: +e.target.value})}
              className="w-full border rounded-lg px-3 py-2" required step="0.01" />
          </div>
          <div className="md:col-span-2">
            <label htmlFor="svc-description" className="block text-sm font-medium text-gray-700 mb-1">{t('description')}</label>
            <textarea id="svc-description" placeholder={t('svcDescPlaceholder')} value={form.description} onChange={e => setForm({...form, description: e.target.value})}
              className="w-full border rounded-lg px-3 py-2" rows={2} />
          </div>
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
        <div className="flex gap-2 mb-6 flex-wrap">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition ${
              !selectedCategory
                ? 'bg-pink-600 text-white shadow'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            All ({services.length})
          </button>
          {categories.map(c => {
            const count = services.filter(s => s.category === c).length
            return (
              <button
                key={c}
                onClick={() => setSelectedCategory(selectedCategory === c ? null : c)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                  selectedCategory === c
                    ? 'bg-pink-600 text-white shadow'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {c} ({count})
              </button>
            )
          })}
        </div>
      )}

      {/* A brand-new salon used to land here on a blank page that said nothing
          about what to do next. */}
      {services.length === 0 && (
        <div className="bg-white rounded-xl shadow p-8 text-center">
          <h2 className="font-semibold text-gray-900 mb-1">{t('svcEmptyTitle')}</h2>
          <p className="text-sm text-gray-500 max-w-md mx-auto">{t('svcEmptyBody')}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredServices.map(s => (
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
