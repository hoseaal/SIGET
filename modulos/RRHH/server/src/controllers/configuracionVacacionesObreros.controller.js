import { ConfiguracionVacacionesObrerosService } from '../services/configuracionVacacionesObreros.service.js'

export const obtenerTodas = async (req, res) => {
  try {
    const lista = await ConfiguracionVacacionesObrerosService.obtenerTodas()
    res.json(lista)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

export const obtenerPorId = async (req, res) => {
  try {
    const { id } = req.params
    const registro = await ConfiguracionVacacionesObrerosService.obtenerPorId(id)
    res.json(registro)
  } catch (error) {
    res.status(404).json({ error: error.message })
  }
}

export const crear = async (req, res) => {
  try {
    const nueva = await ConfiguracionVacacionesObrerosService.crear(req.body)
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
    const actualizado = await ConfiguracionVacacionesObrerosService.actualizar(id, req.body)
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
    const eliminado = await ConfiguracionVacacionesObrerosService.eliminar(id)
    res.json({ success: eliminado })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}
