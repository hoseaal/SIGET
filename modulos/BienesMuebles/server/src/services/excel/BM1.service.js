import ExcelJS from 'exceljs'
import fs from 'fs'
import path from 'path'

class ExcelService {
  static async generateBM1Excel (departmentCode, req) {
    try {
      // --- PASO 1: OBTENCIÓN DE DATOS ---
      const token = req.cookies.access_token
      if (!token) {
        throw new Error('No se encontró el token de autenticación en la petición.')
      }

      const apiUrl = `${req.protocol}://${req.get('host')}/api/bienes?dep=${departmentCode}&inc=1`
      const response = await fetch(apiUrl, {
        headers: {
          Cookie: `access_token=${token}`
        }
      })

      if (!response.ok) {
        throw new Error(`Error al obtener los bienes. El servidor respondió con estado: ${response.status}`)
      }

      const responseData = await response.json()
      const bienes = responseData.data || []

      let departmentName = `DEPARTAMENTO CÓDIGO ${departmentCode}` // Valor por defecto
      try {
        const depRes = await fetch(`${req.protocol}://${req.get('host')}/api/departamentos/${departmentCode}`, {
          headers: {
            Cookie: `access_token=${token}`
          }
        })
        if (depRes.ok) {
          const depData = await depRes.json()
          departmentName = depData.dep_nom || departmentName // Usamos el nombre si existe, sino mantenemos el valor por defecto
        }
      } catch (depError) {
        console.warn('Advertencia: No se pudo obtener el nombre del departamento', depError.message)
      }

      // --- PASO 2: CREACIÓN DEL EXCEL CON FORMATO SOLICITADO ---
      const workbook = new ExcelJS.Workbook()
      workbook.creator = 'Contraloría del Estado Táchira'
      workbook.lastModifiedBy = 'Sistema de Inventario'
      workbook.created = new Date()

      const worksheet = workbook.addWorksheet(`BM1-${departmentCode}`)

      // --- LOGO (A1:C5) ---
      try {
        const logoPath = path.join(process.cwd(), 'public', 'img', 'logo-contraloria-home1.png')

        if (fs.existsSync(logoPath)) {
          const logo = workbook.addImage({
            buffer: fs.readFileSync(logoPath),
            extension: 'png'
          })
          worksheet.addImage(logo, 'A1:C5')
        }
      } catch (logoError) {
        console.warn('Advertencia: No se pudo procesar el logo.', logoError.message)
      }

      // --- ENCABEZADO (D1:D5) ---
      const today = new Date()
      const formattedDate = `${today.getDate()}/${today.getMonth() + 1}/${today.getFullYear()}`

      worksheet.getCell('D1').value = 'REPORTE DE VERIFICACION DEL INVENTARIO DE BIENES MUEBLES'
      worksheet.getCell('D2').value = 'UNIDAD EJECUTORA: CONTRALORIA DEL ESTADO TACHIRA'
      worksheet.getCell('D3').value = 'DIRECCION O UNIDAD ADMINISTRATIVA: DIRECCION ADMINISTRACION'
      worksheet.getCell('D4').value = `FECHA DEL REPORTE: ${formattedDate}`
      worksheet.getCell('D5').value = departmentName

      // Estilos para el encabezado
      for (let i = 1; i <= 5; i++) {
        const cell = worksheet.getCell(`D${i}`)
        cell.font = { name: 'Arial', size: 11, bold: i === 1 }
        cell.alignment = { vertical: 'middle', horizontal: 'center' }
      }

      // --- CABECERAS DE COLUMNAS (A6:I6) ---
      worksheet.getCell('A6').value = 'Numero'
      worksheet.getCell('B6').value = 'Codigo'
      worksheet.getCell('D6').value = 'Descripcion'
      worksheet.getCell('E6').value = 'Observacion'
      worksheet.getCell('F6').value = 'Sin Etiqueta'
      worksheet.getCell('G6').value = 'Inoperativo'
      worksheet.getCell('H6').value = 'Faltante'
      worksheet.getCell('I6').value = 'Operativo'

      // Estilos para las cabeceras de columnas
      for (let col = 1; col <= 8; col++) {
        const cell = worksheet.getCell(6, col)
        cell.font = { bold: true }
        cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true }
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF89AAF3' } }
        cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } }
      }

      // --- DATOS DE LOS BIENES (A7:I7 en adelante) ---
      if (bienes.length > 0) {
        bienes.forEach((bien, index) => {
          const rowNumber = 7 + index

          worksheet.getCell(`A${rowNumber}`).value = index + 1 // Número secuencial
          worksheet.getCell(`B${rowNumber}`).value = bien.bim_ide // Código
          worksheet.getCell(`D${rowNumber}`).value = bien.bim_des // Descripción
          worksheet.getCell(`E${rowNumber}`).value = bien.bim_obs || ' ' // Observación

          // Marcar el estado correspondiente con "X"
          switch (bien.est_ide) {
            case 1: worksheet.getCell(`F${rowNumber}`).value = 'X'; break
            case 2: worksheet.getCell(`G${rowNumber}`).value = 'X'; break
            case 3: worksheet.getCell(`H${rowNumber}`).value = 'X'; break
            case 4: worksheet.getCell(`I${rowNumber}`).value = 'X'; break
          }

          // Aplicar estilos a toda la fila
          for (let col = 1; col <= 9; col++) {
            const cell = worksheet.getCell(rowNumber, col)
            cell.border = {
              top: { style: 'thin' },
              left: { style: 'thin' },
              bottom: { style: 'thin' },
              right: { style: 'thin' }
            }
            // Alineación especial para columnas de texto largo
            if (col === 4 || col === 5) { // Descripción y Observación
              cell.alignment = { wrapText: true, vertical: 'top' }
            } else {
              cell.alignment = { vertical: 'middle', horizontal: 'center' }
            }
          }
        })
      } else {
        // Si no hay bienes, mostrar mensaje
        worksheet.mergeCells('A7:I7')
        const noDataCell = worksheet.getCell('A7')
        noDataCell.value = 'No se encontraron bienes para este departamento.'
        noDataCell.alignment = { horizontal: 'center' }
        noDataCell.font = { italic: true }
      }

      // Ajustar el ancho de las columnas
      worksheet.columns = [
        { key: 'numero', width: 8 }, // A
        { key: 'codigo', width: 15 }, // B
        { key: 'descripcion', width: 40 }, // D
        { key: 'observacion', width: 40 }, // E
        { key: 'sin_etiqueta', width: 12 }, // F
        { key: 'inoperativo', width: 12 }, // G
        { key: 'faltante', width: 12 }, // H
        { key: 'operativo', width: 12 }// I
      ]

      return await workbook.xlsx.writeBuffer()
    } catch (error) {
      console.error('Error crítico en generateBM1Excel:', error.message)
      throw error
    }
  }
}

export default ExcelService
