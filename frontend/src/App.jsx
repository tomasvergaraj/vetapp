import { Link, Route, Routes } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import RequestServicePage from './pages/RequestServicePage'
import RequestConfirmationPage from './pages/RequestConfirmationPage'
import AdminLoginPage from './pages/admin/AdminLoginPage'
import AdminLayout, { RequireAuth } from './pages/admin/AdminLayout'
import AdminDashboardPage from './pages/admin/AdminDashboardPage'
import AdminRequestsListPage from './pages/admin/AdminRequestsListPage'
import AdminRequestDetailPage from './pages/admin/AdminRequestDetailPage'
import AdminServicesPage from './pages/admin/AdminServicesPage'
import AdminZonesPage from './pages/admin/AdminZonesPage'

export default function App() {
  return (
    <Routes>
      {/* Públicas */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/solicitar" element={<RequestServicePage />} />
      <Route path="/solicitar/confirmacion" element={<RequestConfirmationPage />} />

      {/* Login admin */}
      <Route path="/admin/login" element={<AdminLoginPage />} />

      {/* Panel admin protegido */}
      <Route
        path="/admin"
        element={
          <RequireAuth>
            <AdminLayout />
          </RequireAuth>
        }
      >
        <Route index element={<AdminDashboardPage />} />
        <Route path="solicitudes" element={<AdminRequestsListPage />} />
        <Route path="solicitudes/:id" element={<AdminRequestDetailPage />} />
        <Route path="servicios" element={<AdminServicesPage />} />
        <Route path="zonas" element={<AdminZonesPage />} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-canvas px-6 text-center">
      <span className="text-[11px] uppercase tracking-[0.25em] text-brand-700 font-medium">
        404
      </span>
      <h1 className="mt-3 font-display text-4xl font-semibold text-ink">
        Página no encontrada
      </h1>
      <p className="mt-3 max-w-md text-ink-muted">
        La página que buscas no existe o fue movida.
      </p>
      <Link to="/" className="btn-primary mt-8">
        Volver al inicio
      </Link>
    </div>
  )
}
