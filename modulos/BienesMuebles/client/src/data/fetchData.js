import axios from 'axios';

export const fetchData = async (table, columns, conditionColumn, conditionValue) => {

  const params = conditionColumn && conditionValue
    ? { table, columns, fk: conditionColumn, dato: conditionValue }
    : { table, columns };

  try {
    const response = await axios.get('/api/selects', { params });
    
    return response.data;
  } catch (error) {
    console.error(`Error al obtener datos de ${table}:`, error.message);
    return [];
  }
};

export const fetchTableColumns = async (tableName) => {
  try {
    const response = await axios.get(`/api/table-columns?id_table=${tableName}`);
    const { columns, idColumn } = response.data; // Desestructuración directa
    
    return {
      columns,     // Lista de columnas
      idColumn     // Nombre de la columna de identificación única
    };
    
  } catch (error) {
    console.error('Error fetching table columns:', error);
    throw error; // Opcional: relanzar el error para manejo externo
  }
};