import { api } from './api'

// ---------- Públicos ----------

export async function fetchServices() {
  const { data } = await api.get('/services')
  return data
}

export async function fetchCoverageZones() {
  const { data } = await api.get('/coverage-zones')
  return data
}

export async function createServiceRequest(payload) {
  const { data } = await api.post('/service-requests', payload)
  return data
}

// ---------- Auth ----------

export async function login(email, password) {
  const { data } = await api.post('/auth/login', { email, password })
  return data
}

export async function fetchMe() {
  const { data } = await api.get('/auth/me')
  return data
}

// ---------- Admin: dashboard ----------

export async function fetchDashboard() {
  const { data } = await api.get('/admin/dashboard')
  return data
}

// ---------- Admin: solicitudes ----------

export async function fetchAdminRequests(params = {}) {
  const { data } = await api.get('/admin/service-requests', { params })
  return data
}

export async function fetchAdminRequestDetail(id) {
  const { data } = await api.get(`/admin/service-requests/${id}`)
  return data
}

export async function updateRequestStatus(id, status, note) {
  const { data } = await api.patch(`/admin/service-requests/${id}/status`, {
    status,
    note: note || null,
  })
  return data
}

export async function updateRequestFields(id, fields) {
  const { data } = await api.patch(`/admin/service-requests/${id}`, fields)
  return data
}

// ---------- Admin: servicios ----------

export async function fetchAdminServices() {
  const { data } = await api.get('/admin/services')
  return data
}
export async function createAdminService(payload) {
  const { data } = await api.post('/admin/services', payload)
  return data
}
export async function updateAdminService(id, payload) {
  const { data } = await api.put(`/admin/services/${id}`, payload)
  return data
}
export async function deleteAdminService(id) {
  await api.delete(`/admin/services/${id}`)
}

// ---------- Admin: zonas ----------

export async function fetchAdminZones() {
  const { data } = await api.get('/admin/coverage-zones')
  return data
}
export async function createAdminZone(payload) {
  const { data } = await api.post('/admin/coverage-zones', payload)
  return data
}
export async function updateAdminZone(id, payload) {
  const { data } = await api.put(`/admin/coverage-zones/${id}`, payload)
  return data
}
export async function deleteAdminZone(id) {
  await api.delete(`/admin/coverage-zones/${id}`)
}
