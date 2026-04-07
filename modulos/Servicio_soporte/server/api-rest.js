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

const app = express()

app.use(express.json())


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

app.use('/api/descripciones', descripcionesRouter)
app.use('/api/tipo_act', tipo_actRouter)
app.use('/api/tipo_componente', tipo_componente)
app.use('/api/tipo_toner', tipo_toner)
app.use('/api/tipo_equipo', tipo_equipo)
app.use('/api/marca', marca)
app.use('/api/modelo', modelo)
app.use('/api/panel_soport', panel_soport)


const PORT = 5002
app.listen(PORT, () => {
  console.log(`🚀 Servidor en http://localhost:${PORT}`)
})
