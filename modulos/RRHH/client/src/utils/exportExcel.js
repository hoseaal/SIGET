import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { excelStyles } from '../data/excelStyles';

// ─── Helper: bloque de firmas dinámicas ────────────────────────────────────

/**
 * Agrega el bloque de firmas institucionales al final de la hoja de trabajo.
 * Deja 3 filas vacías después de los datos, luego pinta 2 filas de firmas
 * (2 por fila) con línea superior, nombre completo y título del cargo.
 *
 * @param {Worksheet} ws        - Hoja activa de ExcelJS
 * @param {Number} totalColumns - Cantidad total de columnas del reporte
 * @param {Array}  firmantes    - Arreglo [{ nombre_completo, cargo_firma }, ...]
 *                                Se esperan 4 (Director, Jefe Div Gral, Jefe Div Rem, Asistente Admin)
 */
function agregarBloqueFirmas(ws, totalColumns, firmantes) {
  if (!firmantes || firmantes.length < 4) {
    firmantes = [
      { nombre_completo: '[Por Asignar]', cargo_firma: 'DIRECTOR(A) DE RECURSOS HUMANOS' },
      { nombre_completo: '[Por Asignar]', cargo_firma: 'JEFE DE DIVISIÓN GENERAL DE RECURSOS HUMANOS' },
      { nombre_completo: '[Por Asignar]', cargo_firma: 'JEFE DE DIVISIÓN DE REMUNERACIONES' },
      { nombre_completo: '[Por Asignar]', cargo_firma: 'ASISTENTE ADMINISTRATIVO' }
    ];
  }

  // Dejar 3 filas vacías como separación
  for (let i = 0; i < 3; i++) ws.addRow([]);

  const halfCol = Math.floor(totalColumns / 2);

  // 2 filas de firmas, 2 signatarios por fila
  const pares = [
    [firmantes[0], firmantes[1]],
    [firmantes[2], firmantes[3]]
  ];

  pares.forEach(pair => {
    // Fila 1: línea horizontal (borde superior)
    const lineRow = ws.addRow([]);
    // Fila 2: nombre completo
    const nameRow = ws.addRow([]);
    nameRow.height = 22;
    // Fila 3: cargo
    const titleRow = ws.addRow([]);
    titleRow.height = 18;

    pair.forEach((f, idx) => {
      const startCol = idx === 0 ? 1 : halfCol + 1;
      const endCol = idx === 0 ? halfCol : totalColumns;

      // Línea
      ws.mergeCells(lineRow.number, startCol, lineRow.number, endCol);
      const lineCell = lineRow.getCell(startCol);
      lineCell.border = {
        top: { style: 'thin', color: { argb: 'FF000000' } },
        bottom: { style: 'thin', color: { argb: 'FFFFFFFF' } }
      };

      // Nombre
      ws.mergeCells(nameRow.number, startCol, nameRow.number, endCol);
      const nameCell = nameRow.getCell(startCol);
      nameCell.value = f.nombre_completo || '[Por Asignar]';
      nameCell.font = { name: 'Arial', size: 11, bold: true };
      nameCell.alignment = { horizontal: 'center', vertical: 'middle' };

      // Cargo
      ws.mergeCells(titleRow.number, startCol, titleRow.number, endCol);
      const titleCell = titleRow.getCell(startCol);
      titleCell.value = f.cargo_firma || '';
      titleCell.font = { name: 'Arial', size: 9, italic: false };
      titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
    });
  });
}

/**
 * Genera un buffer de Excel (.xlsx) con agrupación jerárquica y estilos configurables.
 * @param {Array} data - Datos a exportar
 * @param {String} sheetName - Nombre de la hoja
 * @param {String} logoBase64 - Logo en formato Base64 (opcional)
 * @param {Array} summaryConfig - Configuración para el cuadro de resumen (opcional)
 * @param {Object} auditMetadata - Datos de auditoría del periodo exportado (opcional)
 * @returns {Promise<ArrayBuffer>} Buffer del archivo Excel
 */
