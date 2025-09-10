// services/pdf/pdf.service.js

import fs from 'fs'
import { generarActaIncorporacion } from './actaIncorporacion.js'
import { generarActaCET } from './actaCET.js'
import { generarReporteBM2 } from './repBM2.js'
import { generarActaVerificacionService } from './generadorActaVerificación.service.js'
import { generarActaDesincorporacion } from './actaDesincorporacion.js'
import { generarReporteBM4 } from './repBM4.js'
import { generarEtiquetasPDF } from './etiquetas.js'
import { generarActaDeEntrega } from './actaDeEntrega.js'

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
      case 'acta-desincorporacion':
        pdfPath = await generarActaDesincorporacion(datos)
        break
      case 'reporte-bm4':
        pdfPath = await generarReporteBM4(datos)
        break
      case 'acta-de-entrega':
        pdfPath = await generarActaDeEntrega(datos)
        break
      case 'etiquetas':
        // eslint-disable-next-line no-case-declarations
        const innerDatosParaEtiquetas = datos.datos
        if (!innerDatosParaEtiquetas || !Array.isArray(innerDatosParaEtiquetas.bienes)) {
          throw new Error('Para el tipo "etiquetas", el objeto "datos" en el cuerpo de la solicitud debe contener un array de "bienes".')
        }
        pdfPath = await generarEtiquetasPDF(innerDatosParaEtiquetas.bienes)
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
    const currentDate = new Date()
    const currentMonth = currentDate.getMonth() + 1 // getMonth() is 0-indexed
    const currentYear = currentDate.getFullYear()
    const relevantDataForFilename = datos.tipo === 'etiquetas' ? datos.datos : datos
    const prefixes = {
      'acta-incorporacion': `acta_incorporacion_${datos.numeroActa || 'generada'}`,
      'acta-cet': `acta_cet_${datos.numeroActa || 'generada'}`,
      'reporte-bm2': `reporte_BM2_${datos.numeroReporte || 'generado'}`,
      'acta-verificacion': `acta_verificacion_dep_${datos.dep_ide || 'generada'}`,
      'acta-desincorporacion': `acta_desincorporacion_${datos.numeroActa || 'generada'}_bien_${datos.codigoBien || 'N_A'}`,
      'reporte-bm4': `reporte_BM4_mes_${currentMonth}_${currentYear}`,
      // eslint-disable-next-line quote-props
      'etiquetas': `etiquetas_bienes_${relevantDataForFilename.departamento || 'varios'}_${currentDate.getTime()}`
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
