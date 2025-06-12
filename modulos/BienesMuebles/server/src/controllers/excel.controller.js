import BienService from '../services/excel/sudebim.service.js'
import excelService from '../services/excel/BM1.service.js'

class BienController {
  static async generateExcel (req, res) {
    try {
      const excelBuffer = await BienService.generateExcel()

      // Configurar headers para descarga
      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      )
      res.setHeader(
        'Content-Disposition',
        'attachment; filename=BM1-sudebim.xlsx'
      )

      // Enviar el archivo
      res.send(excelBuffer)
    } catch (error) {
      console.error('Error in generateExcel:', error)
      res.status(500).json({ error: 'Error generating Excel file' })
    }
  }

  static async generateBM1Report (req, res) {
    try {
      // Llamamos al servicio para que genere el buffer del archivo Excel
      const excelBuffer = await excelService.generateBM1Excel(req)

      // Configuramos las cabeceras de la respuesta para la descarga
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')

      // Enviamos el buffer
      res.send(excelBuffer)
    } catch (error) {
      console.error('Error en generateBM1Report controller:', error)
      res.status(500).json({ message: 'Error al generar el archivo Excel.' })
    }
  }
}

export default BienController
