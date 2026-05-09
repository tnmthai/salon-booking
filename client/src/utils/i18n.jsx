import { createContext, useContext } from 'react'

const translations = {
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
  salonBooking: 'Salon Booking Platform', registerSalon: 'Sign up salon', signIn: 'Sign in',
  subtitle: 'Salon booking platform. Sign up your salon in minutes.',
  bookOnline: '24/7 Online Booking', bookOnlineDesc: 'Customers book anytime, no phone calls required',
  staffMgmt: 'Staff Management', staffMgmtDesc: 'Assign services, view schedules by day/week',
  dashOverview: 'Dashboard Overview', dashOverviewDesc: 'View booking stats, revenue, customers',
  salonsOnPlatform: 'Salons on Platform', bookNow: 'Book Now →',
  // Auth
  loginTitle: 'Sign in', registerTitle: 'Sign up salon',
  registerSubtitle: 'Create an account and start receiving bookings',
  salonName: 'Salon Name', salonOwner: 'Salon Owner', createSalon: 'Create Salon',
  creating: 'Creating...', noAccount: "Don't have an account?", haveAccount: 'Already have an account?',
  password: 'Password',
}

const I18nContext = createContext()

export function I18nProvider({ children }) {
  const t = (key) => translations[key] || key
  return (
    <I18nContext.Provider value={{ t }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useI18n() {
  return useContext(I18nContext)
}
