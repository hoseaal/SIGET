import express from 'express'
import { connectDB } from './src/utils/database.js'
import cors from 'cors'
import morgan from 'morgan'

import equipoRouter from './src/routes/equipo.routes.js'
import direccionRouter from './src/routes/direccion.routes.js'

const app = express()

app.use(express.json())
app.use(morgan('dev'))

// Conectar DB
connectDB()
  .then(() => console.log('🟢 DB Conectada'))
  .catch(err => {
    console.error('🔴 Error DB:', err)
    process.exit(1)
  })

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({ message: 'API de Soporte (control_informatica)' })
})

app.use(cors({
  credentials: true
}))

// Rutas
app.use('/api/equipos', equipoRouter)
app.use('/api/direcciones', direccionRouter)

const PORT = process.env.PORT || 5003
app.listen(PORT, () => {
  console.log(`🚀 Servidor en http://localhost:${PORT}`)
})
