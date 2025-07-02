import express from 'express'
import { connectDB } from './src/utils/database.js'
import cookieParser from 'cookie-parser'
import authRouter from './src/auth/auth.routes.js'
import categoriaRouter from './src/routes/categoria.routes.js'
import subcategoriaRouter from './src/routes/subcategoria.routes.js'
import categoriaEspecificaRouter from './src/routes/categoriaEspecifica.routes.js'
import marcaRouter from './src/routes/marca.routes.js'
import modeloRouter from './src/routes/modelo.routes.js'
import bienMuebleRouter from './src/routes/bienMueble.routes.js'
import departamentoRouter from './src/routes/departamento.routes.js'
import formaAdquisicionRouter from './src/routes/formaAdquisicion.routes.js'
import estadoUsoRouter from './src/routes/estadoUso.routes.js'
import conceptoMovimientoRouter from './src/routes/conceptoMovimiento.routes.js'
import condicionFisicaRouter from './src/routes/condicionFisica.routes.js'
import prestamoRouter from './src/routes/prestamo.routes.js'
import metaRouter from './src/routes/meta.routes.js'
import reporteBM4Routes from './src/routes/reporte.routes.js'
import pdfRouter from './src/routes/pdf.routes.js'
import excelRoutes from './src/routes/excel.routes.js'
import userRoutes from './src/routes/user.routes.js'
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
  origin: 'http://localhost:5173',
  credentials: true // permite el uso de cookies
}))

app.use('/api/auth', authRouter)

app.use('/api/categorias', categoriaRouter)
app.use('/api/subcategorias', subcategoriaRouter)
app.use('/api/categorias-especificas', categoriaEspecificaRouter)
app.use('/api/marcas', marcaRouter)
app.use('/api/modelos', modeloRouter)
app.use('/api/departamentos', departamentoRouter)
app.use('/api/formas-adquisicion', formaAdquisicionRouter)
app.use('/api/estados-uso', estadoUsoRouter)
app.use('/api/condiciones-fisicas', condicionFisicaRouter)
app.use('/api/conceptos-movimiento', conceptoMovimientoRouter)

app.use('/api/reporteBM4', reporteBM4Routes)

app.use('/api/bienes', bienMuebleRouter)

app.use('/api/prestamos', prestamoRouter)

app.use('/api/meta', metaRouter)

app.use('/api/pdf', pdfRouter)

app.use('/api/excel', excelRoutes)

app.use('/api/user', userRoutes)

const PORT = 5001
app.listen(PORT, () => {
  console.log(`🚀 Servidor en http://localhost:${PORT}`)
})
