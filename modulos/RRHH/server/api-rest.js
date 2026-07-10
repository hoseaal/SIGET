import express from 'express'
import { connectDB } from './src/utils/database.js'
import cookieParser from 'cookie-parser'
import authRouter from './src/auth/auth.routes.js'
import metaRouter from './src/routes/meta.routes.js'
import userRoutes from './src/routes/user.routes.js'
import direccionRouter from './src/routes/direccion.routes.js'
import divisionRouter from './src/routes/division.routes.js'
import unidadRouter from './src/routes/unidad.routes.js'
import profesionRouter from './src/routes/profesion.routes.js'
import estatusRouter from './src/routes/estatus.routes.js'
import funcionarioRouter from './src/routes/funcionario.routes.js'
import cargoCetRouter from './src/routes/cargoCet.routes.js'
import deduccionRouter from './src/routes/deduccion.routes.js'
import cargoOnapreRouter from './src/routes/cargoOnapre.routes.js'
import primaRouter from './src/routes/prima.routes.js'
import primaProfRouter from './src/routes/primaProfesionalizacion.routes.js'
import nivelSalarialRouter from './src/routes/nivelSalarial.routes.js'
import nivelAntiguoRouter from './src/routes/nivelSalarialAntiguo.routes.js'
import antiguedadRouter from './src/routes/antiguedad.routes.js'
import antiguedadRegistroRouter from './src/routes/antiguedadRegistro.routes.js'
import sueldoPensionadoRouter from './src/routes/sueldoPensionado.routes.js'
import jubiladoRouter from './src/routes/jubilado.routes.js'
import pensionadoRouter from './src/routes/pensionado.routes.js'
import permisoRouter from './src/routes/permiso.routes.js'
import condicionLaboralRouter from './src/routes/condicionLaboral.routes.js'
import obreroRouter from './src/routes/obrero.routes.js'
import cargaFamiliarRouter from './src/routes/cargaFamiliar.routes.js'
import encargoTemporalRouter from './src/routes/encargoTemporal.routes.js'
import sobrevivienteRouter from './src/routes/sobreviviente.routes.js'
import nominaActivosRouter from './src/routes/nominaActivos.routes.js'
import nominaObreroRouter from './src/routes/nominaObrero.routes.js'
import nominaJubiladosRouter from './src/routes/nominaJubilados.routes.js'
import nominaPensionadosRouter from './src/routes/nominaPensionados.routes.js'
import nominaSobrevivientesRouter from './src/routes/nominaSobrevivientes.routes.js'
import porcentajesJerarquiasRouter from './src/routes/porcentajesJerarquias.routes.js'
import retroactivoRouter from './src/routes/retroactivo.routes.js'
import institucionRouter from './src/routes/institucion.routes.js'
import empleadoRouter from './src/routes/empleado.routes.js'

import historialSalarioRouter from './src/routes/historialSalario.routes.js'
import cajaAhorroRouter from './src/routes/cajaAhorro.routes.js'
import reportePagosRouter from './src/routes/reportePagos.routes.js'
import reporteIngresosRouter from './src/routes/reporteIngresos.routes.js'
import reportePrimasRouter from './src/routes/reportePrimas.routes.js'
import reporteResumenNominaRouter from './src/routes/reporteResumenNomina.routes.js'
import reportePadresRouter from './src/routes/reportePadres.routes.js'
import configuracionVacacionesRouter from './src/routes/configuracionVacaciones.routes.js'
import configuracionVacacionesObrerosRouter from './src/routes/configuracionVacacionesObreros.routes.js'
import vacacionesRouter from './src/routes/vacaciones.routes.js'
import dashboardRouter from './src/routes/dashboard.routes.js'

import festivosRouter from './src/routes/festivos.routes.js'
import nominaRouter from './src/routes/nomina.routes.js'
import constanciaRouter from './src/routes/constancia.routes.js'
import miPerfilRouter from './src/routes/miPerfil.routes.js'
import { VacacionesModel } from './src/models/vacaciones.model.js'
import { CajaAhorroModel } from './src/models/cajaAhorro.model.js'
import { HistorialSalarioModel } from './src/models/historialSalario.model.js'

import cors from 'cors'
import morgan from 'morgan'

const app = express()

app.use(express.json())
app.use(cookieParser())
app.use(morgan('dev'))

