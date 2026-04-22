import express from 'express'
import { connectDB } from './src/utils/database.js'
import cors from 'cors'
import morgan from 'morgan'
import descripcionesRouter from './src/routes/descripciones.route.js'
import tipo_actRouter from './src/routes/tipo_act.route.js'
import tipo_componente from './src/routes/tipo_componente.route.js'
import tipo_toner from './src/routes/tipo_toner.route.js'
import tipo_equipo from './src/routes/tipo_equipo.route.js'
import marca from './src/routes/marca.route.js'
import modelo from './src/routes/modelo.route.js'
import panel_soport from './src/routes/panel_soport.route.js'
import piso from './src/routes/piso.route.js'
import puertos_panel_s from './src/routes/puertos_panel_s.route.js'
import puertos from './src/routes/puertos.route.js'
import panel_pared from './src/routes/panel_pared.route.js'
import departamento from './src/routes/departamento.route.js'
import equipo from './src/routes/equipo.route.js'
import userRoutes from './src/routes/user.routes.js'
import auth from './src/auth/auth.routes.js'
import actividades from './src/routes/actividades.route.js'
import status from './src/routes/status.route.js'
import transferencia from './src/routes/transferencia.route.js'

import cookieParser from 'cookie-parser';
const app = express()

app.use(express.json())
app.use(cookieParser())
app.use(morgan('dev'))

// Conectar DB
connectDB()
  .then(() => console.log('🟢 DB Conectada'))
  .catch(err => {
    console.error('🔴 Error DB:', err)
    process.exit(1)
  })


app.use(cors({
  credentials: true // permite el uso de cookies
}))

app.use('/api/user', userRoutes)
app.use('/api/auth', auth)
app.use('/api/descripciones', descripcionesRouter)
app.use('/api/tipo_act', tipo_actRouter)
app.use('/api/tipo_componente', tipo_componente)
app.use('/api/tipo_toner', tipo_toner)
app.use('/api/tipo_equipo', tipo_equipo)
app.use('/api/marca', marca)
app.use('/api/modelo', modelo)
app.use('/api/panel_soport', panel_soport)
app.use('/api/piso', piso)
app.use('/api/puertos_panel_s', puertos_panel_s)
app.use('/api/puertos', puertos)
app.use('/api/panel_pared', panel_pared)
app.use('/api/departamento', departamento)
app.use('/api/equipo', equipo)
app.use('/api/actividades', actividades)
app.use('/api/status', status)
app.use('/api/transferencia', transferencia)

const PORT = 5002
app.listen(PORT, () => {
  console.log(`🚀 Servidor en http://localhost:${PORT}`)
})
