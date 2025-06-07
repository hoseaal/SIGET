import { FormaAdquisicionService } from '../services/formaAdquisicion.service.js'

export const obtenerFormasAdquisicion = async (req, res) => {
  try {
    const formas = await FormaAdquisicionService.obtenerTodas()
    res.json(formas)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

export const obtenerFormaAdquisicion = async (req, res) => {
  try {
    const forma = await FormaAdquisicionService.obtenerPorId(req.params.id)
    res.json(forma)
  } catch (error) {
    res.status(404).json({ error: error.message })
  }
}