export const generateExcelBuffer = async (data, sheetName = 'Nómina', logoBase64 = null, summaryConfig = null, auditMetadata = null, firmantes = null) => {
  if (!data || data.length === 0) return null;

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(sheetName);

  // 1. Identificar columnas de jerarquía y datos
  const allHeaders = Object.keys(data[0]);
  const hierarchyKeys = ['Dirección', 'División', 'Unidad'];
  const dataHeaders = allHeaders.filter(h => !hierarchyKeys.includes(h));

  // Configurar columnas con el ancho solicitado (16 por defecto)
  worksheet.columns = dataHeaders.map(key => ({
    header: key.toUpperCase(),
    key: key,
    width: excelStyles.defaultColumnWidth || 16
  }));

  // 2. Agregar Membrete (4 filas iniciales)
  worksheet.insertRow(1, []);
  worksheet.insertRow(2, []);
  worksheet.insertRow(3, []);
  worksheet.insertRow(4, []);

  // Texto del membrete
  worksheet.mergeCells(1, 3, 1, 5);
  const title1 = worksheet.getCell(1, 3);
  title1.value = 'REPÚBLICA BOLIVARIANA DE VENEZUELA';
  title1.font = { name: 'Arial', size: 10, bold: true };
  title1.alignment = { horizontal: 'center', vertical: 'middle' };
  
  worksheet.mergeCells(2, 3, 2, 5);
  const title2 = worksheet.getCell(2, 3);
  title2.value = 'CONTRALORÍA DEL ESTADO TÁCHIRA';
  title2.font = { name: 'Arial', size: 10, bold: true };
  title2.alignment = { horizontal: 'center', vertical: 'middle' };

  const auditHeader = auditMetadata?.headerText || (
    auditMetadata?.mesObjetivo
      ? `Nómina correspondiente al mes: ${auditMetadata.mesObjetivo} | Generado el: ${auditMetadata.fechaGeneracion || new Date().toLocaleString('es-VE')}`
      : null
  );

  if (auditHeader) {
    const lastHeaderColumn = Math.max(dataHeaders.length, 5);
    worksheet.mergeCells(3, 1, 3, lastHeaderColumn);
    const auditCell = worksheet.getCell(3, 1);
    auditCell.value = auditHeader;
    auditCell.font = { name: 'Arial', size: 10, bold: true };
    auditCell.alignment = { horizontal: 'center', vertical: 'middle' };
  }

  // Agregar Logo si existe
  if (logoBase64) {
    try {
      const imageId = workbook.addImage({
        base64: logoBase64,
        extension: 'png',
      });
      worksheet.addImage(imageId, {
        tl: { col: 1.1, row: 0.1 }, // Columna B
        ext: { width: 60, height: 60 }
      });
    } catch (e) {
      console.error('Error al agregar el logo al Excel:', e);
    }
  }

  // Limpiar/Ocultar columnas en el área del membrete (Filas 1-4)
  for (let i = 1; i <= 4; i++) {
    const row = worksheet.getRow(i);
    for (let j = 1; j <= dataHeaders.length; j++) {
      const cell = row.getCell(j);
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFFFFFFF' } // Blanco sólido para ocultar rejilla
      };
    }
  }

  // 3. Estilo Encabezado de la Tabla (ahora en la fila 5)
  const headerRow = worksheet.getRow(5);
  headerRow.font = excelStyles.header.font;
  headerRow.fill = excelStyles.header.fill;
  headerRow.alignment = excelStyles.header.alignment;
  headerRow.height = excelStyles.header.height;
  headerRow.eachCell(cell => {
    cell.border = excelStyles.header.border;
  });

  // 4. Procesar datos
  let lastDir = null, lastDiv = null, lastUni = null;

  data.forEach((item) => {
    // Grupo Dirección
    if (item['Dirección'] && item['Dirección'] !== lastDir) {
      const row = worksheet.addRow({});
      row.getCell(1).value = item['Dirección'].toString().toUpperCase();
      worksheet.mergeCells(row.number, 1, row.number, dataHeaders.length);
      row.eachCell(cell => {
        cell.fill = excelStyles.direccion.fill;
        cell.font = excelStyles.direccion.font;
        cell.alignment = excelStyles.direccion.alignment;
        cell.border = excelStyles.direccion.border;
      });
      lastDir = item['Dirección']; lastDiv = null; lastUni = null;
    }

    // Grupo División
    if (item['División'] && item['División'] !== lastDiv) {
      const row = worksheet.addRow({});
      row.getCell(1).value = item['División'].toString().toUpperCase();
      worksheet.mergeCells(row.number, 1, row.number, dataHeaders.length);
      row.eachCell(cell => {
        cell.fill = excelStyles.division.fill;
        cell.font = excelStyles.division.font;
        cell.alignment = excelStyles.division.alignment;
        cell.border = excelStyles.division.border;
      });
      lastDiv = item['División']; lastUni = null;
    }

    // Grupo Unidad
    if (item['Unidad'] && item['Unidad'] !== lastUni) {
      const row = worksheet.addRow({});
      row.getCell(1).value = `UNIDAD: ${item['Unidad'].toString().toUpperCase()}`;
      worksheet.mergeCells(row.number, 1, row.number, dataHeaders.length);
      row.eachCell(cell => {
        cell.font = excelStyles.unidad.font;
        cell.alignment = excelStyles.unidad.alignment;
      });
      lastUni = item['Unidad'];
    }

    // Fila de Datos
    const dataRowValues = {};
    dataHeaders.forEach(h => { 
      const val = item[h];
      dataRowValues[h] = (typeof val === 'string') ? val.toUpperCase() : val;
    });
    const dataRow = worksheet.addRow(dataRowValues);

    dataRow.eachCell((cell, colNumber) => {
      const header = dataHeaders[colNumber - 1];
      cell.border = excelStyles.data.border;
      cell.alignment = excelStyles.data.alignment;
      cell.font = excelStyles.data.font;

      if (excelStyles.columns && excelStyles.columns[header]) {
        if (excelStyles.columns[header].fill) cell.fill = excelStyles.columns[header].fill;
        if (excelStyles.columns[header].font) cell.font = { ...cell.font, ...excelStyles.columns[header].font };
      }

      if (typeof cell.value === 'number') {
        cell.numFmt = '#,##0.00';
        cell.alignment = { ...cell.alignment, horizontal: 'right' };
        if (header.includes('SSO') || header.includes('RPE') || header.includes('FAOV') || header.includes('DEDUCCIONES')) {
          cell.font = { ...cell.font, color: { argb: excelStyles.deductionFontColor } };
        }
        if (header.includes('TOTAL') || header === 'SALARIO NETO') {
          cell.font = { ...cell.font, bold: true };
        }
      }

      if (header.includes('PATRONAL') || header.includes('PAT.')) {
        cell.font = { ...cell.font, color: { argb: excelStyles.patronalFontColor } };
      }
    });
  });

  // 5. Generar Cuadro Resumen si se provee summaryConfig
  if (summaryConfig && summaryConfig.length > 0) {
    worksheet.addRow([]);
    worksheet.addRow([]);

    // Calcular totales basados en summaryConfig
    const summaryData = summaryConfig.map(config => {
      let sum = 0;
      let count = 0;
      data.forEach(item => {
        let val = item[config.key];
        // Si el valor viene como string con formato de moneda (ej: Bs. 1.000,00), esto asume que es numérico puro en el array de data antes de exportar
        // Generalmente `dataToExport` envía números puros o se intenta parsear.
        if (typeof val === 'string') {
          val = Number(val.replace(/[^0-9,-]+/g, '').replace(',', '.'));
        }
        val = Number(val) || 0;
        
        if (val > 0) {
          sum += val;
          count++;
        }
      });
      return { ...config, sum, count };
    });

    // Header del Resumen
    const sumHeaderRow = worksheet.addRow(['CONCEPTO', 'ASIGNACIONES', 'CANTIDAD', 'DEDUCCIONES', 'NETO']);
    sumHeaderRow.eachCell((cell, colNumber) => {
      cell.font = { bold: true, size: 10 };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
      cell.border = {
        top: { style: 'thin' }, left: { style: 'thin' },
        bottom: { style: 'thin' }, right: { style: 'thin' }
      };
      if (colNumber === 2) cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE6F2FF' } }; 
      if (colNumber === 4) cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFE6E6' } };
      if (colNumber === 5) cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE6FFE6' } };
    });

    let totalAsignaciones = 0;
    let totalDeducciones = 0;
    let totalNetoConfig = 0;

    // Filas del Resumen
    summaryData.forEach(item => {
      const rowVals = [item.concepto, '', '', '', ''];
      
      if (item.type === 'asignacion') {
        rowVals[1] = item.sum;
        rowVals[2] = item.count;
        totalAsignaciones += item.sum;
      } else if (item.type === 'deduccion') {
        rowVals[2] = item.count;
        rowVals[3] = item.sum;
        totalDeducciones += item.sum;
      } else if (item.type === 'neto') {
        rowVals[2] = item.count;
        rowVals[4] = item.sum;
        totalNetoConfig += item.sum;
      }

      const sumRow = worksheet.addRow(rowVals);
      sumRow.eachCell((cell, colNumber) => {
        cell.border = {
          top: { style: 'thin' }, left: { style: 'thin' },
          bottom: { style: 'thin' }, right: { style: 'thin' }
        };
        if (colNumber > 1 && typeof cell.value === 'number') {
           if (colNumber !== 3) cell.numFmt = '#,##0.00'; 
           if (colNumber === 3) cell.numFmt = '0';
           cell.alignment = { horizontal: 'right' };
        } else if (colNumber === 1) {
           cell.font = { size: 10 };
        }

        // Colores según tipo
        if (colNumber === 2 && item.type === 'asignacion') {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE6F2FF' } }; // Azul claro
        }
        if (colNumber === 4 && item.type === 'deduccion') {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFE6E6' } }; // Rojo claro
          cell.font = { color: { argb: 'FFDC3545' } };
        }
      });
    });

    // Fila de Totales Generales
    const netoFinal = totalNetoConfig > 0 ? totalNetoConfig : (totalAsignaciones - totalDeducciones);
    const totalRow = worksheet.addRow(['TOTALES', totalAsignaciones, '', totalDeducciones, netoFinal]);
    totalRow.eachCell((cell, colNumber) => {
      cell.font = { bold: true, size: 10 };
      cell.border = {
        top: { style: 'thin' }, left: { style: 'thin' },
        bottom: { style: 'thin' }, right: { style: 'thin' }
      };
      if (colNumber > 1 && typeof cell.value === 'number') {
        cell.numFmt = '#,##0.00';
        cell.alignment = { horizontal: 'right' };
      }
      if (colNumber === 1) {
        cell.alignment = { horizontal: 'center' };
      }
      
      // Resaltar totales
      if ([2, 4, 5].includes(colNumber)) {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFF99' } }; // Amarillo claro
      }
      if (colNumber === 4) {
        cell.font = { ...cell.font, color: { argb: 'FFDC3545' } };
      }
      if (colNumber === 5) {
        cell.font = { ...cell.font, color: { argb: 'FF28A745' } };
      }
    });

    // Asegurar que la primera columna sea lo suficientemente ancha
    worksheet.getColumn(1).width = Math.max(worksheet.getColumn(1).width || 16, 40);
  }

  // 6. Ajustar anchos específicos (si existen en excelStyles.columns)
  // De lo contrario se mantiene el 16 configurado al inicio
  worksheet.columns.forEach(column => {
    const header = column.header?.toString().toUpperCase();
    // Buscar en excelStyles.columns (ignorando mayúsculas)
    const customCol = Object.keys(excelStyles.columns || {}).find(k => k.toUpperCase() === header);
    if (customCol && excelStyles.columns[customCol].width) {
      column.width = excelStyles.columns[customCol].width;
    }
  });

  // 6. Bloque de firmas dinámicas
  if (firmantes) {
    agregarBloqueFirmas(worksheet, dataHeaders.length, firmantes);
  }

  // 7. Retornar el buffer
  const buffer = await workbook.xlsx.writeBuffer();
  return buffer;
};

