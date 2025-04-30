import axios from 'axios';

export const fetchData = async (table, columns, conditionColumn, conditionValue) => {

  const params = conditionColumn && conditionValue
    ? { table, columns, fk: conditionColumn, dato: conditionValue }
    : { table, columns };

  try {
    console.log(params)
    const response = await axios.get('/api/selects', { params });
    
    return response.data;
  } catch (error) {
    console.error(`Error al obtener datos de ${table}:`, error.message);
    return [];
  }
};