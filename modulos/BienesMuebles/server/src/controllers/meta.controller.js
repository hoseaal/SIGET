import { getTableInfo } from '../utils/databaseMeta.js'

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
