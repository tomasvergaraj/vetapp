import axios from 'axios'

const baseURL = import.meta.env.VITE_API_BASE_URL || '/api'

export const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
})

// ---------- Manejo del token en memoria + sessionStorage ----------
// Usamos sessionStorage para que el token se pierda al cerrar la pestaña.
// Es una decisión de seguridad: minimiza ventana de ataque XSS.
const TOKEN_KEY = 'vetapp_token'

export function getToken() {
  return sessionStorage.getItem(TOKEN_KEY)
}
export function setToken(token) {
  if (token) sessionStorage.setItem(TOKEN_KEY, token)
  else sessionStorage.removeItem(TOKEN_KEY)
}
export function clearToken() {
  sessionStorage.removeItem(TOKEN_KEY)
}

// ---------- Interceptores ----------
api.interceptors.request.use((config) => {
  const token = getToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Listener de logout: cuando el backend devuelve 401 y había token,
// emitimos un evento para que la app limpie estado y redirija.
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401 && getToken()) {
      clearToken()
      window.dispatchEvent(new CustomEvent('vetapp:unauthorized'))
    }
    return Promise.reject(error)
  }
)

// ---------- Helpers para extraer mensajes de error ----------
export function getErrorMessage(error, fallback = 'Ocurrió un error inesperado.') {
  const detail = error?.response?.data?.detail
  if (typeof detail === 'string') return detail
  if (detail && typeof detail === 'object' && detail.message) return detail.message
  if (Array.isArray(detail) && detail[0]?.msg) return detail[0].msg
  return fallback
}
