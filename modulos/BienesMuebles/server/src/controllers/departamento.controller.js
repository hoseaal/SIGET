import { DepartamentoService } from '../services/departamento.service.js'

export const obtenerDepartamentos = async (req, res) => {
  try {
    const departamentos = await DepartamentoService.obtenerTodo()
    res.json(departamentos)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

export const obtenerDepartamento = async (req, res) => {
  try {
    const departamento = await DepartamentoService.obtenerPorId(req.params.id)
    res.json(departamento)
  } catch (error) {
    res.status(404).json({ error: error.message })
  }
}
