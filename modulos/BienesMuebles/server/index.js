/* eslint-disable camelcase */
import express from 'express'
import cors from 'cors'
import jwt from 'jsonwebtoken'
import cookieParser from 'cookie-parser'
import config from './config.js'
import { UserRepository } from './user-repository.js'
import authenticate from './authenticate.js'
import { selectData, selectWhereData, getTableColumns, insertData, updateData, deleteData } from './cruds.js'
import { getConnection } from './conn.js'
import { generarActaIncorporacion, generarActaCET, generarReporteBM2 } from './services/pdf-services.js'
import fs from 'fs'

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
      usu_ide: req.user.usu_ide,
      usu_nom: req.user.usu_nom,
      usu_ape: req.user.usu_ape,
      usu_tip: req.user.usu_tip
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
        usu_ide: result.user.usu_ide,
        usu_nom: result.user.usu_nom,
        usu_ape: result.user.usu_ape,
        usu_tip: result.user.usu_tip
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
    const user = await UserRepository.create({
      ced: req.body.ced,
      password1: req.body.password1,
      usu_usu: req.body.usu_usu,
      nombre: req.body.nombre,
      ape: req.body.ape,
      tipoUsuario: req.body.tipoUsuario,
      modulo: req.body.modulo
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

router.put('/api/update', async (req, res) => {
  try {
    const { table, id, data } = req.body
    const result = await updateData(table, id, data)

    // Envía la misma estructura en éxito y error
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

router.delete('/api/delete', async (req, res) => {
  try {
    const { table, id, idColumn } = req.body

    if (!table || !id || !idColumn) {
      return res.status(400).json({
        success: false,
        message: 'Faltan parámetros requeridos (table, id o idColumn)'
      })
    }

    const result = await deleteData(table, id, idColumn)
    res.status(result.status).json(result)
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: err.message
    })
  }
})

app.post('/api/generar-acta', async (req, res) => {
  try {
    const datosActa = {
      ...req.body,
      fechaActualizacion: new Date().toLocaleDateString('es-VE', { year: 'numeric', month: 'long' }).toUpperCase()
    }

    const pdfPath = await generarActaIncorporacion(datosActa)

    // Enviar el archivo como respuesta
    res.download(pdfPath, `acta_incorporacion_${datosActa.numeroActa || 'generada'}.pdf`, (err) => {
      if (err) {
        console.error('Error al enviar el archivo:', err)
        res.status(500).json({ error: 'Error al enviar el PDF' })
      }
      // Opcional: eliminar el archivo después de enviarlo
      fs.unlink(pdfPath, (unlinkErr) => {
        if (unlinkErr) console.error('Error al eliminar el archivo temporal:', unlinkErr)
      })
    })
  } catch (error) {
    console.error('Error al generar acta:', error)
    res.status(500).json({ error: 'Error al generar el acta' })
  }
})

app.post('/api/generar-acta-CET', async (req, res) => {
  try {
    const datosActa = req.body

    const pdfPath = await generarActaCET(datosActa)

    res.download(pdfPath, `acta_CET_${datosActa.numeroActa || 'generada'}.pdf`, (err) => {
      if (err) {
        console.error('Error al enviar el archivo:', err)
        res.status(500).json({ error: 'Error al enviar el PDF' })
      }
      fs.unlink(pdfPath, (unlinkErr) => {
        if (unlinkErr) console.error('Error al eliminar el archivo temporal:', unlinkErr)
      })
    })
  } catch (error) {
    console.error('Error al generar acta CET:', error)
    res.status(500).json({ error: 'Error al generar el acta CET' })
  }
})

app.post('/api/ReporteBm2', async (req, res) => {
  try {
    const datosReporte = req.body

    const pdfPath = await generarReporteBM2(datosReporte)

    res.download(pdfPath, 'reporte_BM2.pdf', (err) => {
      if (err) {
        console.error('Error al enviar el archivo:', err)
        res.status(500).json({ error: 'Error al enviar el PDF' })
      }
      fs.unlink(pdfPath, (unlinkErr) => {
        if (unlinkErr) console.error('Error al eliminar el archivo temporal:', unlinkErr)
      })
    })
  } catch (error) {
    console.error('Error al generar reporte BM-2:', error)
    res.status(500).json({ error: 'Error al generar el reporte BM-2' })
  }
})

// Monta el router en la aplicación
app.use(router)

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor Node.js corriendo en http://localhost:${PORT}`)
})

export default router