/**
 * Exporta un array de objetos a un archivo Excel (.xlsx) y lanza la descarga en el navegador.
 */
export const downloadExcel = async (data, fileName = 'reporte.xlsx', sheetName = 'Nómina', logoBase64 = null, summaryConfig = null, auditMetadata = null, firmantes = null) => {
  const buffer = await generateExcelBuffer(data, sheetName, logoBase64, summaryConfig, auditMetadata, firmantes);
  if (!buffer) return false;
  
  saveAs(new Blob([buffer]), fileName.endsWith('.xlsx') ? fileName : `${fileName}.xlsx`);
  return true;
};

/**
 * Exporta múltiples arrays de objetos a un archivo ZIP con los Excel dentro.
 * @param {Array} files - Array de objetos { data, fileName, sheetName, summaryConfig, auditMetadata }
 *                        Si el objeto incluye una propiedad `buffer`, se usa directamente en lugar de generar el Excel.
 * @param {String} zipName - Nombre del archivo ZIP resultante
 * @param {String} logoBase64 - Logo en formato Base64 (opcional)
 */
export const downloadExcelZip = async (files, zipName, logoBase64 = null, firmantes = null) => {
  const JSZip = (await import('jszip')).default;
  const zip = new JSZip();

  for (const file of files) {
    let buffer;
    if (file.buffer) {
      buffer = file.buffer;
    } else {
      buffer = await generateExcelBuffer(file.data, file.sheetName, logoBase64, file.summaryConfig, file.auditMetadata, firmantes);
    }
    if (buffer) {
      zip.file(file.fileName.endsWith('.xlsx') ? file.fileName : `${file.fileName}.xlsx`, buffer);
    }
  }

  const content = await zip.generateAsync({ type: 'blob' });
  saveAs(content, zipName.endsWith('.zip') ? zipName : `${zipName}.zip`);
  return true;
};

