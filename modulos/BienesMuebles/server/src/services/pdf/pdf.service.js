import fs from 'fs'
import { generarActaIncorporacion } from './actaIncorporacion.js'
import { generarActaCET } from './actaCET.js'
import { generarReporteBM2 } from './repBM2.js'

export class PdfService {
  static async generarDocumento (tipo, datos) {
    try {
      let pdfPath

      switch (tipo) {
        case 'acta-incorporacion':
          pdfPath = await generarActaIncorporacion(datos)
          break
        case 'acta-cet':
          pdfPath = await generarActaCET(datos)
          break
        case 'reporte-bm2':
          pdfPath = await generarReporteBM2(datos)
          break
        default:
          throw new Error('Tipo de documento no soportado')
      }

      return {
        success: true,
        path: pdfPath,
        filename: this.getFilename(tipo, datos)
      }
    } catch (error) {
      throw new Error(`Error al generar PDF: ${error.message}`)
    }
  }

  static getFilename (tipo, datos) {
    const prefixes = {
      'acta-incorporacion': `acta_incorporacion_${datos.numeroActa || 'generada'}`,
      'acta-cet': `acta_cet_${datos.numeroActa || 'generada'}`,
      'reporte-bm2': `reporte_BM2_${datos.numeroReporte || 'generado'}`
    }
    return `${prefixes[tipo]}.pdf`
  }

  static eliminarArchivoTemporal (path) {
    try {
      if (fs.existsSync(path)) {
        fs.unlinkSync(path)
      }
    } catch (error) {
      console.error('Error eliminando archivo temporal:', error)
    }
  }
}
