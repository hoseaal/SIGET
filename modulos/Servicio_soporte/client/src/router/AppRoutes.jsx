import { Route, Routes, Navigate } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoutes";
import { LoginPage } from "../pages/authentication/LoginPage";

import { DashboardPage } from "../pages/DashboardPage";
import { ConfiguracionPage } from "../pages/configuracion/ConfiguracionPage";
import { RedesPage } from "../pages/infraestructura/redes/RedesPage";
import { EquiposPage } from "../pages/equipos/EquiposPage";
import { TransferenciasPage } from "../pages/transferencias/TransferenciasPage";
import { TransferenciaTecnicoPage } from "../pages/transferencias/TransferenciaTecnicoPage";
import { UsuariosPage } from "../pages/usuarios/UsuariosPage";

const AppRoutes = () => {
    return (
        <Routes>

            <Route path="/" element={<Navigate to="/Login" replace />} />

            <Route path="/Login" element={<LoginPage />} />

            <Route path="/Dashboard" element={
                <ProtectedRoute>
                    <DashboardPage />
                </ProtectedRoute>
            } />

            <Route path="/Configuracion/Maestros" element={
                <ProtectedRoute>
                    <ConfiguracionPage />
                </ProtectedRoute>
            } />

            <Route path="/Infraestructura/Red" element={
                <ProtectedRoute>
                    <RedesPage />
                </ProtectedRoute>
            } />

            <Route path="/Equipos" element={
                <ProtectedRoute>
                    <EquiposPage />
                </ProtectedRoute>
            } />

            <Route path="/Transferencias" element={
                <ProtectedRoute>
                    <TransferenciasPage />
                </ProtectedRoute>
            } />

            <Route path="/Transferencias/Tecnico" element={
                <ProtectedRoute>
                    <TransferenciaTecnicoPage />
                </ProtectedRoute>
            } />

            <Route path="/Seguridad/Usuarios" element={
                <ProtectedRoute>
                    <UsuariosPage />
                </ProtectedRoute>
            } />

        </Routes>
    )
}
export default AppRoutes;