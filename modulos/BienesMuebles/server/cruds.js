/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
/* eslint-disable camelcase */
import { getConnection } from './conn.js' // Importa la conexión existente

export const selectData = async (table, columns = '*') => {
  const connection = await getConnection()
  console.log('🔌 Conexión obtenida en selectData')
  try {
    const safeColumns = columns && typeof columns === 'string' ? columns : '*'
    const query = `SELECT ${safeColumns} FROM ${table}`
    console.log('🛠 Ejecutando:', query)

    const [rows] = await connection.query(query)
    return rows
  } catch (err) {
    console.error('❌ Error en selectData:', err)
    throw err
  } finally {
    if (connection) {
      try {
        connection.release()
        console.log('🔓 Conexión liberada en selectData')
      } catch (releaseErr) {
        console.error('❌ Error al liberar conexión en selectData:', releaseErr)
      }
    }
  }
}

export const selectWhereData = async (table, columns = '*', fk, dato) => {
  const connection = await getConnection()
  console.log('🔌 Conexión obtenida en selectWhereData')
  try {
    const safeColumns = columns && typeof columns === 'string' ? columns : '*'
    const query = `SELECT ${safeColumns} FROM ${table} WHERE ${fk} = ?`
    console.log('🛠 Ejecutando:', query, 'con dato:', dato)

    const [rows] = await connection.query(query, [dato])
    return rows
  } catch (err) {
    console.error('❌ Error en selectWhereData:', err)
    throw err
  } finally {
    if (connection) {
      try {
        connection.release()
        console.log('🔓 Conexión liberada en selectWhereData')
      } catch (releaseErr) {
        console.error('❌ Error al liberar conexión en selectWhereData:', releaseErr)
      }
    }
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
  }
}

export const updateData = async (table, id, data) => {
  let connection
  try {
    // Validación inicial
    if (id === undefined || id === null) {
      throw new Error('El ID no puede ser undefined o null')
    }

    connection = await getConnection()

    // Obtener primary key
    const [pkColumns] = await connection.execute(
      `SHOW KEYS FROM ${table} WHERE Key_name = 'PRIMARY'`
    )

    if (pkColumns.length === 0) {
      throw new Error('No se encontró primary key en la tabla')
    }

    const primaryKeyColumn = pkColumns[0].Column_name

    // Limpiar datos (convertir undefined a null)
    const cleanData = {}
    Object.keys(data).forEach(key => {
      cleanData[key] = data[key] !== undefined ? data[key] : null
    })

    // Validar que hay datos para actualizar
    if (Object.keys(cleanData).length === 0) {
      return {
        success: false,
        status: 400,
        message: 'No hay datos válidos para actualizar'
      }
    }

    // Construir consulta
    const setClause = Object.keys(cleanData)
      .map(key => `${key} = ?`)
      .join(', ')

    const values = [...Object.values(cleanData), id] // Asegurar que id tiene valor

    console.log('Valores finales para la consulta:', values) // Debug

    const query = `UPDATE ${table} SET ${setClause} WHERE ${primaryKeyColumn} = ?`
    const [result] = await connection.execute(query, values)

    if (result.affectedRows === 0) {
      return {
        success: false,
        status: 404,
        message: 'No se encontró el registro a actualizar'
      }
    }

    // Obtener registro actualizado
    const [updatedRows] = await connection.execute(
      `SELECT * FROM ${table} WHERE ${primaryKeyColumn} = ?`,
      [id]
    )

    return {
      success: true,
      status: 200,
      message: 'Registro actualizado correctamente',
      data: updatedRows[0]
    }
  } catch (err) {
    console.error('Error en updateData:', err.message)
    return {
      success: false,
      status: 500,
      error: err.message,
      message: 'Error al actualizar datos'
    }
  } finally {
    if (connection) connection.release()
  }
}

export const deleteData = async (table, id, idColumn) => {
  let connection
  try {
    connection = await getConnection()

    const query = `DELETE FROM ${table} WHERE ${idColumn} = ?`
    const [result] = await connection.execute(query, [id])

    if (result.affectedRows === 0) {
      return {
        success: false,
        status: 404,
        message: 'No se encontró el registro a eliminar'
      }
    }

    return {
      success: true,
      status: 200,
      message: 'Registro eliminado correctamente'
    }
  } catch (err) {
    console.error('Error en deleteData:', err)
    return {
      success: false,
      status: 500,
      error: err.message,
      message: 'Error al eliminar datos'
    }
  } finally {
    if (connection) connection.release()
  }
}
