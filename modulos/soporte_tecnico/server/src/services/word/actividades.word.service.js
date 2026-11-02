import {
  AlignmentType,
  BorderStyle,
  Document,
  ImageRun,
  LevelFormat,
  Packer,
  Paragraph,
  Table,
  TableCell,
  TableLayoutType,
  TableRow,
  TextRun,
  VerticalAlign,
  WidthType
} from 'docx'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
]

const FONT = 'Arial'
const FONT_SIZE = 18 // 9 pt (docx usa medios puntos)
const HEADER_FILL = 'E9ECEF'
const TABLE_WIDTH = 10800
const COLUMN_WIDTHS = [550, 2900, 1100, 1100, 1100, 1100, 1650, 1300]

const BORDER = {
  top: { style: BorderStyle.SINGLE, size: 4, color: '000000' },
  bottom: { style: BorderStyle.SINGLE, size: 4, color: '000000' },
  left: { style: BorderStyle.SINGLE, size: 4, color: '000000' },
  right: { style: BorderStyle.SINGLE, size: 4, color: '000000' }
}

const NO_BORDER = {
  top: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
  bottom: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
  left: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
  right: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
  insideHorizontal: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
  insideVertical: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' }
}

const number = value => {
  const n = Number(value)
  return Number.isFinite(n) ? n : 0
}

// En el reporte las celdas sin actividad se dejan vacias, no con "0".
const valorCelda = value => {
  const n = number(value)
  return n === 0 ? '' : n
}

const REFERENCIA_LISTA = 'actividades-adicionales'

function texto (value, {
  bold = false,
  size = FONT_SIZE,
  alignment = AlignmentType.LEFT,
  spacing = { before: 0, after: 0 }
} = {}) {
  return new Paragraph({
    alignment,
    spacing,
    children: [
      new TextRun({
        text: String(value ?? ''),
        bold,
        size,
        font: FONT
      })
    ]
  })
}

function celdaEncabezado (textoValor, { rowSpan, columnSpan } = {}) {
  return new TableCell({
    rowSpan,
    columnSpan,
    shading: { fill: HEADER_FILL },
    verticalAlign: VerticalAlign.CENTER,
    borders: BORDER,
    children: [
      texto(textoValor, {
        bold: true,
        alignment: AlignmentType.CENTER,
        spacing: { before: 20, after: 20 }
      })
    ]
  })
}

function celdaDato (valor, {
  alignment = AlignmentType.CENTER,
  bold = false,
  columnSpan
} = {}) {
  return new TableCell({
    columnSpan,
    verticalAlign: VerticalAlign.CENTER,
    borders: BORDER,
    children: [
      texto(valor, {
        bold,
        alignment,
        spacing: { before: 20, after: 20 }
      })
    ]
  })
}

function tablaEncabezadoInstitucional (subtitulo) {
  const logoPath = path.join(__dirname, '../../../public/img/logo.png')
  const logoCellChildren = []

  if (fs.existsSync(logoPath)) {
    try {
      logoCellChildren.push(new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 0, after: 0 },
        children: [
          new ImageRun({
            type: 'png',
            data: fs.readFileSync(logoPath),
            transformation: { width: 78, height: 65 }
          })
        ]
      }))
    } catch (error) {
      console.error('No se pudo agregar el logo al Word:', error.message)
    }
  }

  return new Table({
    width: { size: TABLE_WIDTH, type: WidthType.DXA },
    columnWidths: [1500, 9300],
    layout: TableLayoutType.FIXED,
    borders: NO_BORDER,
    rows: [
      new TableRow({
        children: [
          new TableCell({
            borders: NO_BORDER,
            verticalAlign: VerticalAlign.CENTER,
            children: logoCellChildren.length ? logoCellChildren : [texto('')]
          }),
          new TableCell({
            borders: NO_BORDER,
            verticalAlign: VerticalAlign.CENTER,
            children: [
              texto('CONTRALORIA DEL ESTADO TACHIRA', {
                bold: true,
                size: 26,
                alignment: AlignmentType.CENTER,
                spacing: { before: 0, after: 40 }
              }),
              texto('DIRECCION GENERAL - DIVISION DE SOPORTE TECNICO', {
                bold: true,
                size: 20,
                alignment: AlignmentType.CENTER,
                spacing: { before: 0, after: 20 }
              }),
              texto(subtitulo, {
                bold: true,
                size: 20,
                alignment: AlignmentType.CENTER,
                spacing: { before: 0, after: 0 }
              })
            ]
          })
        ]
      })
    ]
  })
}

