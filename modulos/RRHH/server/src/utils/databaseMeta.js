import { getConnection } from './database.js'

export const getTableColumns = async (tableName) => {
  const connection = await getConnection()
  try {
    // Obtener todas las columnas
    const [columns] = await connection.query(`
      SELECT COLUMN_NAME as name, DATA_TYPE as type, IS_NULLABLE as nullable
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = ? AND TABLE_SCHEMA = DATABASE()
      ORDER BY ORDINAL_POSITION;
    `, [tableName])

    // Obtener clave primaria
    const [primaryKeys] = await connection.query(`
      SELECT COLUMN_NAME as name
      FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
      WHERE TABLE_NAME = ? 
      AND CONSTRAINT_NAME = 'PRIMARY'
      AND TABLE_SCHEMA = DATABASE();
    `, [tableName])

    return {
      columns,
      primaryKey: primaryKeys[0]?.name || null
    }
  } finally {
    connection.release()
  }
}

export const getTableInfo = async (tableName) => {
  const { columns, primaryKey } = await getTableColumns(tableName)

  return {
    table: tableName,
    primaryKey,
    columns: columns.map(col => ({
      name: col.name,
      type: col.type,
      required: col.nullable === 'NO' && !col.default,
      // Puedes añadir más metadata útil para el frontend
      inputType: mapDbTypeToInput(col.type) // Función auxiliar
    }))
  }
}

// Helper para mapear tipos de DB a tipos de input
const mapDbTypeToInput = (dbType) => {
  const typeMap = {
    int: 'number',
    varchar: 'text',
    text: 'textarea',
    date: 'date',
    decimal: 'number',
    tinyint: 'checkbox'
  }
  return typeMap[dbType.replace(/\(\d+\)/, '')] || 'text'
}
