import { getTableInfo } from '../utils/databaseMeta.js'
import pool from '../utils/database.js'

export const getTableMetadata = async (req, res) => {
  try {
    const { table } = req.query

    if (!table) {
      return res.status(400).json({ error: 'Parámetro "table" requerido' })
    }

    const tableInfo = await getTableInfo(table)
    res.json(tableInfo)
  } catch (error) {
    console.error('Error obteniendo metadatos:', error)
    res.status(500).json({
      error: 'Error al obtener metadatos',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
}

// Catálogo de tipos de usuario (testip) para selects en formularios de administración
export const getTiposUsuario = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT usu_tip, tip_nom FROM testip ORDER BY usu_tip')
    res.json(rows)
  } catch (error) {
    console.error('Error obteniendo tipos de usuario:', error)
    res.status(500).json({ error: 'Error al obtener tipos de usuario' })
  }
}

// Catálogo de módulos de acceso (tesacc) para selects en formularios de administración
export const getModulosAcceso = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT usu_mod, acc_nom FROM tesacc ORDER BY usu_mod')
    res.json(rows)
  } catch (error) {
    console.error('Error obteniendo módulos de acceso:', error)
    res.status(500).json({ error: 'Error al obtener módulos de acceso' })
  }
}