/**
 * Reporte mensual consolidado en formato Word (.docx).
 */
export async function generarWordMensual (rows, { mes, anio } = {}) {
  const mesNombre = MESES[Number(mes) - 1] || ''
  const filas = Array.isArray(rows) ? rows : []

  const totales = { prev_sw: 0, prev_hw: 0, corr_sw: 0, corr_hw: 0, plat_serv: 0, plat_inf: 0 }

  const filasTabla = filas.map((r, index) => {
    const valores = {
      prev_sw: number(r.prev_sw),
      prev_hw: number(r.prev_hw),
      corr_sw: number(r.corr_sw),
      corr_hw: number(r.corr_hw),
      plat_serv: number(r.plat_serv),
      plat_inf: number(r.plat_inf)
    }

    Object.keys(totales).forEach(clave => {
      totales[clave] += valores[clave]
    })

    return new TableRow({
      children: [
        celdaDato(index + 1),
        celdaDato(r.nombre || '', { alignment: AlignmentType.LEFT }),
        celdaDato(valorCelda(valores.prev_sw)),
        celdaDato(valorCelda(valores.prev_hw)),
        celdaDato(valorCelda(valores.corr_sw)),
        celdaDato(valorCelda(valores.corr_hw)),
        celdaDato(valorCelda(valores.plat_serv)),
        celdaDato(valorCelda(valores.plat_inf))
      ]
    })
  })

  const filaSubtotal = new TableRow({
    children: [
      celdaDato('SUB TOTALES', {
        alignment: AlignmentType.RIGHT,
        bold: true,
        columnSpan: 2
      }),
      celdaDato(valorCelda(totales.prev_sw), { bold: true }),
      celdaDato(valorCelda(totales.prev_hw), { bold: true }),
      celdaDato(valorCelda(totales.corr_sw), { bold: true }),
      celdaDato(valorCelda(totales.corr_hw), { bold: true }),
      celdaDato(valorCelda(totales.plat_serv), { bold: true }),
      celdaDato(valorCelda(totales.plat_inf), { bold: true })
    ]
  })

  const tablaActividades = new Table({
    width: { size: TABLE_WIDTH, type: WidthType.DXA },
    columnWidths: COLUMN_WIDTHS,
    layout: TableLayoutType.FIXED,
    rows: [
      new TableRow({
        tableHeader: true,
        children: [
          celdaEncabezado('Nro', { rowSpan: 2 }),
          celdaEncabezado('DIRECCION SOLICITANTE', { rowSpan: 2 }),
          celdaEncabezado('MANT. PREVENTIVO', { columnSpan: 2 }),
          celdaEncabezado('MANT. CORRECTIVO', { columnSpan: 2 }),
          celdaEncabezado('PLAT. TECNOLOGICA', { columnSpan: 2 })
        ]
      }),
      new TableRow({
        tableHeader: true,
        children: [
          celdaEncabezado('SOFTWARE'),
          celdaEncabezado('HARDWARE'),
          celdaEncabezado('SOFTWARE'),
          celdaEncabezado('HARDWARE'),
          celdaEncabezado('SERVICIOS / REDES'),
          celdaEncabezado('INFORMES')
        ]
      }),
      ...filasTabla,
      filaSubtotal
    ]
  })

  const totalGeneral = Object.values(totales).reduce((a, b) => a + b, 0)
  const totalHw = totales.prev_hw + totales.corr_hw
  const totalSw = totales.prev_sw + totales.corr_sw

  const resumen = [
    ['MANTENIMIENTOS PREVENTIVOS Y CORRECTIVOS DE HARDWARE', valorCelda(totalHw)],
    ['MANTENIMIENTOS PREVENTIVOS Y CORRECTIVOS DE SOFTWARE', valorCelda(totalSw)],
    ['TOTAL DE SERVICIOS DEL MES', valorCelda(totalGeneral)]
  ]

  const tablaResumen = new Table({
    width: { size: 7400, type: WidthType.DXA },
    columnWidths: [6000, 1400],
    alignment: AlignmentType.RIGHT,
    layout: TableLayoutType.FIXED,
    rows: resumen.map(([etiqueta, valor]) => new TableRow({
      children: [
        new TableCell({
          borders: BORDER,
          verticalAlign: VerticalAlign.CENTER,
          children: [
            texto(etiqueta, {
              bold: true,
              alignment: AlignmentType.RIGHT,
              spacing: { before: 20, after: 20 }
            })
          ]
        }),
        celdaDato(valor, { bold: true })
      ]
    }))
  })

  const periodo = mesNombre ? `${mesNombre.toLowerCase()} de ${anio}` : String(anio ?? '')

  const parrafoIntro = new Paragraph({
    alignment: AlignmentType.JUSTIFY,
    spacing: { before: 0, after: 120, line: 360 },
    children: [
      new TextRun({
        text: `En cuanto a las actividades del mes de ${periodo} la División de Soporte Técnico, adscrita a la Dirección General de la Contraloría del Estado Táchira, desarrollo las siguientes actividades como se muestra en el cuadro adjunto:`,
        font: FONT,
        size: FONT_SIZE
      })
    ]
  })

  const parrafoAdicional = new Paragraph({
    alignment: AlignmentType.JUSTIFY,
    spacing: { before: 0, after: 120, line: 360 },
    children: [
      new TextRun({
        text: 'Adicionalmente, la División de Soporte Técnico, realizo las siguientes actividades no enmarcadas dentro del Plan Operativo Anual, pero que tienen relevancia para la continuidad de la Gestión de la Dirección General:',
        font: FONT,
        size: FONT_SIZE
      })
    ]
  })

  const listaAdicional = [
    'Se ejecuta el monitoreo constante del enlace de conexión a Internet por Fibra Óptica de la Contraloría del Estado Táchira.',
    'Se emitieron los reportes de acceso del sistema IVMS4200 AC, para la Dirección de Recursos Humanos.'
  ].map(item => new Paragraph({
    numbering: { reference: REFERENCIA_LISTA, level: 0 },
    alignment: AlignmentType.JUSTIFY,
    spacing: { before: 0, after: 0, line: 360 },
    children: [
      new TextRun({
        text: item,
        font: FONT,
        size: FONT_SIZE
      })
    ]
  }))

  const doc = new Document({
    creator: 'SIGET - Soporte Tecnico',
    title: `Reporte mensual de actividades - ${mesNombre} ${anio}`,
    description: 'Consolidado mensual por direccion y clasificacion',
    numbering: {
      config: [
        {
          reference: REFERENCIA_LISTA,
          levels: [
            {
              level: 0,
              format: LevelFormat.DECIMAL,
              text: '%1.',
              alignment: AlignmentType.LEFT,
              style: {
                paragraph: {
                  indent: { left: 720, hanging: 360 }
                }
              }
            }
          ]
        }
      ]
    },
    styles: {
      default: {
        document: {
          run: { font: FONT, size: FONT_SIZE }
        }
      }
    },
    sections: [
      {
        properties: {
          page: {
            margin: { top: 720, right: 720, bottom: 720, left: 720 }
          }
        },
        children: [
          tablaEncabezadoInstitucional(
            `REPORTE MENSUAL DE ACTIVIDADES - ${mesNombre.toUpperCase()} ${anio}`
          ),
          parrafoIntro,
          new Paragraph({ spacing: { before: 0, after: 120 } }),
          tablaActividades,
          new Paragraph({ spacing: { before: 0, after: 160 } }),
          tablaResumen,
          new Paragraph({ spacing: { before: 0, after: 160 } }),
          parrafoAdicional,
          new Paragraph({ spacing: { before: 0, after: 0 } }),
          ...listaAdicional
        ]
      }
    ]
  })

  return Packer.toBuffer(doc)
}
