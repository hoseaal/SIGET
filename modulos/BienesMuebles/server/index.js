import express from 'express'
import cors from 'cors'
import UserRepository from './user-repository.js'

const router = express.Router()
const app = express()
const PORT = 5000

const corsOptions = {
  origin: 'http://localhost:5173'
}
// Middlewares
app.use(cors(corsOptions))
app.use(express.json())

// Ruta de prueba
app.get('/api', (req, res) => {
  res.json({ message: '¡Backend conectado con React! Contraloria uwu' })
})

app.post('/protected', (req, res) => {})

app.post('/api/register', async (req, res) => {
  try {
    console.log('Body recibido:', req.body)
    if (!req.body.ci || !req.body.password) {
      return res.status(400).json({ error: 'CI y password son requeridos' })
    }

    const user = await UserRepository.create({
      ci: req.body.ci,
      password: req.body.password
    })

    res.status(201).json(user)
  } catch (error) {
    console.error('Error en registro:', error)
    res.status(400).json({ error: error.message })
  }
})

app.post('/logout', (req, res) => {})

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor Node.js corriendo en http://localhost:${PORT}`)
})

export default router
