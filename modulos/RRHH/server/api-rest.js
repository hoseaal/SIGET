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
import cargoCetRouter from './src/routes/cargoCET.routes.js'
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

app.use('/api/auth', authRouter)
app.use('/api/meta', metaRouter)

app.use('/api/user', userRoutes)

app.use('/api/direcciones', direccionRouter)
app.use('/api/divisiones', divisionRouter)
app.use('/api/unidades', unidadRouter)
app.use('/api/profesiones', profesionRouter)
app.use('/api/estatus', estatusRouter)


app.use('/api/funcionarios', funcionarioRouter)
app.use('/api/pensionados', pensionadoRouter)


app.use('/api/cargos-cet', cargoCetRouter)
app.use('/api/deducciones', deduccionRouter)
app.use('/api/cargos-onapre', cargoOnapreRouter)
app.use('/api/primas', primaRouter)
app.use('/api/primas-profesionalizacion', primaProfRouter)
app.use('/api/niveles-salariales', nivelSalarialRouter)
app.use('/api/niveles-salariales-antiguos', nivelAntiguoRouter)
app.use('/api/antiguedad', antiguedadRouter)
app.use('/api/condiciones-laborales', condicionLaboralRouter)

app.use('/api/registros-antiguedad', antiguedadRegistroRouter)
app.use('/api/sueldo-pensionado', sueldoPensionadoRouter)
app.use('/api/jubilados', jubiladoRouter)
app.use('/api/permisos', permisoRouter)


app.use('/api/historial-salarios', historialSalarioRouter)
app.use('/api/obreros', obreroRouter)
app.use('/api/carga-familiar', cargaFamiliarRouter)
app.use('/api/encargos-temporales', encargoTemporalRouter)
app.use('/api/sobrevivientes', sobrevivienteRouter)
app.use('/api/nomina', nominaRouter)
app.use('/api/nomina-activos', nominaActivosRouter)
app.use('/api/nomina-obreros', nominaObreroRouter)
app.use('/api/nomina-jubilados', nominaJubiladosRouter)
app.use('/api/nomina-pensionados', nominaPensionadosRouter)
app.use('/api/nomina-sobrevivientes', nominaSobrevivientesRouter)
app.use('/api/porcentajes-jerarquias', porcentajesJerarquiasRouter)
app.use('/api/configuracion-vacaciones', configuracionVacacionesRouter)
app.use('/api/configuracion-vacaciones-obreros', configuracionVacacionesObrerosRouter)
app.use('/api/vacaciones', vacacionesRouter)
app.use('/api/festivos', festivosRouter)
app.use('/api/dashboard', dashboardRouter)
app.use('/api/retroactivos', retroactivoRouter)
app.use('/api/instituciones', institucionRouter)
app.use('/api/caja-ahorro', cajaAhorroRouter)
app.use('/api/reporte-pagos', reportePagosRouter)
app.use('/api/reporte-ingresos', reporteIngresosRouter)
app.use('/api/reporte-primas', reportePrimasRouter)
app.use('/api/resumen-nomina', reporteResumenNominaRouter)
app.use('/api/reporte-padres', reportePadresRouter)

const PORT = 5002
app.listen(PORT, () => {
  console.log(`🚀 Servidor en http://localhost:${PORT}`)
})
