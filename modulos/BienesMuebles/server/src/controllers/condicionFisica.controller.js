import { CondicionFisicaService } from '../services/condicionFisica.service.js'

export const obtenerCondicionesFisicas = async (req, res) => {
  try {
    const condiciones = await CondicionFisicaService.obtenerTodas()
    res.json(condiciones)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

export const obtenerCondicionFisica = async (req, res) => {
  try {
    const condicion = await CondicionFisicaService.obtenerPorId(req.params.id)
    res.json(condicion)
  } catch (error) {
    res.status(404).json({ error: error.message })
  }
}
