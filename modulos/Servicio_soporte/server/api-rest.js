import express from 'express'
import { connectDB } from './src/utils/database.js'
import cors from 'cors'
import morgan from 'morgan'
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
import mantenimiento from './src/routes/mantenimiento.route.js'
import dashboard from './src/routes/dashboard.route.js'
import croquis from './src/routes/croquis.route.js'
import puntos_red_posicion from './src/routes/puntos_red_posicion.route.js'
import path from 'path'
import { fileURLToPath } from 'url'

import cookieParser from 'cookie-parser';

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const app = express()

app.use(express.json())
app.use(cookieParser())
app.use(morgan('dev'))

// Conectar DB
connectDB()
  .then(() => console.log('🟢 DB Conectada'))
  .catch(err => {
    console.error('🔴 Error DB:', err)
  })


app.use(cors({
  credentials: true // permite el uso de cookies
}))

app.use('/api/sp/user', userRoutes)
app.use('/api/sp/auth', auth)
app.use('/api/sp/tipo_act', tipo_actRouter)
app.use('/api/sp/tipo_componente', tipo_componente)
app.use('/api/sp/tipo_toner', tipo_toner)
app.use('/api/sp/tipo_equipo', tipo_equipo)
app.use('/api/sp/marca', marca)
app.use('/api/sp/modelo', modelo)
app.use('/api/sp/panel_soport', panel_soport)
app.use('/api/sp/piso', piso)
app.use('/api/sp/puertos_panel_s', puertos_panel_s)
app.use('/api/sp/puertos', puertos)
app.use('/api/sp/panel_pared', panel_pared)
app.use('/api/sp/departamento', departamento)
app.use('/api/sp/equipo', equipo)
app.use('/api/sp/actividades', actividades)
app.use('/api/sp/status', status)
app.use('/api/sp/transferencia', transferencia)
app.use('/api/sp/mantenimiento', mantenimiento)
app.use('/api/sp/dashboard', dashboard)
app.use('/api/sp/croquis', croquis)
app.use('/api/sp/puntos_red_posicion', puntos_red_posicion)
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')))

const PORT = 5003
app.listen(PORT, () => {
  console.log(`🚀 Servidor en http://localhost:${PORT}`)
})
