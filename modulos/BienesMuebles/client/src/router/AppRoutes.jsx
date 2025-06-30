import { Route, Routes, Navigate } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoutes";
import { LoginPage } from "../pages/authentication/LoginPage";
import { RegisterPage } from "../pages/authentication/RegisterPage";

import { Bm2 } from "../pages/formularios/BM-2";
import { Bm1 } from "../pages/formularios/BM-1";
import { Bm3 } from "../pages/formularios/BM-3";
import { Bm4 } from "../pages/formularios/BM-4";

import { Reportes } from "../pages/formularios/reportes"

import { Prestamos } from "../pages/prestamos/prestamos";
import { Almacen } from "../pages/prestamos/almacen.jsx"

import { Categorias } from "../pages/configuracion/categorias";
import { ModelosyMarcas } from "../pages/configuracion/modelosymarcas"
import { Bitacora } from "../pages/configuracion/bitacora.jsx";

import { DashboardPage } from "../pages/DashboardPage";

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

            <Route path="/Configuracion/Categorias" element={
                <ProtectedRoute>
                    <Categorias/>
                </ProtectedRoute>
            } />

            <Route path="/Configuracion/ModelosyMarcas" element={
                <ProtectedRoute>
                    <ModelosyMarcas/>
                </ProtectedRoute>
            } />

            <Route path="/Configuracion/Bitacora" element={
                <ProtectedRoute>
                    <Bitacora />
                </ProtectedRoute>
            } />

            <Route path="/BM/BM-2" element={
                <ProtectedRoute>
                    <Bm2 />
                </ProtectedRoute>
            } />

            <Route path="/BM/BM-1" element={
                <ProtectedRoute>
                    <Bm1 />
                </ProtectedRoute>
            } />

            <Route path="/BM/BM-3" element={
                <ProtectedRoute>
                    <Bm3 />
                </ProtectedRoute>
            } />

            <Route path="/BM/BM-4" element={
                <ProtectedRoute>
                    <Bm4 />
                </ProtectedRoute>
            } />

            <Route path="/Reportes" element={
                <ProtectedRoute>
                    <Reportes />
                </ProtectedRoute>
            } />

            <Route path="/Prestamos" element={
                <ProtectedRoute>
                    <Prestamos />
                </ProtectedRoute>
            } />

            <Route path="/Almacen" element={
                <ProtectedRoute>
                    <Almacen />
                </ProtectedRoute>
            } />

            <Route path="/Configuracion/NuevoUsuario" element={<RegisterPage />} />


            <Route path="/Login" element={<LoginPage />} />

        </Routes>
    )
}
export default AppRoutes;