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

const connectDB = async () => {
  try {
    const connection = await pool.getConnection()
    await connection.ping() // Verifica que está viva la conexión
    connection.release()
    console.log('✅ Conexión exitosa a MySQL')
  } catch (error) {
    console.error('❌ Error al conectar a la base de datos:', error)
    throw error
  }
}

const getConnection = async () => {
  try {
    const connection = await pool.getConnection()
    console.log(' Conexión obtenida')
    const originalRelease = connection.release.bind(connection)
    connection.release = () => {
      console.log(' Conexión liberada')
      originalRelease()
    }
    return connection
  } catch (error) {
    console.error('Error al obtener conexión:', error.message)
    throw error
  }
}

export { pool, connectDB, getConnection }
