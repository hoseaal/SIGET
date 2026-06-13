import { Route, Routes, Navigate } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoutes";
import { LoginPage } from "../pages/authentication/LoginPage";
import { RegisterPage } from "../pages/authentication/RegisterPage";

import { RegistrarFuncionario } from "../pages/empleados/FuncionariosActivos/RegistrarFuncionario.jsx";
import { FuncionariosActivos } from "../pages/empleados/FuncionariosActivos/FuncionariosActivos.jsx";
import { Jubilados } from "../pages/empleados/Jubilados/Jubilados.jsx";
import { Pensionados } from "../pages/empleados/Pensionados/Pensionados.jsx";
import { Sobrevivientes } from "../pages/empleados/Sobrevivientes/Sobrevivientes.jsx";

import { Reportes } from "../pages/Reportes/Reportes"
import { ObrerosFijos } from "../pages/empleados/ObrerosFijos/ObrerosFijos.jsx";
import { NominaActivos } from "../pages/nomina/NominaActivos.jsx";
import { NominaObreros } from "../pages/nomina/NominaObreros.jsx";
import { NominaJubilados } from "../pages/nomina/NominaJubilados.jsx";
import { NominaPensionados } from "../pages/nomina/NominaPensionados.jsx";
import { NominaSobrevivientes } from "../pages/nomina/NominaSobrevivientes.jsx";

import { Prestamos } from "../pages/prestamos/prestamos";
import { Almacen } from "../pages/prestamos/almacen.jsx"

import { ClasificacionyCargos } from "../pages/configuracion/ClasificacionyCargos";
import { TablaSalarios } from "../pages/configuracion/tablaSalarios"
import { EstructuraOrganizacional } from "../pages/configuracion/EstructuraOrganizacional.jsx";
import { VacacionesConfig } from "../pages/configuracion/vacaciones.jsx";
import { VacacionesGestion } from "../pages/Vacaciones/VacacionesGestion.jsx";
import { Bitacora } from "../pages/configuracion/bitacora.jsx";

import { DashboardPage } from "../pages/DashboardPage";

import { Usuarios } from "../pages/configuracion/usuarios"
import { CatalogoInstituticiones } from "../pages/configuracion/CatalogoInstituticiones.jsx"

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

            <Route path="/Configuracion/Cargos" element={
                <ProtectedRoute>
                    <ClasificacionyCargos />
                </ProtectedRoute>
            } />

            <Route path="/Configuracion/TablaSalarios" element={
                <ProtectedRoute>
                    <TablaSalarios />
                </ProtectedRoute>
            } />

            <Route path="/Configuracion/EstructuraOrganizacional" element={
                <ProtectedRoute>
                    <EstructuraOrganizacional />
                </ProtectedRoute>
            } />

            <Route path="/Configuracion/Instituciones" element={
                <ProtectedRoute>
                    <CatalogoInstituticiones />
                </ProtectedRoute>
            } />

            <Route path="/Configuracion/Vacaciones" element={
                <ProtectedRoute>
                    <VacacionesConfig />
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

            <Route path="/Personal/ObrerosFijos" element={
                <ProtectedRoute>
                    <ObrerosFijos />
                </ProtectedRoute>
            } />

            <Route path="/Personal/Vacaciones/Funcionarios" element={
                <ProtectedRoute>
                    <VacacionesGestion tipoEmpleado="funcionario" />
                </ProtectedRoute>
            } />

            <Route path="/Personal/Vacaciones/Obreros" element={
                <ProtectedRoute>
                    <VacacionesGestion tipoEmpleado="obrero" />
                </ProtectedRoute>
            } />

            <Route path="/Personal/Jubilados" element={
                <ProtectedRoute>
                    <Jubilados />
                </ProtectedRoute>
            } />

            <Route path="/Personal/Pensionados" element={
                <ProtectedRoute>
                    <Pensionados />
                </ProtectedRoute>
            } />

            <Route path="/Personal/Sobrevivientes" element={
                <ProtectedRoute>
                    <Sobrevivientes />
                </ProtectedRoute>
            } />


            <Route path="/Nomina/FuncionariosActivos" element={
                <ProtectedRoute>
                    <NominaActivos />
                </ProtectedRoute>
            } />

            <Route path="/Nomina/ObrerosFijos" element={
                <ProtectedRoute>
                    <NominaObreros />
                </ProtectedRoute>
            } />

            <Route path="/Nomina/Jubilados" element={
                <ProtectedRoute>
                    <NominaJubilados />
                </ProtectedRoute>
            } />

            <Route path="/Nomina/Pensionados" element={
                <ProtectedRoute>
                    <NominaPensionados />
                </ProtectedRoute>
            } />

            <Route path="/Nomina/Sobrevivientes" element={
                <ProtectedRoute>
                    <NominaSobrevivientes />
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
