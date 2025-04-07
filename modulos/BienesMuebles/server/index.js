import express from 'express'
import cors from 'cors'
import pool from './conn'

const app = express()
const PORT = 5000

// Middlewares
app.use(cors())
app.use(express.json())

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({ message: '¡Backend conectado con React! Contraloria uwu' })
})

app.post('/login', (req, res) => {
  pool
})

app.post('/protected', (req, res) => {})

app.post('/logout', (req, res) => {})

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor Node.js corriendo en http://localhost:${PORT}`)
})
