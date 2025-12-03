import { FuncionarioService } from '../services/funcionario.service.js'

/**
 * Obtiene funcionarios con opciones avanzadas de filtrado y paginación.
 * * @param {object} req.query - Parámetros de consulta en la URL.
 * @param {number} [req.query.page=1] - Número de página actual.
 * @param {number} [req.query.limit=20] - Cantidad de registros por página.
 * @param {string} [req.query.all] - Si es 'true', ignora la paginación y trae todos.
 * @param {string} [req.query.search] - Busca por Cédula, Nombre o Apellido.
 * @param {number} [req.query.pro_ide] - Filtrar por ID de Profesión.
 * @param {number} [req.query.est_ide] - Filtrar por ID de Estatus.
 * @param {string} [req.query.fun_gen] - Filtrar por Género (M, F, O).
 * @param {number} [req.query.edad_min] - Edad mínima.
 * @param {number} [req.query.edad_max] - Edad máxima.
 * * @returns {Promise<object>} Objeto con datos paginados o lista completa.
 */
export const obtenerFuncionarios = async (req, res) => {
  try {
    // Extraemos filtros y configuraciones de paginación
    const filtros = req.query
    const resultados = await FuncionarioService.obtenerConFiltros(filtros)
    res.json(resultados)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

/**
 * Obtiene un funcionario por ID.
 * @param {number} req.params.id - ID del funcionario.
 */
export const obtenerFuncionario = async (req, res) => {
  try {
    const { id } = req.params
    const funcionario = await FuncionarioService.obtenerPorId(id)
    res.json(funcionario)
  } catch (error) {
    res.status(404).json({ error: error.message })
  }
}

/**
 * Crea un nuevo funcionario.
 * @param {object} req.body - Datos completos del funcionario según la tabla tmafun.
 */
export const crearFuncionario = async (req, res) => {
  try {
    const nuevo = await FuncionarioService.crear(req.body)
    res.status(201).json(nuevo)
  } catch (error) {
    // Manejo especial para duplicados (cedula o rif)
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'La Cédula o el RIF ya existen en el sistema.' })
    }
    res.status(400).json({ error: error.message })
  }
}

export const actualizarFuncionario = async (req, res) => {
  try {
    const { id } = req.params
    const actualizado = await FuncionarioService.actualizar(id, req.body)
    res.json({ success: actualizado })
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'La Cédula o el RIF ya existen en otro registro.' })
    }
    res.status(400).json({ error: error.message })
  }
}

export const eliminarFuncionario = async (req, res) => {
  try {
    const { id } = req.params
    const eliminado = await FuncionarioService.eliminar(id)
    res.json({ success: eliminado })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

/* 
1. Búsqueda y Paginación (GET) Buscar "Carlos", página 1, límite 10 registros. http://localhost:3000/api/funcionarios?page=1&limit=10&search=Carlos

2. Filtro por Profesión y Género (GET) Profesión ID 1 y Género Masculino. http://localhost:3000/api/funcionarios?pro_ide=1&fun_gen=M

3. Obtener TODOS sin paginar (GET) Útil para selects o reportes completos. http://localhost:3000/api/funcionarios?all=true

4. Filtrar por rango de Edad (GET) Funcionarios entre 25 y 40 años. http://localhost:3000/api/funcionarios?edad_min=25&edad_max=40 
*/