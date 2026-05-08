import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../utils/api'

export default function Landing() {
  const [salons, setSalons] = useState([])

  useEffect(() => {
    api.getSalons().then(setSalons).catch(console.error)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
      {/* Hero */}
      <div className="max-w-5xl mx-auto px-4 py-20 text-center">
        <div className="text-6xl mb-6">✂️</div>
        <h1 className="text-4xl font-bold mb-4">Salon Booking Platform</h1>
        <p className="text-gray-500 text-lg mb-8">
          Nền tảng đặt lịch hẹn cho salon. Đăng ký salon của bạn chỉ trong vài phút.
        </p>
        <div className="flex gap-4 justify-center">
          <Link to="/register" className="bg-pink-600 text-white px-8 py-3 rounded-xl hover:bg-pink-700 font-medium text-lg">
            Đăng ký Salon
          </Link>
          <Link to="/login" className="border-2 border-pink-600 text-pink-600 px-8 py-3 rounded-xl hover:bg-pink-50 font-medium text-lg">
            Đăng nhập
          </Link>
        </div>
      </div>

      {/* Features */}
      <div className="max-w-5xl mx-auto px-4 py-16 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white rounded-xl shadow p-6 text-center">
          <div className="text-3xl mb-3">📅</div>
          <h3 className="font-semibold mb-2">Đặt lịch online 24/7</h3>
          <p className="text-sm text-gray-500">Khách hàng tự đặt lịch bất cứ lúc nào, không cần gọi điện</p>
        </div>
        <div className="bg-white rounded-xl shadow p-6 text-center">
          <div className="text-3xl mb-3">👥</div>
          <h3 className="font-semibold mb-2">Quản lý nhân viên</h3>
          <p className="text-sm text-gray-500">Phân công dịch vụ, xem lịch làm việc theo ngày/tuần</p>
        </div>
        <div className="bg-white rounded-xl shadow p-6 text-center">
          <div className="text-3xl mb-3">📊</div>
          <h3 className="font-semibold mb-2">Dashboard tổng quan</h3>
          <p className="text-sm text-gray-500">Xem thống kê booking, doanh thu, khách hàng</p>
        </div>
      </div>

      {/* Salon List */}
      {salons.length > 0 && (
        <div className="max-w-5xl mx-auto px-4 py-16">
          <h2 className="text-2xl font-bold mb-8 text-center">Salons trên nền tảng</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {salons.map(s => (
              <Link key={s.id} to={`/${s.slug}/book`} className="bg-white rounded-xl shadow p-6 hover:shadow-lg transition">
                <h3 className="font-semibold text-lg">{s.name}</h3>
                {s.address && <p className="text-sm text-gray-500 mt-1">📍 {s.address}</p>}
                {s.description && <p className="text-sm text-gray-400 mt-2">{s.description}</p>}
                <div className="mt-4 text-pink-600 text-sm font-medium">Đặt lịch →</div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="text-center py-8 text-gray-400 text-sm">
        © 2026 Salon Booking Platform
      </div>
    </div>
  )
}
