/* eslint-disable camelcase */
import ExcelJS from 'exceljs'
import { SoporteBienesModel } from '../models/soporteBienes.model.js'
import { TIPOS_SOPORTE } from '../config/soporteBienes.config.js'

const TIPOS_VALIDOS = new Set(TIPOS_SOPORTE.map(t => t.value))

function normalizarFiltros (filters = {}) {
  const limpio = { ...filters }

  if (limpio.tipo) {
    limpio.tipo = String(limpio.tipo)
      .split(',')
      .map(t => t.trim())
      .filter(t => TIPOS_VALIDOS.has(t))
  }

  if (limpio.page !== undefined) limpio.page = Math.max(1, Number(limpio.page) || 1)
  if (limpio.limit !== undefined) limpio.limit = Math.max(1, Number(limpio.limit) || 20)
  if (limpio.order) limpio.order = String(limpio.order).toLowerCase() === 'desc' ? 'DESC' : 'ASC'

  return limpio
}

function formatearFecha (fecha) {
  if (!fecha) return ''
  const date = new Date(fecha)
  if (Number.isNaN(date.getTime())) return String(fecha)
  return date.toLocaleDateString('es-VE')
}

export class SoporteBienesService {
  static async obtenerBienes (filters = {}) {
    const normalizados = normalizarFiltros(filters)
    normalizados.limit = Math.min(normalizados.limit || 20, 1000)

    const result = await SoporteBienesModel.getAll(normalizados)

    return {
      data: result.data,
      meta: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.limit > 0 ? Math.ceil(result.total / result.limit) : 0,
        filtersApplied: normalizados
      }
    }
  }

  static async obtenerResumen (filters = {}) {
    return await SoporteBienesModel.getResumen(normalizarFiltros(filters))
  }

  static async obtenerCatalogos () {
    return await SoporteBienesModel.getCatalogos()
  }

  static async obtenerLookup (filters = {}) {
    return await SoporteBienesModel.lookup(filters)
  }

  static async obtenerPorId (id) {
    const bien = await SoporteBienesModel.getById(id)
    if (!bien) throw new Error('Bien mueble no encontrado')
    return bien
  }

  static async exportar (filters = {}) {
    const normalizados = normalizarFiltros(filters)
    normalizados.page = 1
    normalizados.limit = 5000

    const { data } = await SoporteBienesModel.getAll(normalizados)

    const workbook = new ExcelJS.Workbook()
    workbook.creator = 'SIGET - Bienes Muebles'
    workbook.created = new Date()

    const worksheet = workbook.addWorksheet('Bienes Soporte')

    worksheet.columns = [
      { header: 'Nro. Bien', key: 'bim_ide', width: 14 },
      { header: 'Descripcion', key: 'bim_des', width: 42 },
      { header: 'Tipo soporte', key: 'tipo_soporte', width: 22 },
      { header: 'Marca', key: 'marca', width: 18 },
      { header: 'Modelo', key: 'modelo', width: 22 },
      { header: 'Serial', key: 'bim_ser', width: 20 },
      { header: 'Codigo', key: 'bim_cod', width: 18 },
      { header: 'Color', key: 'bim_color', width: 14 },
      { header: 'Sede', key: 'bim_sede', width: 14 },
      { header: 'Departamento', key: 'departamento', width: 34 },
      { header: 'Estado', key: 'estado', width: 14 },
      { header: 'Condicion', key: 'condicion', width: 18 },
      { header: 'Estado de uso', key: 'estado_uso', width: 26 },
      { header: 'Forma de adquisicion', key: 'forma_adquisicion', width: 26 },
      { header: 'Fecha ingreso', key: 'bim_fec', width: 14 },
      { header: 'Valor', key: 'bim_val', width: 14 },
      { header: 'Moneda', key: 'bim_moneda', width: 10 },
      { header: 'Categoria general', key: 'categoria_general', width: 28 },
      { header: 'Subcategoria', key: 'subcategoria', width: 28 },
      { header: 'Categoria especifica', key: 'categoria_especifica', width: 28 },
      { header: 'Observaciones', key: 'bim_obs', width: 40 }
    ]

    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } }
    worksheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1466A8' } }
    worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center', wrapText: true }
    worksheet.getRow(1).height = 28

    data.forEach(bien => {
      worksheet.addRow({
        bim_ide: bien.bim_ide,
        bim_des: bien.bim_des,
        tipo_soporte: bien.tipo_soporte,
        marca: bien.marca || '',
        modelo: bien.modelo || '',
        bim_ser: bien.bim_ser,
        bim_cod: bien.bim_cod,
        bim_color: bien.bim_color,
        bim_sede: bien.bim_sede,
        departamento: bien.departamento || '',
        estado: bien.estado || '',
        condicion: bien.condicion || '',
        estado_uso: bien.estado_uso || '',
        forma_adquisicion: bien.forma_adquisicion || '',
        bim_fec: formatearFecha(bien.bim_fec),
        bim_val: Number(bien.bim_val) || 0,
        bim_moneda: bien.bim_moneda || '',
        categoria_general: bien.categoria_general || '',
        subcategoria: bien.subcategoria || '',
        categoria_especifica: bien.categoria_especifica || '',
        bim_obs: bien.bim_obs || ''
      })
    })

    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return
      row.alignment = { vertical: 'middle', wrapText: true }
      row.eachCell(cell => {
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFD9DEE5' } },
          left: { style: 'thin', color: { argb: 'FFD9DEE5' } },
          bottom: { style: 'thin', color: { argb: 'FFD9DEE5' } },
          right: { style: 'thin', color: { argb: 'FFD9DEE5' } }
        }
      })
    })

    worksheet.autoFilter = { from: 'A1', to: 'U1' }
    worksheet.views = [{ state: 'frozen', ySplit: 1 }]

    const buffer = await workbook.xlsx.writeBuffer()

    return {
      buffer,
      filename: `Bienes_Soporte_${new Date().toISOString().slice(0, 10)}.xlsx`,
      contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    }
  }
}
