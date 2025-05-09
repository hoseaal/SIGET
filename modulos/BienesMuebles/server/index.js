/* eslint-disable camelcase */
import express from 'express'
import cors from 'cors'
import jwt from 'jsonwebtoken'
import cookieParser from 'cookie-parser'
import config from './config.js'
import { UserRepository } from './user-repository.js'
import authenticate from './authenticate.js'
import { selectData, selectWhereData, getTableColumns, insertData } from './cruds.js'
import { getConnection } from './conn.js'

const router = express.Router()
const app = express()
const PORT = 5000

const corsOptions = {
  origin: 'http://localhost:5173', // Ajusta a tu URL de frontend
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE']
}

app.use(cors(corsOptions))
app.use(express.json())
app.use(cookieParser())

app.get('/api', (req, res) => {
  res.json({ message: '¡Backend conectado con React! Contraloria uwu' })
})

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
      maxAge: 3600000
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

app.get('/api/selects', async (req, res) => {
  try {
    const { table, columns, fk, dato } = req.query

    // Validación básica
    if (!table) {
      return res.status(400).json({ error: 'El parámetro "table" es requerido' })
    }

    let data
    if (fk && dato) {
      data = await selectWhereData(table, columns, fk, dato)
    } else {
      data = await selectData(table, columns)
    }

    console.log('Datos obtenidos:', data)
    res.json(data)
  } catch (err) {
    console.error('Error en /api/selects:', err)
    res.status(500).json({
      error: 'Error al obtener datos',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    })
  }
})

app.get('/api/table-columns', async (req, res) => {
  try {
    const { id_table } = req.query
    if (!id_table) {
      return res.status(400).json({ error: 'Debe proporcionar el nombre de la tabla' })
    }

    const { columns, idColumn } = await getTableColumns(id_table) // Obtiene las columnas y la columna de identificación única
    res.json({ columns, idColumn }) // Devuelve ambos en la respuesta
  } catch (err) {
    console.error('Error al obtener columnas:', err.message)
    res.status(500).json({ error: 'Error al obtener columnas' })
  }
})

app.post('/api/insert', async (req, res) => {
  try {
    const { table, data } = req.body
    if (!table || !data) {
      return res.status(400).json({ error: 'Tabla y datos son requeridos' })
    }

    const connection = await getConnection()
    const [result] = await connection.query(`INSERT INTO ${table} SET ?`, data)
    res.status(201).json({ id: result.insertId })
  } catch (err) {
    console.error('Error al insertar:', err.message)
    res.status(500).json({ error: 'Error al insertar datos' })
  }
})

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor Node.js corriendo en http://localhost:${PORT}`)
})

router.post('/api/insert', async (req, res) => {
  try {
    const { table, data } = req.body
    const result = await insertData(table, data)
    // Envía la misma estructura en éxito y error
    console.log('Resultado de la inserción:', res)
    res.status(result.status).json({
      success: result.success,
      message: result.message,
      data: result.data,
      error: result.error || null
    })
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: err.message
    })
  }
})

export default router
