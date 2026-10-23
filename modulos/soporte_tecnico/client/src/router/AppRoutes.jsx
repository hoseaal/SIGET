import { Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from './ProtectedRoutes.jsx'
import DashboardLayout from '../layouts/DashboardLayout.jsx'
import LoginPage from '../pages/authentication/LoginPage.jsx'
import DashboardPage from '../pages/dashboard/DashboardPage.jsx'
import ActividadesPage from '../pages/actividades/ActividadesPage.jsx'
import BienesPage from '../pages/bienes/BienesPage.jsx'
import TiposActividadPage from '../pages/catalogos/TiposActividadPage.jsx'
import UsuariosPage from '../pages/usuarios/UsuariosPage.jsx'

export default function AppRoutes () {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="actividades" element={<ActividadesPage />} />
        <Route path="bienes" element={<BienesPage />} />
        <Route path="equipos" element={<Navigate to="/bienes" replace />} />
        <Route path="catalogos" element={<TiposActividadPage />} />
        <Route
          path="usuarios"
          element={
            <ProtectedRoute allowedRoles={['Administrador']}>
              <UsuariosPage />
            </ProtectedRoute>
          }
        />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
