// backend/cruds.js
import { getConnection } from './conn.js'

export const selectData = async (table, whereClause = '') => {
  const conn = await getConnection().getConnection()
  try {
    const query = `SELECT * FROM ${table} ${whereClause}`
    const [rows] = await conn.query(query)
    return rows
  } finally {
    conn.release()
  }
}

export const insertData = async (table, data) => {
  const conn = await getConnection().getConnection()
  try {
    const query = `INSERT INTO ${table} SET ?`
    const [result] = await conn.query(query, data)
    return result.insertId
  } finally {
    conn.release()
  }
}
