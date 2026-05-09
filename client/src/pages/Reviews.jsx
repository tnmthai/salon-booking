import { useState, useEffect } from 'react'
import { api } from '../utils/api'

const TZ = 'Pacific/Auckland'

export default function Reviews() {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadReviews()
  }, [])

  const loadReviews = () => {
    api.getReviews().then(data => {
      setReviews(data)
      setLoading(false)
    }).catch(() => setLoading(false))
  }

  const deleteReview = async (id) => {
    if (!confirm('Delete this review?')) return
    try {
      await api.deleteReview(id)
      loadReviews()
    } catch (err) {
      alert(err.message)
    }
  }

  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : 0

  if (loading) return <div className="p-8 text-center text-gray-400">Loading...</div>

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">⭐ Reviews</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow p-4">
          <div className="text-2xl font-bold text-yellow-500">{avgRating} ⭐</div>
          <div className="text-gray-500 text-sm">Average Rating</div>
        </div>
        <div className="bg-white rounded-xl shadow p-4">
          <div className="text-2xl font-bold text-pink-600">{reviews.length}</div>
          <div className="text-gray-500 text-sm">Total Reviews</div>
        </div>
        <div className="bg-white rounded-xl shadow p-4">
          <div className="text-2xl font-bold text-green-600">{reviews.filter(r => r.rating >= 4).length}</div>
          <div className="text-gray-500 text-sm">Positive (4-5★)</div>
        </div>
      </div>

      {reviews.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-5xl mb-4">⭐</div>
          <p className="text-gray-400 text-lg">No reviews yet</p>
          <p className="text-gray-400 text-sm mt-2">Reviews will appear after customers complete their appointments</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map(r => (
            <div key={r.id} className="bg-white rounded-xl shadow-sm border p-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold">{r.customer_name}</span>
                    <div className="text-yellow-400">
                      {'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}
                    </div>
                  </div>
                  {r.staff_name && (
                    <div className="text-sm text-gray-500">Staff: {r.staff_name}</div>
                  )}
                  {r.comment && (
                    <p className="text-gray-600 mt-2">{r.comment}</p>
                  )}
                  <div className="text-xs text-gray-400 mt-2">
                    {new Date(r.created_at).toLocaleDateString('en-NZ', { timeZone: TZ, weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </div>
                </div>
                <button onClick={() => deleteReview(r.id)}
                  className="text-gray-400 hover:text-red-500 text-sm">🗑</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
