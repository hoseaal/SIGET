import BienService from '../services/excel/sudebim.service.js'

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
}

export default BienController
