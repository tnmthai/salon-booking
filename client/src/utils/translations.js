// Priority 9: Multi-language support (English + Vietnamese)
const en = {
  dashboard: 'Dashboard', services: 'Services', staff: 'Staff', calendar: 'Calendar',
  users: 'Users', allShops: 'All Shops', bookingPage: 'Booking Page', logout: 'Logout',
  totalServices: 'Services', totalStaff: 'Staff', confirmed: 'Confirmed', totalCustomers: 'Customers',
  bookingsTab: 'Bookings', customersTab: 'Customers', settingsTab: 'Settings', allStatus: 'All Status',
  confirmedStatus: 'Confirmed', completedStatus: 'Completed', cancelledStatus: 'Cancelled',
  today: 'Today', prev: '← Prev', next: 'Next →', noBookings: 'No bookings found',
  time: 'Time', customer: 'Customer', phone: 'Phone', service: 'Service',
  price: 'Price', status: 'Status', actions: 'Actions', complete: 'Complete', cancel: 'Cancel',
  noCustomers: 'No customers yet', joined: 'Joined',
  addService: 'Add Service', editService: 'Edit Service', serviceName: 'Service Name',
  category: 'Category', duration: 'Duration (min)', priceLabel: 'Price ($)',
  description: 'Description', update: 'Update', add: 'Add',
  addStaff: 'Add Staff', editStaff: 'Edit Staff', staffName: 'Name',
  role: 'Role', selectRole: '-- Select Role --',
  allStaff: 'All Staff',
  userManagement: 'User Management', editUser: 'Edit User', deleteUser: 'Delete this user?',
  admin: 'Admin', owner: 'Owner',
  edit: 'Edit', delete: 'Delete', cancelBtn: 'Cancel', save: 'Save',
  loading: 'Loading...', noData: 'No data',
  bookAppointment: 'Book Appointment', chooseService: 'Choose a Service',
  chooseStaff: 'Choose Staff', chooseDate: 'Choose Date', chooseTime: 'Choose Time',
  yourInfo: 'Your Information', summary: 'Summary', confirmBooking: 'Confirm Booking',
  bookingConfirmed: 'Booking Confirmed!', bookAnother: 'Book Another',
  back: 'Back', nextBtn: 'Next', name: 'Name', email: 'Email', notes: 'Notes',
  durationLabel: 'Duration', noSlots: 'No available slots. Try another date.',
  loadingServices: 'Loading services...',
  salonBooking: 'Timia Booking Platform', registerSalon: 'Sign up your business', signIn: 'Sign in',
  subtitle: 'Booking platform for service businesses. Sign up in minutes.',
  bookOnline: '24/7 Online Booking', bookOnlineDesc: 'Customers book anytime, no phone calls required',
  staffMgmt: 'Team Management', staffMgmtDesc: 'Assign services, view schedules by day/week',
  dashOverview: 'Dashboard Overview', dashOverviewDesc: 'View booking stats, revenue, customers',
  salonsOnPlatform: 'Businesses on Platform', bookNow: 'Book Now →',
  loginTitle: 'Sign in', registerTitle: 'Sign up your business',
  registerSubtitle: 'Create an account and start receiving bookings',
  salonName: 'Business Name', salonOwner: 'Owner', createSalon: 'Create Business',
  creating: 'Creating...', noAccount: "Don't have an account?", haveAccount: 'Already have an account?',
  password: 'Password',
  reviews: 'Reviews', gallery: 'Gallery', daysOff: 'Days Off', reports: 'Reports',
  loyaltyPoints: 'Loyalty Points', myDashboard: 'My Dashboard', mySchedule: 'My Schedule',
}

