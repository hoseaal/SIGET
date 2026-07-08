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

export const getRoles = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT rol_id, nombre_rol FROM roles_sistema ORDER BY rol_id');
    return res.json(rows);
  } catch (error) {
    console.error('Error obteniendo roles:', error);
    return res.status(500).json({ error: 'Error al obtener roles' });
  }
};

export const getModulos = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT modulo_id, nombre_modulo FROM modulos_acceso ORDER BY modulo_id');
    return res.json(rows);
  } catch (error) {
    console.error('Error obteniendo módulos:', error);
    return res.status(500).json({ error: 'Error al obtener módulos' });
  }
};