// Conectar DB
connectDB()
  .then(async () => {
    console.log('🟢 DB Conectada')
    try {
      await VacacionesModel.init()
      console.log('🟢 Tablas de Vacaciones inicializadas')
      await CajaAhorroModel.ensureTable()
      console.log('🟢 Tabla caja_ahorro inicializada')
      await HistorialSalarioModel.ensureTable()
      console.log('🟢 Tabla historial_pagos inicializada')
    } catch (err) {
      console.error('🔴 Error al inicializar tablas:', err.message)
    }
  })
  .catch(err => {
    console.error('🔴 Error DB:', err)
    process.exit(1)
  })

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({ message: 'API de Bienes Muebles' })
})

app.use(cors({
  credentials: true // permite el uso de cookies
}))

app.use('/api/rrhh/auth', authRouter)
app.use('/api/rrhh/meta', metaRouter)

app.use('/api/rrhh/user', userRoutes)

app.use('/api/rrhh/direcciones', direccionRouter)
app.use('/api/rrhh/divisiones', divisionRouter)
app.use('/api/rrhh/unidades', unidadRouter)
app.use('/api/rrhh/profesiones', profesionRouter)
app.use('/api/rrhh/estatus', estatusRouter)


app.use('/api/rrhh/funcionarios', funcionarioRouter)
app.use('/api/rrhh/pensionados', pensionadoRouter)


app.use('/api/rrhh/cargos-cet', cargoCetRouter)
app.use('/api/rrhh/deducciones', deduccionRouter)
app.use('/api/rrhh/cargos-onapre', cargoOnapreRouter)
app.use('/api/rrhh/primas', primaRouter)
app.use('/api/rrhh/primas-profesionalizacion', primaProfRouter)
app.use('/api/rrhh/niveles-salariales', nivelSalarialRouter)
app.use('/api/rrhh/niveles-salariales-antiguos', nivelAntiguoRouter)
app.use('/api/rrhh/antiguedad', antiguedadRouter)
app.use('/api/rrhh/condiciones-laborales', condicionLaboralRouter)

app.use('/api/rrhh/registros-antiguedad', antiguedadRegistroRouter)
app.use('/api/rrhh/sueldo-pensionado', sueldoPensionadoRouter)
app.use('/api/rrhh/jubilados', jubiladoRouter)
app.use('/api/rrhh/permisos', permisoRouter)


app.use('/api/rrhh/historial-salarios', historialSalarioRouter)
app.use('/api/rrhh/obreros', obreroRouter)
app.use('/api/rrhh/carga-familiar', cargaFamiliarRouter)
app.use('/api/rrhh/encargos-temporales', encargoTemporalRouter)
app.use('/api/rrhh/sobrevivientes', sobrevivienteRouter)
app.use('/api/rrhh/nomina', nominaRouter)
app.use('/api/rrhh/nomina-activos', nominaActivosRouter)
app.use('/api/rrhh/nomina-obreros', nominaObreroRouter)
app.use('/api/rrhh/nomina-jubilados', nominaJubiladosRouter)
app.use('/api/rrhh/nomina-pensionados', nominaPensionadosRouter)
app.use('/api/rrhh/nomina-sobrevivientes', nominaSobrevivientesRouter)
app.use('/api/rrhh/porcentajes-jerarquias', porcentajesJerarquiasRouter)
app.use('/api/rrhh/configuracion-vacaciones', configuracionVacacionesRouter)
app.use('/api/rrhh/configuracion-vacaciones-obreros', configuracionVacacionesObrerosRouter)
app.use('/api/rrhh/vacaciones', vacacionesRouter)
app.use('/api/rrhh/festivos', festivosRouter)
app.use('/api/rrhh/dashboard', dashboardRouter)
app.use('/api/rrhh/retroactivos', retroactivoRouter)
app.use('/api/rrhh/instituciones', institucionRouter)
app.use('/api/rrhh/empleados', empleadoRouter)
app.use('/api/rrhh/caja-ahorro', cajaAhorroRouter)
app.use('/api/rrhh/reporte-pagos', reportePagosRouter)
app.use('/api/rrhh/reporte-ingresos', reporteIngresosRouter)
app.use('/api/rrhh/reporte-primas', reportePrimasRouter)
app.use('/api/rrhh/resumen-nomina', reporteResumenNominaRouter)
app.use('/api/rrhh/reporte-padres', reportePadresRouter)
app.use('/api/rrhh/constancias', constanciaRouter)
app.use('/api/rrhh/mi-perfil', miPerfilRouter)


const PORT = 5002
app.listen(PORT, () => {
  console.log(`🚀 Servidor en http://localhost:${PORT}`)
})
