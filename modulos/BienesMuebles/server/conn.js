import { createPool } from 'mysql2/promise'

let client = null

const pool = createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'dbsiget',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
})

const connectDB = async (user, password) => {
  if (!client) {
    client = createPool(user, password)
    try {
      await pool.connect()
      console.log('Conexión exitosa a phpMyAdmin MySQL')
    } catch (error) {
      console.error('Error al conectar a la base de datos:', error)
      client = null
      throw error
    }
  } else {
    console.log('Conexión ya establecida')
  }
}

const getConnection = async () => {
  try {
    const connection = await pool.getConnection()
    return connection
  } catch (error) {
    console.error('Error al obtener conexión:', error.message)
    throw error
  }
}

export { pool, connectDB, getConnection }
