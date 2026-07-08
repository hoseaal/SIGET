import { FestivosModel } from '../models/festivos.model.js'

export class FestivosController {
  static async getAll(req, res) {
    try {
      const festivos = await FestivosModel.getAll()
      res.json(festivos)
    } catch (error) {
      console.error('Error getting festivos:', error)
      res.status(500).json({ error: 'Error interno del servidor' })
    }
  }

  static async create(req, res) {
    try {
      const id = await FestivosModel.create(req.body)
      res.status(201).json({ id_festivo: id, ...req.body })
    } catch (error) {
      console.error('Error creating festivo:', error)
      res.status(500).json({ error: 'Error interno del servidor' })
    }
  }

  static async update(req, res) {
    try {
      const affectedRows = await FestivosModel.update(req.params.id, req.body)
      if (affectedRows === 0) return res.status(404).json({ error: 'Festivo no encontrado' })
      res.json({ id_festivo: req.params.id, ...req.body })
    } catch (error) {
      console.error('Error updating festivo:', error)
      res.status(500).json({ error: 'Error interno del servidor' })
    }
  }

  static async delete(req, res) {
    try {
      const affectedRows = await FestivosModel.delete(req.params.id)
      if (affectedRows === 0) return res.status(404).json({ error: 'Festivo no encontrado' })
      res.json({ message: 'Festivo eliminado exitosamente' })
    } catch (error) {
      console.error('Error deleting festivo:', error)
      res.status(500).json({ error: 'Error interno del servidor' })
    }
  }
}
