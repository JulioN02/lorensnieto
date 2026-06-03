import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store'
import { Layout } from './components/Layout'
import { ProtectedRoute } from './components/ProtectedRoute'
import { LoginPage } from './pages/Login/LoginPage'
import { DashboardPage } from './pages/Dashboard/DashboardPage'
import { PropertiesPage } from './pages/Properties/PropertiesPage'
import { PropertyFormPage } from './pages/Properties/PropertyFormPage'
import { ServicesPage } from './pages/Services/ServicesPage'
import { ServiceFormPage } from './pages/Services/ServiceFormPage'
import { ReservationsPage } from './pages/Reservations/ReservationsPage'
import { ReservationDetailPage } from './pages/Reservations/ReservationDetailPage'
import { ReservationFormPage } from './pages/Reservations/ReservationFormPage'
import { InboxPage } from './pages/Inbox/InboxPage'
import { InboxDetailPage } from './pages/Inbox/InboxDetailPage'

function AppRoutes() {
  const checkAuth = useAuthStore((state) => state.checkAuth)

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/properties" element={<PropertiesPage />} />
        <Route path="/properties/new" element={<PropertyFormPage />} />
        <Route path="/properties/:id/edit" element={<PropertyFormPage />} />
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/services/new" element={<ServiceFormPage />} />
        <Route path="/services/:id/edit" element={<ServiceFormPage />} />
        <Route path="/reservations" element={<ReservationsPage />} />
        <Route path="/reservations/new" element={<ReservationFormPage />} />
        <Route path="/reservations/:id" element={<ReservationDetailPage />} />
        <Route path="/inbox" element={<InboxPage />} />
        <Route path="/inbox/:id" element={<InboxDetailPage />} />
        <Route index element={<Navigate to="/dashboard" replace />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  )
}
