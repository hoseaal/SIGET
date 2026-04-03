import express from 'express'
import { connectDB } from './src/utils/database.js'
import cookieParser from 'cookie-parser'
import authRouter from './src/auth/auth.routes.js'
import metaRouter from './src/routes/meta.routes.js'
import userRoutes from './src/routes/user.routes.js'
import direccionRouter from './src/routes/direccion.routes.js'
import divisionRouter from './src/routes/division.routes.js'
import unidadRouter from './src/routes/unidad.routes.js'
import profesionRouter from './src/routes/profesion.routes.js'
import estatusRouter from './src/routes/estatus.routes.js'
import funcionarioRouter from './src/routes/funcionario.routes.js'
import cargoCetRouter from './src/routes/cargoCET.routes.js'
import deduccionRouter from './src/routes/deduccion.routes.js'
import cargoOnapreRouter from './src/routes/cargoOnapre.routes.js'
import primaRouter from './src/routes/prima.routes.js'
import primaProfRouter from './src/routes/primaProfesionalizacion.routes.js'
import nivelSalarialRouter from './src/routes/nivelSalarial.routes.js'
import nivelAntiguoRouter from './src/routes/nivelSalarialAntiguo.routes.js'
import antiguedadRouter from './src/routes/antiguedad.routes.js'
import hijoRouter from './src/routes/hijo.routes.js'
import antiguedadRegistroRouter from './src/routes/antiguedadRegistro.routes.js'
import sueldoPensionadoRouter from './src/routes/sueldoPensionado.routes.js'
import jubiladoRouter from './src/routes/jubilado.routes.js'
import permisoRouter from './src/routes/permiso.routes.js'
import condicionLaboralRouter from './src/routes/condicionLaboral.routes.js'
import obreroRouter from './src/routes/obrero.routes.js'

import historialSalarioRouter from './src/routes/historialSalario.routes.js'



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
app.use('/api/meta', metaRouter)

app.use('/api/user', userRoutes)

app.use('/api/direcciones', direccionRouter)
app.use('/api/divisiones', divisionRouter)
app.use('/api/unidades', unidadRouter)
app.use('/api/profesiones', profesionRouter)
app.use('/api/estatus', estatusRouter)


app.use('/api/funcionarios', funcionarioRouter)


app.use('/api/cargos-cet', cargoCetRouter)
app.use('/api/deducciones', deduccionRouter)
app.use('/api/cargos-onapre', cargoOnapreRouter)
app.use('/api/primas', primaRouter)
app.use('/api/primas-profesionalizacion', primaProfRouter)
app.use('/api/niveles-salariales', nivelSalarialRouter)
app.use('/api/niveles-salariales-antiguos', nivelAntiguoRouter)
app.use('/api/antiguedad', antiguedadRouter)
app.use('/api/condiciones-laborales', condicionLaboralRouter)


app.use('/api/hijos', hijoRouter)
app.use('/api/registros-antiguedad', antiguedadRegistroRouter)
app.use('/api/sueldo-pensionado', sueldoPensionadoRouter)
app.use('/api/jubilados', jubiladoRouter)
app.use('/api/permisos', permisoRouter)


app.use('/api/historial-salarios', historialSalarioRouter)
app.use('/api/obreros', obreroRouter)

const PORT = 5002
app.listen(PORT, () => {
  console.log(`🚀 Servidor en http://localhost:${PORT}`)
})
