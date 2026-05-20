import { useState, useEffect } from 'react'
import { api } from '../utils/api'

export default function Loyalty() {
  const [settings, setSettings] = useState({ points_per_dollar: 0.1, stamp_goal: 10, stamp_reward: 'Free service' })
  const [rewards, setRewards] = useState([])
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')
  const [showAddReward, setShowAddReward] = useState(false)
  const [newReward, setNewReward] = useState({ name: '', description: '', points_cost: '' })
  const [searchQuery, setSearchQuery] = useState('')
  const [customerData, setCustomerData] = useState(null)
  const [searching, setSearching] = useState(false)
  const [customers, setCustomers] = useState([])
  const [loadingCustomers, setLoadingCustomers] = useState(true)
  const [emailSending, setEmailSending] = useState({})

  useEffect(() => {
    api.me().then(data => {
      if (data.salon?.loyalty_settings) {
        setSettings({ ...settings, ...data.salon.loyalty_settings })
      }
    }).catch(console.error)
    api.getLoyaltyRewards().then(setRewards).catch(console.error)
    api.getLoyaltyCustomers().then(data => {
      setCustomers(data.customers || [])
      setLoadingCustomers(false)
    }).catch(() => setLoadingCustomers(false))
  }, [])

  const saveSettings = async () => {
    setSaving(true)
    setMsg('')
    try {
      await api.updateSalonSettings({ loyalty_settings: settings })
      setMsg('✅ Settings saved!')
      setTimeout(() => setMsg(''), 3000)
    } catch (err) { setMsg('❌ ' + err.message) }
    setSaving(false)
  }

  const addReward = async () => {
    if (!newReward.name || !newReward.points_cost) return
    try {
      const reward = await api.createLoyaltyReward(newReward)
      setRewards([...rewards, reward])
      setNewReward({ name: '', description: '', points_cost: '' })
      setShowAddReward(false)
    } catch (err) { alert(err.message) }
  }

  const toggleReward = async (id, active) => {
    try {
      await api.updateLoyaltyReward(id, { active: !active })
      setRewards(rewards.map(r => r.id === id ? { ...r, active: !active } : r))
    } catch (err) { alert(err.message) }
  }

  const deleteReward = async (id) => {
    if (!confirm('Delete this reward?')) return
    try {
      await api.deleteLoyaltyReward(id)
      setRewards(rewards.filter(r => r.id !== id))
    } catch (err) { alert(err.message) }
  }

  const searchCustomer = async () => {
    if (!searchQuery.trim()) return
    setSearching(true)
    setCustomerData(null)
    try {
      const data = await api.getLoyaltyByPhone(searchQuery.trim())
      setCustomerData(data)
    } catch (err) { alert(err.message) }
    setSearching(false)
  }

  const redeemReward = async (customerId, rewardId) => {
    try {
      const result = await api.redeemLoyaltyReward({ customer_id: customerId, reward_id: rewardId })
      setCustomerData(prev => ({ ...prev, customer: { ...prev.customer, loyalty_points: result.remaining_points } }))
      alert('✅ Reward redeemed!')
    } catch (err) { alert(err.message) }
  }

  const sendPointsEmail = async (customerId, customerName) => {
    setEmailSending({ ...emailSending, [customerId]: true })
    try {
      await api.sendLoyaltyPointsEmail(customerId)
      alert(`✅ Points email sent to ${customerName}!`)
    } catch (err) {
      alert('❌ ' + err.message)
    }
    setEmailSending({ ...emailSending, [customerId]: false })
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">⭐ Loyalty Program</h1>

      {msg && (
        <div className={`mb-4 p-3 rounded-lg text-sm ${msg.includes('✅') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          {msg}
        </div>
      )}

      {/* Settings */}
      <div className="bg-white rounded-xl shadow p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">⚙️ Points Settings</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Points per $1 spent</label>
            <input type="number" step="0.01" min="0" value={settings.points_per_dollar}
              onChange={e => setSettings({ ...settings, points_per_dollar: parseFloat(e.target.value) || 0 })}
              className="w-full border rounded-lg px-3 py-2" />
            <p className="text-xs text-gray-400 mt-1">e.g. 0.1 = 1 point per $10</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Stamp Goal</label>
            <input type="number" min="1" value={settings.stamp_goal}
              onChange={e => setSettings({ ...settings, stamp_goal: parseInt(e.target.value) || 10 })}
              className="w-full border rounded-lg px-3 py-2" />
            <p className="text-xs text-gray-400 mt-1">Visits needed for reward</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Stamp Reward</label>
            <input type="text" value={settings.stamp_reward}
              onChange={e => setSettings({ ...settings, stamp_reward: e.target.value })}
              className="w-full border rounded-lg px-3 py-2" />
            <p className="text-xs text-gray-400 mt-1">e.g. "Free haircut"</p>
          </div>
        </div>
        <button onClick={saveSettings} disabled={saving}
          className="bg-pink-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-pink-700 disabled:opacity-50">
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>

      {/* Rewards */}
      <div className="bg-white rounded-xl shadow p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">🎁 Rewards</h2>
          <button onClick={() => setShowAddReward(!showAddReward)}
            className="text-sm bg-pink-50 text-pink-600 px-4 py-2 rounded-lg hover:bg-pink-100 font-medium">
            + Add Reward
          </button>
        </div>

        {showAddReward && (
          <div className="border rounded-lg p-4 mb-4 bg-gray-50 space-y-3">
            <input placeholder="Reward name (e.g. Free manicure)" value={newReward.name}
              onChange={e => setNewReward({ ...newReward, name: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 text-sm" />
            <input placeholder="Description (optional)" value={newReward.description}
              onChange={e => setNewReward({ ...newReward, description: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 text-sm" />
            <div className="flex gap-2">
              <input type="number" placeholder="Points cost" value={newReward.points_cost}
                onChange={e => setNewReward({ ...newReward, points_cost: e.target.value })}
                className="flex-1 border rounded-lg px-3 py-2 text-sm" />
              <button onClick={addReward} className="bg-pink-600 text-white px-4 py-2 rounded-lg text-sm font-medium">Add</button>
              <button onClick={() => setShowAddReward(false)} className="border px-4 py-2 rounded-lg text-sm">Cancel</button>
            </div>
          </div>
        )}

        {rewards.length === 0 ? (
          <p className="text-gray-400 text-sm py-4 text-center">No rewards yet. Add your first reward!</p>
        ) : (
          <div className="space-y-2">
            {rewards.map(r => (
              <div key={r.id} className={`flex items-center justify-between border rounded-lg p-3 ${!r.active ? 'opacity-50' : ''}`}>
                <div>
                  <span className="font-medium text-sm">{r.name}</span>
                  {r.description && <span className="text-gray-400 text-xs ml-2">{r.description}</span>}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-pink-600">{r.points_cost} pts</span>
                  <button onClick={() => toggleReward(r.id, r.active)} className={`text-xs px-2 py-1 rounded ${r.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {r.active ? 'Active' : 'Off'}
                  </button>
                  <button onClick={() => deleteReward(r.id)} className="text-xs text-red-500 hover:text-red-700">✕</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Customer Points List */}
      <div className="bg-white rounded-xl shadow p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">📊 Customer Points</h2>
        {loadingCustomers ? (
          <p className="text-gray-400 text-sm py-4 text-center">Loading customers...</p>
        ) : customers.length === 0 ? (
          <p className="text-gray-400 text-sm py-4 text-center">No customers with points yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="pb-2 font-medium text-gray-500">Customer</th>
                  <th className="pb-2 font-medium text-gray-500">Contact</th>
                  <th className="pb-2 font-medium text-gray-500 text-right">Points</th>
                  <th className="pb-2 font-medium text-gray-500 text-right">Visits</th>
                  <th className="pb-2 font-medium text-gray-500 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {customers.map(c => (
                  <tr key={c.id} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="py-3 font-medium">{c.name}</td>
                    <td className="py-3 text-gray-500">
                      {c.email && <div className="text-xs">{c.email}</div>}
                      {c.phone && <div className="text-xs">{c.phone}</div>}
                    </td>
                    <td className="py-3 text-right">
                      <span className="bg-pink-100 text-pink-700 px-2 py-1 rounded-full text-xs font-semibold">{c.loyalty_points} pts</span>
                    </td>
                    <td className="py-3 text-right text-gray-500 text-xs">{c.total_visits || 0}</td>
                    <td className="py-3 text-right">
                      {c.email ? (
                        <button
                          onClick={() => sendPointsEmail(c.id, c.name)}
                          disabled={emailSending[c.id]}
                          className="text-xs bg-pink-50 text-pink-600 px-3 py-1.5 rounded-lg hover:bg-pink-100 font-medium disabled:opacity-50"
                        >
                          {emailSending[c.id] ? 'Sending...' : '📧 Email'}
                        </button>
                      ) : (
                        <span className="text-xs text-gray-300">No email</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Customer Lookup */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-lg font-semibold mb-4">🔍 Customer Lookup</h2>
        <div className="flex gap-2 mb-4">
          <input placeholder="Phone number or email" value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="flex-1 border rounded-lg px-3 py-2 text-sm"
            onKeyDown={e => e.key === 'Enter' && searchCustomer()} />
          <button onClick={searchCustomer} disabled={searching}
            className="bg-pink-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-pink-700 disabled:opacity-50">
            {searching ? '...' : 'Search'}
          </button>
        </div>

        {customerData && (
          <div className="border rounded-lg p-4 bg-gray-50">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-semibold">{customerData.customer.name}</h3>
                <p className="text-sm text-gray-400">{customerData.customer.phone}</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-pink-600">{customerData.customer.loyalty_points} pts</div>
                <div className="text-xs text-gray-400">{customerData.customer.total_visits || 0} visits</div>
              </div>
            </div>
            {/* Stamp card */}
            <div className="mb-3">
              <div className="text-xs text-gray-500 mb-1">Stamp Progress</div>
              <div className="flex flex-wrap gap-1">
                {Array.from({ length: customerData.settings?.stamp_goal || 10 }, (_, i) => (
                  <span key={i} className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${i < (customerData.customer.total_visits || 0) % (customerData.settings?.stamp_goal || 10) ? 'bg-pink-500 text-white' : 'bg-gray-200 text-gray-400'}`}>
                    {i < (customerData.customer.total_visits || 0) % (customerData.settings?.stamp_goal || 10) ? '⭐' : '○'}
                  </span>
                ))}
              </div>
            </div>
            {/* Redeemable rewards */}
            {rewards.filter(r => r.active && r.points_cost <= customerData.customer.loyalty_points).length > 0 && (
              <div>
                <div className="text-xs text-gray-500 mb-2">Available Rewards</div>
                <div className="space-y-1">
                  {rewards.filter(r => r.active && r.points_cost <= customerData.customer.loyalty_points).map(r => (
                    <div key={r.id} className="flex items-center justify-between bg-white rounded-lg p-2 border">
                      <span className="text-sm">{r.name} <span className="text-gray-400">({r.points_cost} pts)</span></span>
                      <button onClick={() => redeemReward(customerData.customer.id, r.id)}
                        className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full font-medium hover:bg-green-200">
                        Redeem
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
