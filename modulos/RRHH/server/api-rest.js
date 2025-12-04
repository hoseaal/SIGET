import express from 'express'
import { connectDB } from './src/utils/database.js'
import cookieParser from 'cookie-parser'
import authRouter from './src/auth/auth.routes.js'
import userRoutes from './src/routes/user.routes.js'
import direccionRouter from './src/routes/direccion.routes.js'
import divisionRouter from './src/routes/division.routes.js'
import unidadRouter from './src/routes/unidad.routes.js'
import profesionRouter from './src/routes/profesion.routes.js'
import estatusRouter from './src/routes/estatus.routes.js'
import funcionarioRouter from './src/routes/funcionario.routes.js'
import cargoCetRouter from './src/routes/cargoCET.routes.js'
import cors from 'cors'
import morgan from 'morgan'

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

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({ message: 'API de Bienes Muebles' })
})

app.use(cors({
  credentials: true // permite el uso de cookies
}))

app.use('/api/auth', authRouter)

app.use('/api/user', userRoutes)

app.use('/api/direcciones', direccionRouter)
app.use('/api/divisiones', divisionRouter)
app.use('/api/unidades', unidadRouter)
app.use('/api/profesiones', profesionRouter)
app.use('/api/estatus', estatusRouter)


app.use('/api/funcionarios', funcionarioRouter)


app.use('/api/cargos-cet', cargoCetRouter)

const PORT = 5002
app.listen(PORT, () => {
  console.log(`🚀 Servidor en http://localhost:${PORT}`)
})
