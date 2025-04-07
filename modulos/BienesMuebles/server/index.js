import express from 'express'
import cors from 'cors'

const app = express()
const PORT = 5000

// Middlewares
app.use(cors())
app.use(express.json())

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({ message: '¡Backend conectado con React! Contraloria uwu' })
})

app.post('/protected', (req, res) => {})

app.post('/logout', (req, res) => {})

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor Node.js corriendo en http://localhost:${PORT}`)
})

app.get('/api', (req, res) => {
  res.json({ message: '¡Backend conectado con React!' })
})
