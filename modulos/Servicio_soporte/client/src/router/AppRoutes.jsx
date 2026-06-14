import { Route, Routes, Navigate } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoutes";
import { LoginPage } from "../pages/authentication/LoginPage";

import { DashboardPage } from "../pages/DashboardPage";
import { ConfiguracionPage } from "../pages/configuracion/ConfiguracionPage";
import { RedesPage } from "../pages/infraestructura/redes/RedesPage";
import { ControlRedPage } from "../pages/infraestructura/redes/ControlRedPage";
import { EquiposPage } from "../pages/equipos/EquiposPage";
import { TransferenciasPage } from "../pages/transferencias/TransferenciasPage";
import { TransferenciaTecnicoPage } from "../pages/transferencias/TransferenciaTecnicoPage";
import { UsuariosPage } from "../pages/usuarios/UsuariosPage";
import { MantenimientosPage } from "../pages/mantenimientos/MantenimientosPage";
import { ActividadesPage } from "../pages/actividades/ActividadesPage";
import { menuPermissions } from "../data/dataPermissions";

const AppRoutes = () => {
    return (
        <Routes>

            <Route path="/" element={<Navigate to="/Login" replace />} />

            <Route path="/Login" element={<LoginPage />} />

            <Route path="/Dashboard" element={
                <ProtectedRoute allowedRoles={menuPermissions["/Dashboard"]}>
                    <DashboardPage />
                </ProtectedRoute>
            } />

            <Route path="/Configuracion/Maestros" element={
                <ProtectedRoute allowedRoles={menuPermissions["/Configuracion/Maestros"]}>
                    <ConfiguracionPage />
                </ProtectedRoute>
            } />

            <Route path="/Infraestructura/Red" element={
                <ProtectedRoute allowedRoles={menuPermissions["/Infraestructura/Red"]}>
                    <RedesPage />
                </ProtectedRoute>
            } />

            <Route path="/Infraestructura/ControlRed" element={
                <ProtectedRoute allowedRoles={menuPermissions["/Infraestructura/ControlRed"]}>
                    <ControlRedPage />
                </ProtectedRoute>
            } />

            <Route path="/Equipos" element={
                <ProtectedRoute allowedRoles={menuPermissions["/Equipos"]}>
                    <EquiposPage />
                </ProtectedRoute>
            } />

            <Route path="/Transferencias" element={
                <ProtectedRoute allowedRoles={menuPermissions["/Transferencias"]}>
                    <TransferenciasPage />
                </ProtectedRoute>
            } />

            <Route path="/Transferencias/Tecnico" element={
                <ProtectedRoute allowedRoles={menuPermissions["/Transferencias/Tecnico"]}>
                    <TransferenciaTecnicoPage />
                </ProtectedRoute>
            } />

            <Route path="/Seguridad/Usuarios" element={
                <ProtectedRoute allowedRoles={menuPermissions["/Seguridad/Usuarios"]}>
                    <UsuariosPage />
                </ProtectedRoute>
            } />

            <Route path="/Mantenimientos" element={
                <ProtectedRoute allowedRoles={menuPermissions["/Mantenimientos"]}>
                    <MantenimientosPage />
                </ProtectedRoute>
            } />

            <Route path="/Mantenimientos/Gestion" element={
                <ProtectedRoute allowedRoles={menuPermissions["/Mantenimientos/Gestion"]}>
                    <MantenimientosPage isTechnicalDashboard={true} />
                </ProtectedRoute>
            } />

            <Route path="/Actividades" element={
                <ProtectedRoute allowedRoles={menuPermissions["/Actividades"]}>
                    <ActividadesPage />
                </ProtectedRoute>
            } />

        </Routes>
    )
}
export default AppRoutes;