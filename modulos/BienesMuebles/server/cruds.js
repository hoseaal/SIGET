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