const vi = {
  dashboard: 'Bảng điều khiển', services: 'Dịch vụ', staff: 'Nhân viên', calendar: 'Lịch',
  users: 'Người dùng', allShops: 'Tất cả cửa hàng', bookingPage: 'Trang đặt lịch', logout: 'Đăng xuất',
  totalServices: 'Dịch vụ', totalStaff: 'Nhân viên', confirmed: 'Đã xác nhận', totalCustomers: 'Khách hàng',
  bookingsTab: 'Lịch hẹn', customersTab: 'Khách hàng', settingsTab: 'Cài đặt', allStatus: 'Tất cả trạng thái',
  confirmedStatus: 'Đã xác nhận', completedStatus: 'Hoàn thành', cancelledStatus: 'Đã hủy',
  today: 'Hôm nay', prev: '← Trước', next: 'Tiếp →', noBookings: 'Không có lịch hẹn',
  time: 'Thời gian', customer: 'Khách hàng', phone: 'Điện thoại', service: 'Dịch vụ',
  price: 'Giá', status: 'Trạng thái', actions: 'Thao tác', complete: 'Hoàn thành', cancel: 'Hủy',
  noCustomers: 'Chưa có khách hàng', joined: 'Tham gia',
  addService: 'Thêm dịch vụ', editService: 'Sửa dịch vụ', serviceName: 'Tên dịch vụ',
  category: 'Danh mục', duration: 'Thời lượng (phút)', priceLabel: 'Giá ($)',
  description: 'Mô tả', update: 'Cập nhật', add: 'Thêm',
  addStaff: 'Thêm nhân viên', editStaff: 'Sửa nhân viên', staffName: 'Tên',
  role: 'Vai trò', selectRole: '-- Chọn vai trò --',
  allStaff: 'Tất cả nhân viên',
  userManagement: 'Quản lý người dùng', editUser: 'Sửa người dùng', deleteUser: 'Xóa người dùng này?',
  admin: 'Quản trị', owner: 'Chủ sở hữu',
  edit: 'Sửa', delete: 'Xóa', cancelBtn: 'Hủy', save: 'Lưu',
  loading: 'Đang tải...', noData: 'Không có dữ liệu',
  bookAppointment: 'Đặt lịch hẹn', chooseService: 'Chọn dịch vụ',
  chooseStaff: 'Chọn nhân viên', chooseDate: 'Chọn ngày', chooseTime: 'Chọn giờ',
  yourInfo: 'Thông tin của bạn', summary: 'Tóm tắt', confirmBooking: 'Xác nhận đặt lịch',
  bookingConfirmed: 'Đã xác nhận lịch hẹn!', bookAnother: 'Đặt lịch khác',
  back: 'Quay lại', nextBtn: 'Tiếp', name: 'Họ tên', email: 'Email', notes: 'Ghi chú',
  durationLabel: 'Thời lượng', noSlots: 'Không có giờ trống. Thử ngày khác.',
  loadingServices: 'Đang tải dịch vụ...',
  salonBooking: 'Nền tảng đặt lịch Timia', registerSalon: 'Đăng ký doanh nghiệp', signIn: 'Đăng nhập',
  subtitle: 'Nền tảng đặt lịch cho doanh nghiệp dịch vụ. Đăng ký trong vài phút.',
  bookOnline: 'Đặt lịch trực tuyến 24/7', bookOnlineDesc: 'Khách hàng đặt lịch bất cứ lúc nào, không cần gọi điện',
  staffMgmt: 'Quản lý đội ngũ', staffMgmtDesc: 'Phân công dịch vụ, xem lịch theo ngày/tuần',
  dashOverview: 'Tổng quan bảng điều khiển', dashOverviewDesc: 'Xem thống kê đặt lịch, doanh thu, khách hàng',
  salonsOnPlatform: 'Doanh nghiệp trên nền tảng', bookNow: 'Đặt lịch ngay →',
  loginTitle: 'Đăng nhập', registerTitle: 'Đăng ký doanh nghiệp',
  registerSubtitle: 'Tạo tài khoản và bắt đầu nhận đặt lịch',
  salonName: 'Tên doanh nghiệp', salonOwner: 'Chủ doanh nghiệp', createSalon: 'Tạo doanh nghiệp',
  creating: 'Đang tạo...', noAccount: 'Chưa có tài khoản?', haveAccount: 'Đã có tài khoản?',
  password: 'Mật khẩu',
  reviews: 'Đánh giá', gallery: 'Thư viện ảnh', daysOff: 'Ngày nghỉ', reports: 'Báo cáo',
  loyaltyPoints: 'Điểm tích lũy', myDashboard: 'Bảng điều khiển', mySchedule: 'Lịch của tôi',
}

