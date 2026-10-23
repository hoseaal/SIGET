import express from 'express'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import morgan from 'morgan'
import path from 'path'
import { fileURLToPath } from 'url'
import 'dotenv/config'

import { connectDB } from './src/utils/database.js'
import authRouter from './src/auth/auth.routes.js'
import departamentoRouter from './src/routes/departamento.routes.js'
import clasificacionRouter from './src/routes/clasificacion.routes.js'
import tipoActividadRouter from './src/routes/tipoActividad.routes.js'
import bienesRouter from './src/routes/bienes.routes.js'
import actividadRouter from './src/routes/actividad.routes.js'
import usuarioRouter from './src/routes/usuario.routes.js'
import excelRouter from './src/routes/excel.routes.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()

app.use(express.json())
app.use(cookieParser())
app.use(morgan('dev'))
app.use(cors({ origin: true, credentials: true }))

connectDB()
  .then(() => console.log('🟢 DB Conectada'))
  .catch(err => {
    console.error('🔴 Error DB:', err)
    process.exit(1)
  })

app.get('/', (req, res) => {
  res.json({ message: 'API de Soporte Tecnico - SIGET' })
})

app.use('/api/soporte/auth', authRouter)
app.use('/api/soporte/departamentos', departamentoRouter)
app.use('/api/soporte/clasificaciones', clasificacionRouter)
app.use('/api/soporte/tipos-actividad', tipoActividadRouter)
app.use('/api/soporte/bienes', bienesRouter)
app.use('/api/soporte/actividades', actividadRouter)
app.use('/api/soporte/usuarios', usuarioRouter)
app.use('/api/soporte/reportes', excelRouter)

app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')))

const PORT = process.env.PORT || 5004
app.listen(PORT, () => {
  console.log(`🚀 Servidor en http://localhost:${PORT}`)
})
