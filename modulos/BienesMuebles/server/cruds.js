/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
/* eslint-disable camelcase */
import { getConnection } from './conn.js' // Importa la conexión existente

export const selectData = async (table, columns = '*') => {
  const connection = await getConnection()
  try {
    const [rows] = await connection.query(
      `SELECT ${columns} FROM ${table}`
    )
    return rows
  } finally {
    if (connection) connection.release()
  }
}

export const selectWhereData = async (table, columns = '*', conditionColumn, conditionValue) => {
  const connection = await getConnection()
  try {
    const [rows] = await connection.query(
      `SELECT ${columns} FROM ${table} WHERE ${conditionColumn} = ?`,
      [conditionValue]
    )
    return rows
  } finally {
    if (connection) connection.release()
  }
}

export const fetchDataFromDB = async (table, columns = '*', conditionColumn, conditionValue) => {
  if (conditionColumn && conditionValue) {
    return selectWhereData(table, columns, conditionColumn, conditionValue)
  }
  return selectData(table, columns)
}

export const getTableColumns = async (id_table) => {
  try {
    const connection = await getConnection() // Asegúrate de que getConnection() devuelva una conexión MySQL
    // Consulta para obtener las columnas
    const [columnsResult] = await connection.query(`
      SELECT COLUMN_NAME as column_name
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = ?
      ORDER BY ORDINAL_POSITION;
    `, [id_table])

    // Consulta para obtener la clave primaria
    const [primaryKeyResult] = await connection.query(`
      SELECT COLUMN_NAME as column_name
      FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
      WHERE TABLE_NAME = ?
      AND CONSTRAINT_NAME = 'PRIMARY'
      AND TABLE_SCHEMA = DATABASE();
    `, [id_table])

    return {
      columns: columnsResult.map(row => row.column_name),
      idColumn: primaryKeyResult[0]?.column_name || null
    }
  } catch (err) {
    console.error('Error al obtener columnas:', err.message)
    return { columns: [], idColumn: null }
  }
}

export const insertData = async (table, data) => {
  try {
    const connection = await getConnection()
    const keys = Object.keys(data)
    const values = Object.values(data)
    const placeholders = keys.map(() => '?').join(', ')

    const query = `INSERT INTO ${table} (${keys.join(', ')}) VALUES (${placeholders})`

    const [result] = await connection.execute(query, values)

    // Para MySQL necesitamos hacer una consulta adicional para obtener el registro insertado
    let insertedData
    if (result.insertId) {
      const [rows] = await connection.execute(
              `SELECT * FROM ${table} WHERE id = ?`,
              [result.insertId]
      )
      insertedData = rows[0]
    }

    return {
      success: true, // Asegúrate de incluir esto
      status: 200,
      message: 'Registro insertado correctamente',
      data: rows[0]
    }
  } catch (err) {
    return {
      success: false,
      status: 500,
      error: err.message,
      message: 'Error al insertar datos'
    }
  } finally {
    if (getConnection) await getConnection.release()
  }
}