// ─── Conceptos del reporte resumen mensual ────────────────────────────────

const CONCEPTOS_RESUMEN = [
  // Asignaciones
  { key: 'Sueldo Mensual', label: 'SUELDO BÁSICO MENSUAL', type: 'asignacion' },
  { key: 'Antigüedad Mensual', label: 'ANTIGÜEDAD MENSUAL', type: 'asignacion' },
  { key: 'Prof. Mensual', label: 'PROFESIONALIZACIÓN MENSUAL', type: 'asignacion' },
  { key: 'P. Jerarquía Mensual', label: 'PRIMA DE JERARQUÍA MENSUAL', type: 'asignacion' },
  { key: 'P. Transporte Mensual', label: 'PRIMA DE TRANSPORTE MENSUAL', type: 'asignacion' },
  { key: 'P. Reconocim. Mensual', label: 'PRIMA DE RECONOCIMIENTO MENSUAL', type: 'asignacion' },
  { key: 'P. Hogares Mensual', label: 'PRIMA DE HOGARES MENSUAL', type: 'asignacion' },
  { key: 'Comp. Alim. Mensual', label: 'COMPLEMENTO DE ALIMENTACIÓN MENSUAL', type: 'asignacion' },
  { key: 'P. Hijos Mensual', label: 'PRIMA POR HIJOS MENSUAL', type: 'asignacion' },
  { key: 'Dif. Sueldo Mensual', label: 'DIFERENCIA DE SUELDO BÁSICO MENSUAL', type: 'asignacion' },
  { key: 'Dif. Antigüedad Mensual', label: 'DIFERENCIA DE ANTIGÜEDAD MENSUAL', type: 'asignacion' },
  { key: 'Dif. Prof. Mensual', label: 'DIFERENCIA DE PROFESIONALIZACIÓN MENSUAL', type: 'asignacion' },
  { key: 'Dif. Jerarquía Mensual', label: 'DIFERENCIA DE JERARQUÍA MENSUAL', type: 'asignacion' },
  { key: 'Retroactivo Mensual', label: 'RETROACTIVO MENSUAL', type: 'asignacion' },
  // Deducciones
  { key: 'SSO Empleado Mensual', label: 'SEGURO SOCIAL OBLIGATORIO (IVSS)', type: 'deduccion' },
  { key: 'RPE Empleado Mensual', label: 'RÉGIMEN PRESTACIONAL DE EMPLEO', type: 'deduccion' },
  { key: 'FAOV Empleado Mensual', label: 'FONDO DE AHORRO OBLIGATORIO PARA LA VIVIENDA', type: 'deduccion' },
  { key: 'FEJP Empleado Mensual', label: 'FONDO ESPECIAL DE JUBILACIONES Y PENSIONES', type: 'deduccion' },
  { key: 'Caja Ahorro Empleado Mensual', label: 'CAJA DE AHORROS', type: 'deduccion' },
  // Aportes patronales
  { key: 'SSO Patronal Mensual', label: 'APORTE PATRONAL SEGURO SOCIAL OBLIGATORIO', type: 'aporte' },
  { key: 'RPE Patronal Mensual', label: 'APORTE PATRONAL RÉGIMEN PRESTACIONAL DE EMPLEO', type: 'aporte' },
  { key: 'FAOV Patronal Mensual', label: 'APORTE PATRONAL FONDO DE AHORRO OBLIGATORIO VIVIENDA', type: 'aporte' },
  { key: 'FEJP Patronal Mensual', label: 'APORTE PATRONAL FONDO DE JUBILACIONES Y PENSIONES', type: 'aporte' },
  { key: 'Caja Ahorro Patronal Mensual', label: 'APORTE PATRONAL CAJA DE AHORROS', type: 'aporte' }
];

