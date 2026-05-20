const BASE = '/api';

function getToken() {
  return localStorage.getItem('salon_token');
}

async function request(path, options = {}) {
  const token = getToken();
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, { ...options, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'Request failed');
  }
  return res.json();
}

export const api = {
  // Auth
  register: (data) => request('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  login: (data) => request('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  me: () => request('/auth/me'),

  // Salons (public)
  getSalons: () => request('/salons'),
  getExploreSalons: () => request('/explore/salons'),
  getAdminSalons: () => request('/admin/salons'),
  getSalon: (slug) => request(`/salons/${slug}`),
  updateSalonSettings: (data) => request('/salon/settings', { method: 'PUT', body: JSON.stringify(data) }),

  // Services
  getServices: () => request('/services'),
  getPublicServices: (slug) => request(`/services/public/${slug}`),
  createService: (data) => request('/services', { method: 'POST', body: JSON.stringify(data) }),
  updateService: (id, data) => request(`/services/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteService: (id) => request(`/services/${id}`, { method: 'DELETE' }),

  // Staff
  getStaff: () => request('/staff'),
  getPublicStaff: (slug) => request(`/staff/public/${slug}`),
  getStaffById: (id) => request(`/staff/${id}`),
  createStaff: (data) => request('/staff', { method: 'POST', body: JSON.stringify(data) }),
  updateStaff: (id, data) => request(`/staff/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteStaff: (id) => request(`/staff/${id}`, { method: 'DELETE' }),

  // Appointments
  getAppointments: (params) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/appointments?${qs}`);
  },
  getSlots: (slug, staff_id, service_id, date) =>
    request(`/appointments/slots?slug=${slug}&staff_id=${staff_id}&service_id=${service_id}&date=${date}`),
  createAppointment: (data) => request('/appointments', { method: 'POST', body: JSON.stringify(data) }),
  createPublicAppointment: async (data) => {
    const res = await fetch('/api/appointments/public', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: res.statusText }));
      throw new Error(err.error || 'Booking failed');
    }
    return res.json();
  },
  updateAppointment: (id, data) => request(`/appointments/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  cancelAppointment: (id) => request(`/appointments/${id}`, { method: 'DELETE' }),

  // Customers
  getCustomers: () => request('/customers'),
  createCustomer: (data) => request('/customers', { method: 'POST', body: JSON.stringify(data) }),

  // Users
  getUsers: () => request('/users'),
  getAllUsers: () => request('/users/all'),
  updateUser: (id, data) => request(`/users/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteUser: (id) => request(`/users/${id}`, { method: 'DELETE' }),
  resetPassword: (id, password) => request(`/users/${id}/reset-password`, { method: 'PUT', body: JSON.stringify({ password }) }),

  // Working Hours
  getWorkingHours: (staffId) => request(`/working-hours/staff/${staffId}`),
  getSalonWorkingHours: (salonId) => request(`/working-hours/salon/${salonId}`),
  setWorkingHours: (staffId, schedule) => request(`/working-hours/staff/${staffId}`, { method: 'POST', body: JSON.stringify({ schedule }) }),
  getPublicWorkingHours: (slug) => request(`/working-hours/public/${slug}`),

  // Reports
  getReportStats: (params) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/reports/stats?${qs}`);
  },

  // Reviews
  getReviews: () => request('/reviews'),
  getPublicReviews: (slug) => request(`/reviews/public/${slug}`),
  getSalonRating: (slug) => request(`/reviews/rating/${slug}`),
  deleteReview: (id) => request(`/reviews/${id}`, { method: 'DELETE' }),

  // Gallery
  getGallery: () => request('/gallery'),
  getPublicGallery: (slug) => request(`/gallery/public/${slug}`),
  addGalleryImage: (data) => request('/gallery', { method: 'POST', body: JSON.stringify(data) }),
  deleteGalleryImage: (id) => request(`/gallery/${id}`, { method: 'DELETE' }),

  // Working Hours Overrides
  getOverrides: () => request('/overrides/salon'),
  getStaffOverrides: (staffId) => request(`/overrides/staff/${staffId}`),
  createOverride: (data) => request('/overrides', { method: 'POST', body: JSON.stringify(data) }),
  deleteOverride: (id) => request(`/overrides/${id}`, { method: 'DELETE' }),

  // Loyalty
  getLoyalty: (phone) => request(`/loyalty/${phone}`),

  // Visits
  trackVisit: (salon_id, page) => fetch('/api/visits', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ salon_id, page }) }),
  getVisitStats: () => request('/visits/stats'),
  getPublicVisitCount: () => fetch('/api/visits/public').then(r => r.json()),

  // Plans
  getPlans: () => fetch('/api/plans').then(r => r.json()),
  getPlan: () => request('/plan'),
  updatePlan: (salonId, plan, billingCycle) => request(`/plan/${salonId}`, { method: 'PUT', body: JSON.stringify({ plan, billingCycle }) }),

  // Trial
  startTrial: (targetPlan) => request('/trial/start', { method: 'POST', body: JSON.stringify({ targetPlan }) }),

  // Billing
  switchBillingCycle: (cycle) => request('/billing/cycle', { method: 'POST', body: JSON.stringify({ cycle }) }),

  // Early Bird
  getEarlyBirdStatus: () => fetch('/api/early-bird/status').then(r => r.json()),
  claimEarlyBird: () => request('/early-bird/claim', { method: 'POST' }),

  // Referral
  getReferralCode: () => request('/referral/code', { method: 'POST' }),
  applyReferralCode: (code) => request('/referral/apply', { method: 'POST', body: JSON.stringify({ code }) }),
  getReferralStats: () => request('/referral/stats'),

  // Complete appointment (staff)
  completeAppointment: (id) => request(`/appointments/${id}/complete`, { method: 'PUT' }),

  // Loyalty
  getLoyaltyByPhone: (identifier) => request(`/loyalty/${identifier}`),
  getLoyaltyPublic: (slug, identifier) => request(`/loyalty/public/${slug}/${identifier}`),
  getLoyaltyRewards: () => request('/loyalty/rewards'),
  createLoyaltyReward: (data) => request('/loyalty/rewards', { method: 'POST', body: JSON.stringify(data) }),
  updateLoyaltyReward: (id, data) => request(`/loyalty/rewards/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteLoyaltyReward: (id) => request(`/loyalty/rewards/${id}`, { method: 'DELETE' }),
  redeemLoyaltyReward: (data) => request('/loyalty/redeem', { method: 'POST', body: JSON.stringify(data) }),
};

export function setToken(token) {
  localStorage.setItem('salon_token', token);
}

export function clearToken() {
  localStorage.removeItem('salon_token');
  localStorage.removeItem('salon_timezone');
}

export function isLoggedIn() {
  return !!getToken();
}

export function setSalonTimezone(tz) {
  localStorage.setItem('salon_timezone', tz || 'Pacific/Auckland');
}

export function getSalonTimezone() {
  return localStorage.getItem('salon_timezone') || 'Pacific/Auckland';
}