const mi = {
  dashboard: 'Papa Mahi', services: 'Ngā Ratonga', staff: 'Ngā Kaimahi', calendar: 'Maramataka',
  users: 'Ngā Kaitaki', allShops: 'Ngā Toa Katoa', bookingPage: 'Whārangi Tono', logout: 'Takiuru',
  totalServices: 'Ngā Ratonga', totalStaff: 'Ngā Kaimahi', confirmed: 'Whakaaetia', totalCustomers: 'Ngā Kiritaki',
  bookingsTab: 'Ngā Tono', customersTab: 'Ngā Kiritaki', settingsTab: 'Ngā Tautuhinga', allStatus: 'Ngā Tūnga Katoa',
  confirmedStatus: 'Whakaaetia', completedStatus: 'Oti', cancelledStatus: 'Whakakorehia',
  today: 'Inanahi', prev: '← Mua', next: 'Whakamua →', noBookings: 'Kāore he tono i kitea',
  time: 'Wā', customer: 'Kiritaki', phone: 'Waea', service: 'Ratonga',
  price: 'Utu', status: 'Tūnga', actions: 'Ngā Mahi', complete: 'Whakaoti', cancel: 'Whakakore',
  noCustomers: 'Kāore anō he kiritaki', joined: 'Hono mai',
  addService: 'Tāpiri Ratonga', editService: 'Whakatika Ratonga', serviceName: 'Ingoa Ratonga',
  category: 'Momo', duration: 'Roa (meneti)', priceLabel: 'Utu ($)',
  description: 'Whakaahuatanga', update: 'Whakahou', add: 'Tāpiri',
  addStaff: 'Tāpiri Kaimahi', editStaff: 'Whakatika Kaimahi', staffName: 'Ingoa',
  role: 'Tūranga', selectRole: '-- Tīpakohia te Tūranga --',
  allStaff: 'Ngā Kaimahi Katoa',
  userManagement: 'Whakahaere Kaitaki', editUser: 'Whakatika Kaitaki', deleteUser: 'Mukua tēnei kaitaki?',
  admin: 'Kaiwhakahaere', owner: 'Kaipupuri',
  edit: 'Whakatika', delete: 'Muku', cancelBtn: 'Whakakore', save: 'Tiaki',
  loading: 'Kei te uta...', noData: 'Kāore he raraunga',
  bookAppointment: 'Tono Hōtaka', chooseService: 'Tīpakohia he Ratonga',
  chooseStaff: 'Tīpakohia he Kaimahi', chooseDate: 'Tīpakohia te Rā', chooseTime: 'Tīpakohia te Wā',
  yourInfo: 'Ō Mōhiohio', summary: 'Whakarāpopoto', confirmBooking: 'Whakau te Tono',
  bookingConfirmed: 'Kua Whakaaetia te Tono!', bookAnother: 'Tono anō',
  back: 'Hoki', nextBtn: 'Whakamua', name: 'Ingoa', email: 'Īmēra', notes: 'Tuhipoka',
  durationLabel: 'Roa', noSlots: 'Kāore he wā wātea. Whakamātauhia he rā kē.',
  loadingServices: 'Kei te uta ngā ratonga...',
  salonBooking: 'Papa Tono Timia', registerSalon: 'Rēhita tō pakihi', signIn: 'Takiuru mai',
  subtitle: 'Papa tono mō ngā pakihi ratonga. Rēhitia i ngā meneti.',
  bookOnline: 'Tono ā-ipurangi 24/7', bookOnlineDesc: 'Ka tono ngā kiritaki i te wā e hiahiatia ana, kāore he waea',
  staffMgmt: 'Whakahaere Kapa', staffMgmtDesc: 'Whakaratoa ngā ratonga, tirohia ngā hōtaka mō te rā/wiki',
  dashOverview: 'Tirohanga Papa Mahi', dashOverviewDesc: 'Tirohia ngā tatauranga tono, moni whiwhi, kiritaki',
  salonsOnPlatform: 'Ngā Pakihi i te Papa', bookNow: 'Tono Ināianei →',
  loginTitle: 'Takiuru mai', registerTitle: 'Rēhita tō pakihi',
  registerSubtitle: 'Waihanga he pūkete ka tīmoko ki te whiwhi tono',
  salonName: 'Ingoa Pakihi', salonOwner: 'Kaipupuri', createSalon: 'Waihanga Pakihi',
  creating: 'Kei te waihanga...', noAccount: 'Kāore he pūkete?', haveAccount: 'Kua mau he pūkete?',
  password: 'Kupuhipa',
  reviews: 'Ngā Arotake', gallery: 'Tānga Whakaahua', daysOff: 'Ngā Rā Wātea', reports: 'Ngā Pūrongo',
  loyaltyPoints: 'Ngā Tono Pūmau', myDashboard: 'Tō Papa Mahi', mySchedule: 'Tō Hōtaka',
}

const dicts = { en, vi, mi }

let currentLang = localStorage.getItem('salon_lang') || 'en'

export function setLanguage(lang) {
  currentLang = lang
  localStorage.setItem('salon_lang', lang)
}

export function getLanguage() {
  return currentLang
}

export const translations = new Proxy(dicts[currentLang] || en, {
  get(target, prop) {
    if (prop === 'then') return undefined // React thenable check
    const dict = dicts[currentLang] || en
    return dict[prop] || en[prop] || prop
  }
})

// Re-export for components that need to react to language changes
export function t(key) {
  const dict = dicts[currentLang] || en
  return dict[key] || en[key] || key
}
