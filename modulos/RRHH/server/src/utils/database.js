// server/src/utils/database.js
import { createPool } from 'mysql2/promise'
import 'dotenv/config'

const pool = createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
})

// Función para verificar conexión al iniciar la app
export const connectDB = async () => {
  try {
    const connection = await pool.getConnection()
    await connection.ping()
    connection.release()
    console.log('✅ Conexión exitosa a MySQL de rrhh')
  } catch (error) {
    console.error('❌ Error al conectar a MySQL:', error.message)
    throw error // Falla rápido si no hay conexión
  }
}

// Función para obtener conexiones (simplificada)
export const getConnection = () => pool.getConnection()

// Exporta el pool directamente para consultas rápidas
export default pool
