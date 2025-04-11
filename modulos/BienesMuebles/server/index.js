import express from 'express'
import cors from 'cors'
import jwt from 'jsonwebtoken'
import cookieParser from 'cookie-parser'
import config from './config.js'
import { UserRepository } from './user-repository.js'
import authenticate from './authenticate.js'

const router = express.Router()
const app = express()
const PORT = 5000

const corsOptions = {
  origin: 'http://localhost:5173', // Ajusta a tu URL de frontend
  credentials: true, // ¡Permitir cookies!
  methods: ['GET', 'POST', 'PUT', 'DELETE']
}
// Middlewares
app.use(cors(corsOptions))
app.use(express.json())
app.use(cookieParser())

// Ruta de prueba
app.get('/api', (req, res) => {
  res.json({ message: '¡Backend conectado con React! Contraloria uwu' })
})

// En tu index.js (backend)
app.get('/api/verify-auth', authenticate, (req, res) => {
  console.log('Verificando autenticación...' + req.user.usu_ide)
  res.json({
    success: true,
    user: {
      usu_ide: req.user.usu_ide
    }
  })
})

app.post('/api/login', async (req, res) => {
  try {
    if (!req.body.ci || !req.body.password) {
      return res.status(400).json({
        success: false,
        error: 'CI y password son requeridos'
      })
    }

    const result = await UserRepository.login({
      ci: req.body.ci,
      password: req.body.password
    })

    // Generar token con más datos del usuario si es necesario
    const token = jwt.sign(
      {
        usu_ide: result.user.usu_ide
      },
      config.SECRET_KEY,
      { expiresIn: '1h' }
    )

    // Configurar la cookie HTTP-only
    res.cookie('access_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 3600000 // 1 hora
    })

    res.status(200).json({
      success: true,
      user: result.user,
      message: 'Inicio de sesión exitoso'
    })
  } catch (error) {
    res.status(401).json({
      success: false,
      error: error.message
    })
  }
})

app.post('/api/register', async (req, res) => {
  try {
    if (!req.body.ci || !req.body.password) {
      return res.status(400).json({ error: 'CI y password son requeridos' })
    }

    const user = await UserRepository.create({
      ci: req.body.ci,
      password: req.body.password,
      terms: req.body.terms
    })

    res.status(201).json(user)
  } catch (error) {
    console.error('Error en registro:', error)
    res.status(400).json({ error: error.message })
  }
})

app.post('/api/logout', (req, res) => {
  res.clearCookie('access_token').json({ message: 'Sesión cerrada' })
})

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor Node.js corriendo en http://localhost:${PORT}`)
})

export default router