const LIGHT_BLUE = 'FFE6F2FF';
const TOTAL_YELLOW = 'FFFFFF99';
const BORDER_GRAY = 'FFD3D3D3';

/**
 * Genera el buffer del Excel de Resumen Mensual con formato de reporte institucional,
 * usando un layout de conceptos (filas) vs. columnas contables (ASIGNACIONES | CANTIDAD | DEDUCCIONES | APORTES | NETO).
 *
 * @param {Array} data - Datos planos por empleado (salida de buildExportDataMensual)
 * @param {Object} auditMetadata - { mesObjetivo, fechaGeneracion }
 * @param {String} logoBase64 - Logo en Base64 (opcional)
 * @returns {Promise<ArrayBuffer|null>}
 */
export const generateExcelResumenMensual = async (data, auditMetadata, logoBase64 = null, firmantes = null) => {
  if (!data || data.length === 0) return null;

  // 1. Agregar por concepto desde los datos de empleados
  const conceptRows = CONCEPTOS_RESUMEN.map(c => {
    let total = 0;
    let count = 0;
    data.forEach(emp => {
      const val = Number(emp[c.key]) || 0;
      if (val > 0) { total += val; count++; }
    });
    return { label: c.label, total, count, type: c.type };
  });

  const workbook = new ExcelJS.Workbook();
  const ws = workbook.addWorksheet('Resumen Mensual');

  // Columnas del reporte
  ws.columns = [
    { header: 'CONCEPTO', key: 'concepto', width: 48 },
    { header: 'ASIGNACIONES', key: 'asignaciones', width: 18 },
    { header: 'CANTIDAD', key: 'cantidad', width: 12 },
    { header: 'DEDUCCIONES', key: 'deducciones', width: 18 },
    { header: 'APORTES', key: 'aportes', width: 18 },
    { header: 'NETO', key: 'neto', width: 18 }
  ];

  // ─── Membrete (filas 1-4) ───────────────────────────────────────────────
  [1, 2, 3, 4].forEach(i => ws.insertRow(i, []));

  ws.mergeCells(1, 1, 1, 6);
  const t1 = ws.getCell(1, 1);
  t1.value = 'REPÚBLICA BOLIVARIANA DE VENEZUELA';
  t1.font = { name: 'Arial', size: 11, bold: true };
  t1.alignment = { horizontal: 'center', vertical: 'middle' };

  ws.mergeCells(2, 1, 2, 6);
  const t2 = ws.getCell(2, 1);
  t2.value = 'CONTRALORÍA DEL ESTADO TÁCHIRA';
  t2.font = { name: 'Arial', size: 11, bold: true };
  t2.alignment = { horizontal: 'center', vertical: 'middle' };

  if (auditMetadata?.mesObjetivo) {
    ws.mergeCells(3, 1, 3, 6);
    const auditCell = ws.getCell(3, 1);
    auditCell.value = `RESUMEN MENSUAL DE NÓMINA - ${auditMetadata.mesObjetivo} | Generado el: ${auditMetadata.fechaGeneracion || new Date().toLocaleString('es-VE')}`;
    auditCell.font = { name: 'Arial', size: 10, bold: true };
    auditCell.alignment = { horizontal: 'center', vertical: 'middle' };
  }

  if (logoBase64) {
    try {
      const imageId = workbook.addImage({ base64: logoBase64, extension: 'png' });
      ws.addImage(imageId, { tl: { col: 0.1, row: 0.1 }, ext: { width: 60, height: 60 } });
    } catch (e) {
      console.error('Error al agregar el logo al Excel Resumen:', e);
    }
  }

  // Ocultar rejilla en membrete
  for (let i = 1; i <= 4; i++) {
    for (let j = 1; j <= 6; j++) {
      ws.getRow(i).getCell(j).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFFFF' } };
    }
  }

  // ─── Fila de encabezado (fila 5) ────────────────────────────────────────
  const headerRow = ws.getRow(5);
  headerRow.height = 30;
  ['CONCEPTO', 'ASIGNACIONES', 'CANTIDAD', 'DEDUCCIONES', 'APORTES', 'NETO'].forEach((h, i) => {
    const cell = headerRow.getCell(i + 1);
    cell.value = h;
    cell.font = { name: 'Arial', size: 10, bold: true };
    cell.alignment = { horizontal: i === 0 ? 'left' : 'center', vertical: 'middle', wrapText: true };
    cell.border = {
      top: { style: 'thin', color: { argb: BORDER_GRAY } },
      left: { style: 'thin', color: { argb: BORDER_GRAY } },
      bottom: { style: 'thin', color: { argb: BORDER_GRAY } },
      right: { style: 'thin', color: { argb: BORDER_GRAY } }
    };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF2F2F2' } };
  });

  // ─── Filas de datos (desde fila 6) ──────────────────────────────────────
  const firstDataRow = 6;
  conceptRows.forEach((row, idx) => {
    const rowNum = firstDataRow + idx;
    const r = ws.getRow(rowNum);
    r.height = 20;

    const isAsignacion = row.type === 'asignacion';
    const isDeduccion = row.type === 'deduccion';
    const isAporte = row.type === 'aporte';

    // Fondo: azul claro para asignaciones, blanco para deducciones/aportes
    const bgColor = isAsignacion ? LIGHT_BLUE : 'FFFFFFFF';

    const thinBorder = {
      top: { style: 'thin', color: { argb: BORDER_GRAY } },
      left: { style: 'thin', color: { argb: BORDER_GRAY } },
      bottom: { style: 'thin', color: { argb: BORDER_GRAY } },
      right: { style: 'thin', color: { argb: BORDER_GRAY } }
    };

    // Col A: Concepto
    const cA = r.getCell(1);
    cA.value = row.label;
    cA.font = { name: 'Arial', size: 10 };
    cA.alignment = { horizontal: 'left', vertical: 'middle' };
    cA.border = thinBorder;
    cA.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bgColor } };

    // Col B: Asignaciones
    const cB = r.getCell(2);
    cB.value = isAsignacion ? row.total : 0;
    cB.numFmt = '#,##0.00';
    cB.font = { name: 'Arial', size: 10 };
    cB.alignment = { horizontal: 'right', vertical: 'middle' };
    cB.border = thinBorder;
    cB.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bgColor } };

    // Col C: Cantidad
    const cC = r.getCell(3);
    cC.value = row.count;
    cC.numFmt = '0';
    cC.font = { name: 'Arial', size: 10 };
    cC.alignment = { horizontal: 'center', vertical: 'middle' };
    cC.border = thinBorder;
    cC.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bgColor } };

    // Col D: Deducciones
    const cD = r.getCell(4);
    cD.value = isDeduccion ? row.total : 0;
    cD.numFmt = '#,##0.00';
    cD.font = { name: 'Arial', size: 10, color: { argb: isDeduccion ? 'FFDC3545' : 'FF000000' } };
    cD.alignment = { horizontal: 'right', vertical: 'middle' };
    cD.border = thinBorder;
    cD.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bgColor } };

    // Col E: Aportes
    const cE = r.getCell(5);
    cE.value = isAporte ? row.total : 0;
    cE.numFmt = '#,##0.00';
    cE.font = { name: 'Arial', size: 10, color: { argb: 'FF6C757D' } };
    cE.alignment = { horizontal: 'right', vertical: 'middle' };
    cE.border = thinBorder;
    cE.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bgColor } };

    // Col F: Neto (fórmula nativa = ASIGNACIONES - DEDUCCIONES)
    const cF = r.getCell(6);
    cF.value = { formula: `B${rowNum}-D${rowNum}`, result: row.total - (isDeduccion ? row.total : 0) };
    cF.numFmt = '#,##0.00';
    cF.font = { name: 'Arial', size: 10, bold: !isAsignacion };
    cF.alignment = { horizontal: 'right', vertical: 'middle' };
    cF.border = thinBorder;
    cF.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bgColor } };
  });

  // ─── Fila de totales con SUM ────────────────────────────────────────────
  const lastDataRow = firstDataRow + conceptRows.length - 1;
  const totalRowNum = lastDataRow + 1;
  const totalRow = ws.getRow(totalRowNum);
  totalRow.height = 24;

  const totalBorder = {
    top: { style: 'thin', color: { argb: BORDER_GRAY } },
    left: { style: 'thin', color: { argb: BORDER_GRAY } },
    bottom: { style: 'double', color: { argb: 'FF000000' } },
    right: { style: 'thin', color: { argb: BORDER_GRAY } }
  };
  const totalFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: TOTAL_YELLOW } };

  const cTotA = totalRow.getCell(1);
  cTotA.value = 'TOTALES';
  cTotA.font = { name: 'Arial', size: 10, bold: true };
  cTotA.alignment = { horizontal: 'center', vertical: 'middle' };
  cTotA.border = totalBorder;
  cTotA.fill = totalFill;

  const cTotB = totalRow.getCell(2);
  cTotB.value = { formula: `SUM(B${firstDataRow}:B${lastDataRow})` };
  cTotB.numFmt = '#,##0.00';
  cTotB.font = { name: 'Arial', size: 10, bold: true };
  cTotB.alignment = { horizontal: 'right', vertical: 'middle' };
  cTotB.border = totalBorder;
  cTotB.fill = totalFill;

  const cTotC = totalRow.getCell(3);
  cTotC.value = { formula: `SUM(C${firstDataRow}:C${lastDataRow})` };
  cTotC.numFmt = '0';
  cTotC.font = { name: 'Arial', size: 10, bold: true };
  cTotC.alignment = { horizontal: 'center', vertical: 'middle' };
  cTotC.border = totalBorder;
  cTotC.fill = totalFill;

  const cTotD = totalRow.getCell(4);
  cTotD.value = { formula: `SUM(D${firstDataRow}:D${lastDataRow})` };
  cTotD.numFmt = '#,##0.00';
  cTotD.font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FFDC3545' } };
  cTotD.alignment = { horizontal: 'right', vertical: 'middle' };
  cTotD.border = totalBorder;
  cTotD.fill = totalFill;

  const cTotE = totalRow.getCell(5);
  cTotE.value = { formula: `SUM(E${firstDataRow}:E${lastDataRow})` };
  cTotE.numFmt = '#,##0.00';
  cTotE.font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FF6C757D' } };
  cTotE.alignment = { horizontal: 'right', vertical: 'middle' };
  cTotE.border = totalBorder;
  cTotE.fill = totalFill;

  const cTotF = totalRow.getCell(6);
  cTotF.value = { formula: `SUM(F${firstDataRow}:F${lastDataRow})` };
  cTotF.numFmt = '#,##0.00';
  cTotF.font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FF157347' } };
  cTotF.alignment = { horizontal: 'right', vertical: 'middle' };
  cTotF.border = totalBorder;
  cTotF.fill = totalFill;

  // ─── Bloque de firmas dinámicas ─────────────────────────────────────────
  if (firmantes) {
    agregarBloqueFirmas(ws, 6, firmantes);
  }

  return await workbook.xlsx.writeBuffer();
};
