import express from 'express'
import cors from 'cors'
import UserRepository from './user-repository.js'

const router = express.Router()
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

router.post('/register', async (req, res) => {
  try {
    console.log(req.body)
    const user = await UserRepository.create(req.body)
    res.status(201).json(user)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

app.post('/logout', (req, res) => {})

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor Node.js corriendo en http://localhost:${PORT}`)
})

app.get('/api', (req, res) => {
  res.json({ message: '¡Backend conectado con React!' })
})

export default router
