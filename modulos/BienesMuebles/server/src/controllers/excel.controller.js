/* eslint-disable no-undef */
/* eslint-disable camelcase */
import BienService from '../services/excel/sudebim.service.js'
import excelService from '../services/excel/BM1.service.js'
import excelBm3Service from '../services/excel/BM3.service.js'
import { generarActaVerificacionExcelService } from '../services/excel/acta-verificacion.services.js'

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

  static async generateBM3Report (req, res) {
    try {
      // Llamamos al servicio para que genere el buffer del archivo Excel
      const excelBuffer = await excelBm3Service.generateBM3Excel(req)

      // Configuramos las cabeceras de la respuesta para la descarga
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')

      // Enviamos el buffer
      res.send(excelBuffer)
    } catch (error) {
      console.error('Error en generateBM1Report controller:', error)
      res.status(500).json({ message: 'Error al generar el archivo Excel.' })
    }
  }

  static async generateActaVerificacionExcel (req, res) {
    try {
      // Extract data from query parameters (or body if you change it to POST)
      const dep_ide = req.query.dep_ide
      const departamento_nombre = req.query.departamento_nombre

      // Access token from cookies, as per your setup
      const accessToken = req.cookies.access_token

      if (!accessToken) {
        return res.status(401).json({ error: 'No autorizado: Falta token de acceso.' })
      }
      if (!dep_ide || !departamento_nombre) {
        return res.status(400).json({ error: 'Faltan parámetros para generar el Acta de Verificación Excel.' })
      }

      const datos = {
        dep_ide: Number(dep_ide), // Ensure it's a number if your service expects it
        departamento_nombre
      }

      // Call the new service function to generate the Excel buffer and filename
      const { excel, excelFileName } = await generarActaVerificacionExcelService(datos, accessToken)

      // Configure headers for download
      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      )
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${excelFileName}"`
      )

      // Send the file
      res.send(excel)
    } catch (error) {
      console.error('Error en generateActaVerificacionExcel controller:', error)
      res.status(500).json({ message: 'Error al generar el archivo Excel del Acta de Verificación.' })
    }
  }
}

export default BienController
