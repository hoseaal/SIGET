import { Route, Routes, Navigate } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoutes";
import { LoginPage } from "../pages/authentication/LoginPage";
import { RegisterPage } from "../pages/authentication/RegisterPage";

import { RegistrarFuncionario } from "../pages/formularios/RegistrarFuncionario.jsx";
import { FuncionariosActivos } from "../pages/formularios/FuncionariosActivos.jsx";

import { Reportes } from "../pages/formularios/reportes"

import { Prestamos } from "../pages/prestamos/prestamos";
import { Almacen } from "../pages/prestamos/almacen.jsx"

import { Categorias } from "../pages/configuracion/categorias";
import { ModelosyMarcas } from "../pages/configuracion/modelosymarcas"
import { ConceptoMovimiento } from "../pages/configuracion/conceptoMovimiento.jsx";
import { Bitacora } from "../pages/configuracion/bitacora.jsx";

import { DashboardPage } from "../pages/DashboardPage";

import { Usuarios } from "../pages/configuracion/usuarios"

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

            <Route path="/Configuracion/ConceptoMovimiento" element={
                <ProtectedRoute>
                    <ConceptoMovimiento/>
                </ProtectedRoute>
            } />

            <Route path="/Configuracion/Bitacora" element={
                <ProtectedRoute>
                    <Bitacora />
                </ProtectedRoute>
            } />

            <Route path="/Configuracion/Usuarios" element={
                <ProtectedRoute>
                    <Usuarios />
                </ProtectedRoute>
            } />

            <Route path="/Personal/RegistrarFuncionario" element={
                <ProtectedRoute>
                    <RegistrarFuncionario />
                </ProtectedRoute>
            } />

            <Route path="/Personal/FuncionariosActivos" element={
                <ProtectedRoute>
                    <FuncionariosActivos />
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