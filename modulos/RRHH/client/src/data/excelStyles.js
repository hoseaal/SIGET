
export const excelStyles = {
  // =============================
  // TITULO PRINCIPAL
  // =============================
  title: {
    font: {
      name: 'Time News Roman',
      size: 10,
      bold: true,
      color: { argb: 'FF000000' }

    },
    alignment: {
      horizontal: 'center',
      vertical: 'middle'
    },
    height: 25
  },

  // =============================
  // SUBTITULOS
  // =============================
  subtitle: {
    font: {
      name: 'Time News Roman',
      size: 9,
      bold: true,
      color: { argb: 'FF000000' }
    },
    alignment: {
      horizontal: 'center',
      vertical: 'middle'
    },
    height: 20
  },

  // =============================
  // ENCABEZADOS DE TABLA
  // =============================
  header: {
    font: {
      name: 'Time News Roman',
      size: 10,
      bold: true,
      color: { argb: 'FF000000' }
    },
    fill: undefined,
    alignment: {
      vertical: 'middle',
      horizontal: 'center',
      wrapText: true
    },
    border: {
      top: { style: 'thin', color: { argb: 'FF000000' } },
      left: { style: 'thin', color: { argb: 'FF000000' } },
      bottom: { style: 'thin', color: { argb: 'FF000000' } },
      right: { style: 'thin', color: { argb: 'FF000000' } }
    },
    height: 45
  },

  // =============================
  // SEPARADOR DIRECCION
  // =============================
  direccion: {
    font: {
      name: 'Time News Roman',
      size: 9,
      bold: true,
      color: { argb: 'FF000000' }
    },
    fill: {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4BACC6' }
    },
    alignment: {
      horizontal: 'left',
      vertical: 'middle',
      wrapText: true
    },
    border: {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' }
    },
    height: 20
  },

  // =============================
  // SEPARADOR DIVISION
  // =============================
  division: {
    font: {
      name: 'Time News Roman',
      size: 8,
      bold: true,
      color: { argb: 'FF000000' }
    },
    fill: {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFD9D9D9' }
    },
    alignment: {
      horizontal: 'left',
      vertical: 'middle',
      wrapText: true
    },
    border: {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' }
    },
    height: 18
  },

  // =============================
  // TEXTO DE UNIDAD
  // =============================
  unidad: {
    font: {
      name: 'Time News Roman',
      size: 9,
      italic: true,
      color: { argb: 'FF000000' }
    },
    fill: {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFF2F2F2' }
    },
    alignment: {
      horizontal: 'left',
      vertical: 'middle',
      wrapText: true
    },
    border: {
      top: { style: 'thin', color: { argb: 'FFCCCCCC' } },
      left: { style: 'thin', color: { argb: 'FFCCCCCC' } },
      bottom: { style: 'thin', color: { argb: 'FFCCCCCC' } },
      right: { style: 'thin', color: { argb: 'FFCCCCCC' } }
    }
  },

  // =============================
  // DATOS GENERALES
  // =============================
  data: {
    font: {
      name: 'Time News Roman',
      size: 9,
      color: { argb: 'FF000000' }
    },
    border: {
      top: { style: 'thin', color: { argb: 'FF000000' } },
      left: { style: 'thin', color: { argb: 'FF000000' } },
      bottom: { style: 'thin', color: { argb: 'FF000000' } },
      right: { style: 'thin', color: { argb: 'FF000000' } }
    },
    alignment: {
      vertical: 'middle',
      horizontal: 'center',
      wrapText: true
    }
  },

  // =============================
  // DATOS NUMERICOS
  // =============================
  numeric: {
    font: {
      name: 'Time News Roman',
      size: 9
    },
    alignment: {
      horizontal: 'center',
      vertical: 'middle'
    },
    numFmt: '#,##0.00',
    border: {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' }
    }
  },

  // =============================
  // RESALTADO ASIGNACIONES
  // =============================
  asignacion: {
    fill: {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFF0F8FF' }
    }
  },

  // =============================
  // RESALTADO DEDUCCIONES
  // =============================
  deduction: {
    font: {
      color: { argb: 'FFFF0000' }
    },
    fill: {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFFFF5F5' }
    }
  },

  // =============================
  // SALARIO NETO
  // =============================
  neto: {
    font: {
      bold: true,
      color: { argb: 'FF157347' }
    },
    fill: {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFF0FFF4' }
    },
    numFmt: '#,##0.00'
  },

  // =============================
  // APORTES PATRONALES
  // =============================
  patronal: {
    font: {
      color: { argb: 'FF6C757D' }
    },
    numFmt: '#,##0.00'
  },

  // Ancho de columnas por defecto
  defaultColumnWidth: 16,

  // CONFIGURACION POR COLUMNAS ESPECIFICAS
  columns: {
    'N°': { width: 8 },
    'Cedula': { width: 15 },
    'Nombre y Apellido': { width: 40 },
    'Cargo': { width: 35 },
    'Fecha Ingreso': { width: 15 },
    'Sueldo Base': { width: 18 },
    'Total Asignaciones': { width: 20 },
    'Total Deducciones': { width: 20 },
    'Salario Neto': { width: 20 }
  }
};

export default excelStyles;

