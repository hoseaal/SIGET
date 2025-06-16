// services/pdf/pdf.service.js

import fs from 'fs'
import { generarActaIncorporacion } from './actaIncorporacion.js'
import { generarActaCET } from './actaCET.js'
import { generarReporteBM2 } from './repBM2.js'
// --- 1. IMPORTAR EL NUEVO SERVICIO ---
import { generarActaVerificacionService } from './generadorActaVerificación.service.js'

export class PdfService {
  // --- 2. MODIFICAR LA FIRMA PARA ACEPTAR EL TOKEN ---
  static async generarDocumento (tipo, datos, accessToken) {
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
      case 'acta-verificacion':
        pdfPath = await generarActaVerificacionService(datos, accessToken)
        break
      default:
        throw new Error('Tipo de documento no soportado')
    }

    return {
      success: true,
      path: pdfPath,
      filename: this.getFilename(tipo, datos)
    }
  }

  static getFilename (tipo, datos) {
    const prefixes = {
      'acta-incorporacion': `acta_incorporacion_${datos.numeroActa || 'generada'}`,
      'acta-cet': `acta_cet_${datos.numeroActa || 'generada'}`,
      'reporte-bm2': `reporte_BM2_${datos.numeroReporte || 'generado'}`,
      // --- 4. AÑADIR REGLA PARA EL NOMBRE DEL ARCHIVO ---
      'acta-verificacion': `acta_verificacion_dep_${datos.dep_ide || 'generada'}`
    }
    return `${prefixes[tipo] || 'documento'}.pdf`
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
