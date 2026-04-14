import { Route, Routes, Navigate } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoutes";
import { LoginPage } from "../pages/authentication/LoginPage";

import { DashboardPage } from "../pages/DashboardPage";
import { ConfiguracionPage } from "../pages/configuracion/ConfiguracionPage";

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

        </Routes>
    )
}
export default AppRoutes;