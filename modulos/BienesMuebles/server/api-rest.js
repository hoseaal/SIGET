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
import metaRouter from './src/routes/meta.routes.js'
import pdfRouter from './src/routes/pdf.routes.js'

const app = express()

app.use(express.json())
app.use(cookieParser())

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

app.use('/api/auth', authRouter)

app.use('/api/categorias', categoriaRouter)
app.use('/api/subcategorias', subcategoriaRouter)
app.use('/api/categorias-especificas', categoriaEspecificaRouter)
app.use('/api/marcas', marcaRouter)
app.use('/api/modelos', modeloRouter)

app.use('/api/bienes', bienMuebleRouter)

app.use('/api/meta', metaRouter)

app.use('/api/pdf', pdfRouter)
const PORT = 5001
app.listen(PORT, () => {
  console.log(`🚀 Servidor en http://localhost:${PORT}`)
})
