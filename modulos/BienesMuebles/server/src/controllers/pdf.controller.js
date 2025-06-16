// controllers/pdf.controller.js

import { PdfService } from '../services/pdf/pdf.service.js'

export const generarDocumento = async (req, res) => {
  try {
    const { tipo } = req.params
    const datos = req.body
    // --- 1. EXTRAER EL TOKEN DE LAS COOKIES ---
    const accessToken = req.cookies.access_token

    // El token es requerido específicamente por algunos servicios, como el de verificación.
    // El servicio se encargará de usarlo si lo necesita.
    if (!accessToken) {
      return res.status(401).json({ error: 'No autorizado: Falta token de acceso.' })
    }

    // --- 2. PASAR EL TOKEN AL SERVICIO ---
    const { path: pdfPath, filename } = await PdfService.generarDocumento(tipo, datos, accessToken)

    res.download(pdfPath, filename, (err) => {
      // Elimina el archivo temporal sin importar si hubo un error en el envío.
      PdfService.eliminarArchivoTemporal(pdfPath)

      if (err) {
        // No se puede enviar otra respuesta si la descarga ya empezó.
        // Solo se loguea el error en el servidor.
        console.error('Error al enviar el archivo PDF al cliente:', err)
      }
    })
  } catch (error) {
    console.error(`Error generando documento tipo "${req.params.tipo}":`, error)
    res.status(400).json({
      error: error.message,
      // Proporciona más detalles solo en entorno de desarrollo
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    })
  }
}
