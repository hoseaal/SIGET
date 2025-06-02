import { PdfService } from '../services/pdf/pdf.service.js'

export const generarDocumento = async (req, res) => {
  try {
    const { tipo } = req.params
    const datos = req.body

    const { path: pdfPath, filename } = await PdfService.generarDocumento(tipo, datos)

    res.download(pdfPath, filename, (err) => {
      PdfService.eliminarArchivoTemporal(pdfPath)
      if (err) {
        console.error('Error al enviar PDF:', err)
        res.status(500).json({ error: 'Error al enviar el documento' })
      }
    })
  } catch (error) {
    console.error('Error generando documento:', error)
    res.status(400).json({
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    })
  }
}
