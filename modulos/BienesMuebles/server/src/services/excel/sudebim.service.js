import BienModel from '../../models/excelSUDEBIM.model.js'
import ExcelJS from 'exceljs'

class BienService {
  static async generateExcel () {
    try {
      // Obtener datos de la base de datos
      const bienes = await BienModel.getAllForExcel()
      // Crear el libro de Excel
      const workbook = new ExcelJS.Workbook()
      const worksheet = workbook.addWorksheet('Bienes Muebles')
      // Establecer propiedades del documento
      workbook.creator = 'SUDEBIN'
      workbook.lastModifiedBy = 'SUDEBIN'
      workbook.created = new Date()
      workbook.modified = new Date()
      // Configurar columna
      worksheet.columns = [
        { header: 'Sede', key: 'bim_sede', width: 15 },
        { header: 'Unidad Administrativa', key: 'departamento', width: 25 },
        { header: 'Código Interno', key: 'bim_ide', width: 15 },
        { header: 'Descripción', key: 'bim_des', width: 40 },
        { header: 'Forma Adquisición', key: 'forma_adquisicion', width: 20 },
        { header: 'Fecha Adquisición', key: 'bim_fec', width: 15 },
        { header: 'N° Documento', key: 'bim_ndo', width: 15 },
        { header: 'Valor Adquisición', key: 'bim_val', width: 15 },
        { header: 'Moneda', key: 'bim_moneda', width: 10 },
        { header: 'Estado del Uso', key: 'estado_uso', width: 20 },
        { header: 'Condición Física', key: 'condicion', width: 15 },
        { header: 'Marca', key: 'marca', width: 15 },
        { header: 'Modelo', key: 'modelo', width: 15 },
        { header: 'Color', key: 'bim_color', width: 10 },
        { header: 'Categoría General', key: 'categoria_general', width: 25 },
        { header: 'Subcategoría', key: 'subcategoria', width: 25 },
        { header: 'Categoría Específica', key: 'categoria_especifica', width: 25 },
        { header: 'Código SUDEBIM', key: 'bim_cod', width: 15 }
      ]

      const headerRowNumber = 1
      // Formato para las cabeceras
      worksheet.columns.forEach((column, index) => {
        const cell = worksheet.getCell(headerRowNumber, index + 1) // index + 1 porque las columnas en Excel son base 1
        cell.font = { bold: true }
        cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true }
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF89AAF3' } }
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        }
      })

      // Añadir datos
      bienes.forEach(bien => {
        worksheet.addRow({
          bim_sede: bien.bim_sede,
          departamento: bien.departamento,
          bim_ide: bien.bim_ide,
          bim_des: bien.bim_des,
          forma_adquisicion: bien.forma_adquisicion,
          bim_fec: bien.bim_fec,
          bim_ndo: bien.bim_ndo,
          bim_val: bien.bim_val,
          bim_moneda: bien.bim_moneda,
          estado_uso: bien.estado_uso,
          condicion: bien.condicion,
          marca: bien.marca,
          modelo: bien.modelo,
          bim_color: bien.bim_color,
          categoria_general: bien.categoria_general,
          subcategoria: bien.subcategoria,
          categoria_especifica: bien.categoria_especifica,
          bim_cod: bien.bim_cod
        })
      })
      // Autoajustar columnas
      worksheet.columns.forEach(column => {
        if (column.values) {
          const maxLength = column.values.reduce((acc, value) => {
            if (value) {
              const length = value.toString().length
              return length > acc ? length : acc
            }
            return acc
          }, 0)
          column.width = maxLength < column.header.length ? column.header.length + 2 : maxLength + 2
        }
      })
      // Generar buffer del Excel
      const buffer = await workbook.xlsx.writeBuffer()

      return buffer
    } catch (error) {
      console.error('Error generating Excel:', error)
      throw error
    }
  }
}

export default BienService
