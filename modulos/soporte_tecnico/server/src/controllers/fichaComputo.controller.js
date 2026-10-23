import { FichaComputoService } from '../services/fichaComputo.service.js'

function responderError (res, error) {
  const status = error.status || 500
  res.status(status).json({ error: error.message })
}

export const obtenerFichaComputo = async (req, res) => {
  try {
    const data = await FichaComputoService.obtener(req.params.id)
    res.json(data)
  } catch (error) {
    responderError(res, error)
  }
}

export const guardarFichaComputo = async (req, res) => {
  try {
    const data = await FichaComputoService.guardar(req.params.id, req.body, req.user)
    res.json({
      message: 'Ficha tecnica guardada correctamente',
      data
    })
  } catch (error) {
    responderError(res, error)
  }
}

export const eliminarFichaComputo = async (req, res) => {
  try {
    const data = await FichaComputoService.eliminar(req.params.id)
    res.json(data)
  } catch (error) {
    responderError(res, error)
  }
}
