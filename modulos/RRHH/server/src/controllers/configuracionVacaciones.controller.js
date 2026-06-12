import { ConfiguracionVacacionesService } from '../services/configuracionVacaciones.service.js'

export const obtenerTodas = async (req, res) => {
  try {
    const lista = await ConfiguracionVacacionesService.obtenerTodas()
    res.json(lista)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

export const obtenerPorId = async (req, res) => {
  try {
    const { id } = req.params
    const registro = await ConfiguracionVacacionesService.obtenerPorId(id)
    res.json(registro)
  } catch (error) {
    res.status(404).json({ error: error.message })
  }
}

export const crear = async (req, res) => {
  try {
    const nueva = await ConfiguracionVacacionesService.crear(req.body)
    res.status(201).json(nueva)
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Ya existe un registro para esa cantidad de años.' })
    }
    res.status(400).json({ error: error.message })
  }
}

export const actualizar = async (req, res) => {
  try {
    const { id } = req.params
    const actualizado = await ConfiguracionVacacionesService.actualizar(id, req.body)
    res.json({ success: actualizado })
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Ya existe otro registro con esa cantidad de años.' })
    }
    res.status(400).json({ error: error.message })
  }
}

export const eliminar = async (req, res) => {
  try {
    const { id } = req.params
    const eliminado = await ConfiguracionVacacionesService.eliminar(id)
    res.json({ success: eliminado })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}
