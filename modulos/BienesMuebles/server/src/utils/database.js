// server/src/utils/database.js
import { createPool } from 'mysql2/promise'

const pool = createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'dbsiget',
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
    console.log('✅ Conexión exitosa a MySQL')
  } catch (error) {
    console.error('❌ Error al conectar a MySQL:', error.message)
    throw error // Falla rápido si no hay conexión
  }
}

// Función para obtener conexiones (simplificada)
export const getConnection = () => pool.getConnection()

// Exporta el pool directamente para consultas rápidas
export default pool
