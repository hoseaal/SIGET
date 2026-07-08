import { EmpleadoModel } from '../models/empleado.model.js'

export const buscarRegistro = async (req, res) => {
  try {
    const query = req.query.q || req.query.search;
    if (!query) {
      return res.status(400).json({ error: 'Debe proporcionar un parámetro de búsqueda' });
    }
    const empleados = await EmpleadoModel.buscarSinUsuario(query);
    res.json(empleados);
  } catch (error) {
    console.error('Error en buscarRegistro:', error);
    res.status(500).json({ error: 'Error al buscar empleados' });
  }
}
