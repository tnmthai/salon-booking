import { createContext, useContext, useState } from 'react'

const translations = {
  en: {
    // Nav
    dashboard: 'Dashboard', services: 'Services', staff: 'Staff', calendar: 'Calendar',
    users: 'Users', allShops: 'All Shops', bookingPage: 'Booking Page', logout: 'Logout',
    // Dashboard
    totalServices: 'Services', totalStaff: 'Staff', confirmed: 'Confirmed', totalCustomers: 'Customers',
    bookingsTab: 'Bookings', customersTab: 'Customers', allStatus: 'All Status',
    confirmedStatus: 'Confirmed', completedStatus: 'Completed', cancelledStatus: 'Cancelled',
    today: 'Today', prev: '← Prev', next: 'Next →', noBookings: 'No bookings found',
    time: 'Time', customer: 'Customer', phone: 'Phone', service: 'Service',
    price: 'Price', status: 'Status', actions: 'Actions', complete: 'Complete', cancel: 'Cancel',
    noCustomers: 'No customers yet', joined: 'Joined',
    // Services
    addService: 'Add Service', editService: 'Edit Service', serviceName: 'Service Name',
    category: 'Category', duration: 'Duration (min)', priceLabel: 'Price ($)',
    description: 'Description', update: 'Update', add: 'Add',
    // Staff
    addStaff: 'Add Staff', editStaff: 'Edit Staff', staffName: 'Name',
    role: 'Role', selectRole: '-- Select Role --',
    // Calendar
    allStaff: 'All Staff',
    // Users
    userManagement: 'User Management', editUser: 'Edit User', deleteUser: 'Delete this user?',
    admin: 'Admin', owner: 'Owner',
    // Common
    edit: 'Edit', delete: 'Delete', cancelBtn: 'Cancel', save: 'Save',
    loading: 'Loading...', noData: 'No data',
    // Booking
    bookAppointment: 'Book Appointment', chooseService: 'Choose a Service',
    chooseStaff: 'Choose Staff', chooseDate: 'Choose Date', chooseTime: 'Choose Time',
    yourInfo: 'Your Information', summary: 'Summary', confirmBooking: 'Confirm Booking',
    bookingConfirmed: 'Booking Confirmed!', bookAnother: 'Book Another',
    back: 'Back', nextBtn: 'Next', name: 'Name', email: 'Email', notes: 'Notes',
    durationLabel: 'Duration', noSlots: 'No available slots. Try another date.',
    loadingServices: 'Loading services...',
    // Landing
    salonBooking: 'Salon Booking Platform', registerSalon: 'Register Salon', signIn: 'Sign In',
    subtitle: 'Salon booking platform. Register your salon in minutes.',
    bookOnline: '24/7 Online Booking', bookOnlineDesc: 'Customers book anytime, no phone calls needed',
    staffMgmt: 'Staff Management', staffMgmtDesc: 'Assign services, view schedules by day/week',
    dashOverview: 'Dashboard Overview', dashOverviewDesc: 'View booking stats, revenue, customers',
    salonsOnPlatform: 'Salons on Platform', bookNow: 'Book Now →',
    // Auth
    loginTitle: 'Sign In', registerTitle: 'Register Salon',
    registerSubtitle: 'Create an account and start receiving bookings',
    salonName: 'Salon Name', salonOwner: 'Salon Owner', createSalon: 'Create Salon',
    creating: 'Creating...', noAccount: "Don't have an account?", haveAccount: 'Already have an account?',
    password: 'Password',
  },
  vi: {
    dashboard: 'Tổng quan', services: 'Dịch vụ', staff: 'Nhân viên', calendar: 'Lịch',
    users: 'Người dùng', allShops: 'Tất cả Shop', bookingPage: 'Trang Đặt Lịch', logout: 'Đăng xuất',
    totalServices: 'Dịch vụ', totalStaff: 'Nhân viên', confirmed: 'Xác nhận', totalCustomers: 'Khách hàng',
    bookingsTab: 'Lịch hẹn', customersTab: 'Khách hàng', allStatus: 'Tất cả',
    confirmedStatus: 'Đã xác nhận', completedStatus: 'Hoàn thành', cancelledStatus: 'Đã hủy',
    today: 'Hôm nay', prev: '← Trước', next: 'Sau →', noBookings: 'Không có lịch hẹn',
    time: 'Thời gian', customer: 'Khách hàng', phone: 'SĐT', service: 'Dịch vụ',
    price: 'Giá', status: 'Trạng thái', actions: 'Thao tác', complete: 'Hoàn thành', cancel: 'Hủy',
    noCustomers: 'Chưa có khách hàng', joined: 'Ngày tạo',
    addService: 'Thêm dịch vụ', editService: 'Sửa dịch vụ', serviceName: 'Tên dịch vụ',
    category: 'Danh mục', duration: 'Thời gian (phút)', priceLabel: 'Giá ($)',
    description: 'Mô tả', update: 'Cập nhật', add: 'Thêm',
    addStaff: 'Thêm nhân viên', editStaff: 'Sửa nhân viên', staffName: 'Tên',
    role: 'Vai trò', selectRole: '-- Chọn vai trò --',
    allStaff: 'Tất cả nhân viên',
    userManagement: 'Quản lý người dùng', editUser: 'Sửa người dùng', deleteUser: 'Xóa người dùng này?',
    admin: 'Quản trị', owner: 'Chủ salon',
    edit: 'Sửa', delete: 'Xóa', cancelBtn: 'Hủy', save: 'Lưu',
    loading: 'Đang tải...', noData: 'Không có dữ liệu',
    bookAppointment: 'Đặt lịch hẹn', chooseService: 'Chọn dịch vụ',
    chooseStaff: 'Chọn nhân viên', chooseDate: 'Chọn ngày', chooseTime: 'Chọn giờ',
    yourInfo: 'Thông tin của bạn', summary: 'Tóm tắt', confirmBooking: 'Xác nhận đặt lịch',
    bookingConfirmed: 'Đặt lịch thành công!', bookAnother: 'Đặt lịch khác',
    back: 'Quay lại', nextBtn: 'Tiếp', name: 'Họ tên', email: 'Email', notes: 'Ghi chú',
    durationLabel: 'Thời gian', noSlots: 'Không có slot trống. Thử ngày khác.',
    loadingServices: 'Đang tải dịch vụ...',
    salonBooking: 'Nền tảng đặt lịch Salon', registerSalon: 'Đăng ký Salon', signIn: 'Đăng nhập',
    subtitle: 'Nền tảng đặt lịch hẹn cho salon. Đăng ký salon của bạn chỉ trong vài phút.',
    bookOnline: 'Đặt lịch online 24/7', bookOnlineDesc: 'Khách hàng tự đặt lịch bất cứ lúc nào',
    staffMgmt: 'Quản lý nhân viên', staffMgmtDesc: 'Phân công dịch vụ, xem lịch làm việc',
    dashOverview: 'Dashboard tổng quan', dashOverviewDesc: 'Xem thống kê booking, doanh thu',
    salonsOnPlatform: 'Salons trên nền tảng', bookNow: 'Đặt lịch →',
    loginTitle: 'Đăng nhập', registerTitle: 'Đăng ký Salon',
    registerSubtitle: 'Tạo tài khoản và bắt đầu nhận booking',
    salonName: 'Tên Salon', salonOwner: 'Chủ Salon', createSalon: 'Tạo Salon',
    creating: 'Đang tạo...', noAccount: 'Chưa có tài khoản?', haveAccount: 'Đã có tài khoản?',
    password: 'Mật khẩu',
  }
}

const I18nContext = createContext()

export function I18nProvider({ children }) {
  const [lang, setLang] = useState(localStorage.getItem('salon_lang') || 'en')
  const t = (key) => translations[lang]?.[key] || translations.en[key] || key
  const toggleLang = () => {
    const next = lang === 'en' ? 'vi' : 'en'
    setLang(next)
    localStorage.setItem('salon_lang', next)
  }
  return (
    <I18nContext.Provider value={{ lang, t, toggleLang }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useI18n() {
  return useContext(I18nContext)
}
