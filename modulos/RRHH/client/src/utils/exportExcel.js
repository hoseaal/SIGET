import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { excelStyles } from '../data/excelStyles';

const CET_BLUE = '003366';

/**
 * Norma institucional: El Contralor del Estado encabeza la nómina,
 * seguido de una línea en blanco y luego el resto ordenado por
 * Dirección → División → Unidad → Apellidos.
 *
 * @param {Array} rows - Filas de datos con claves de objeto.
 * @param {Object} opts - { dirKey, divKey, uniKey, cargoKey, apellidoKey }
 * @returns {Array} Arreglo reordenado con una fila «spacer» entre el Contralor y el resto.
 */
export function aplicarNormaContralor(rows, opts = {}) {
  const {
    cargoKey = 'Cargo CET',
    dirKey = 'Dirección',
    divKey = 'División',
    uniKey = 'Unidad',
    apellidoKey = 'Apellidos',
    spacerValue = { __spacer: true }
  } = opts

  const esContralor = (row) => {
    const cargo = String(row[cargoKey] || '').toUpperCase()
    return cargo.includes('CONTRALOR') && (cargo.includes('ESTADO') || cargo.includes('GENERAL'))
  }

  const contralores = rows.filter(esContralor)
  const resto = rows
    .filter(r => !esContralor(r))
    .sort((a, b) => {
      const d = String(a[dirKey] || '').localeCompare(String(b[dirKey] || ''))
      if (d !== 0) return d
      const v = String(a[divKey] || '').localeCompare(String(b[divKey] || ''))
      if (v !== 0) return v
      const u = String(a[uniKey] || '').localeCompare(String(b[uniKey] || ''))
      if (u !== 0) return u
      return String(a[apellidoKey] || '').localeCompare(String(b[apellidoKey] || ''))
    })

  return contralores.length > 0
    ? [...contralores, spacerValue, ...resto]
    : resto
}

const THIN_BORDER = {
  top: { style: 'thin' }, left: { style: 'thin' },
  bottom: { style: 'thin' }, right: { style: 'thin' },
};

// ─── Helper: bloque de firmas dinámicas ────────────────────────────────────

function agregarBloqueFirmas(ws, totalColumns, firmantes) {
  if (!firmantes || firmantes.length < 4) {
    firmantes = [
      { nombre_completo: '[Por Asignar]', cargo_firma: 'DIRECTOR(A) DE RECURSOS HUMANOS' },
      { nombre_completo: '[Por Asignar]', cargo_firma: 'JEFE DE DIVISIÓN GENERAL DE RECURSOS HUMANOS' },
      { nombre_completo: '[Por Asignar]', cargo_firma: 'JEFE DE DIVISIÓN DE REMUNERACIONES' },
      { nombre_completo: '[Por Asignar]', cargo_firma: 'ASISTENTE ADMINISTRATIVO' }
    ];
  }

  for (let i = 0; i < 3; i++) ws.addRow([]);

  const halfCol = Math.floor(totalColumns / 2);

  const pares = [
    [firmantes[0], firmantes[1]],
    [firmantes[2], firmantes[3]]
  ];

  pares.forEach(pair => {
    const lineRow = ws.addRow([]);
    const nameRow = ws.addRow([]);
    nameRow.height = 22;
    const titleRow = ws.addRow([]);
    titleRow.height = 18;

    pair.forEach((f, idx) => {
      const startCol = idx === 0 ? 1 : halfCol + 1;
      const endCol = idx === 0 ? halfCol : totalColumns;

      ws.mergeCells(lineRow.number, startCol, lineRow.number, endCol);
      const lineCell = lineRow.getCell(startCol);
      lineCell.border = {
        top: { style: 'thin', color: { argb: 'FF000000' } },
        bottom: { style: 'thin', color: { argb: 'FFFFFFFF' } }
      };

      ws.mergeCells(nameRow.number, startCol, nameRow.number, endCol);
      const nameCell = nameRow.getCell(startCol);
      nameCell.value = f.nombre_completo || '[Por Asignar]';
      nameCell.font = { name: 'Arial', size: 11, bold: true };
      nameCell.alignment = { horizontal: 'center', vertical: 'middle' };

      ws.mergeCells(titleRow.number, startCol, titleRow.number, endCol);
      const titleCell = titleRow.getCell(startCol);
      titleCell.value = f.cargo_firma || '';
      titleCell.font = { name: 'Arial', size: 9, italic: false };
      titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
    });
  });
}

export const generateExcelBuffer = async (data, sheetName = 'Nómina', logoBase64 = null, summaryConfig = null, auditMetadata = null, firmantes = null) => {
  if (!data || data.length === 0) return null;

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(sheetName);

  const allHeaders = Object.keys(data[0]);
  const hierarchyKeys = ['Dirección', 'División', 'Unidad'];
  const dataHeaders = allHeaders.filter(h => !hierarchyKeys.includes(h));

  worksheet.columns = dataHeaders.map(key => ({
    header: key.toUpperCase(),
    key: key,
    width: excelStyles.defaultColumnWidth || 16
  }));

  worksheet.insertRow(1, []);
  worksheet.insertRow(2, []);
  worksheet.insertRow(3, []);
  worksheet.insertRow(4, []);

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

  if (logoBase64) {
    try {
      const imageId = workbook.addImage({ base64: logoBase64, extension: 'png' });
      worksheet.addImage(imageId, { tl: { col: 1.1, row: 0.1 }, ext: { width: 60, height: 60 } });
    } catch (e) {
      console.error('Error al agregar el logo al Excel:', e);
    }
  }

  for (let i = 1; i <= 4; i++) {
    const row = worksheet.getRow(i);
    for (let j = 1; j <= dataHeaders.length; j++) {
      const cell = row.getCell(j);
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFFFF' } };
    }
  }

  const headerRow = worksheet.getRow(5);
  headerRow.font = excelStyles.header.font;
  headerRow.fill = excelStyles.header.fill;
  headerRow.alignment = excelStyles.header.alignment;
  headerRow.height = excelStyles.header.height;
  headerRow.eachCell(cell => { cell.border = excelStyles.header.border; });

  let lastDir = null, lastDiv = null, lastUni = null;

  // Norma institucional: Contralor del Estado de primero + línea en blanco
  const dataOrdenada = aplicarNormaContralor(data, {
    cargoKey: 'Cargo CET',
    dirKey: 'Dirección',
    divKey: 'División',
    uniKey: 'Unidad',
    apellidoKey: 'Apellidos'
  })

  dataOrdenada.forEach((item) => {
    // Fila espaciadora (entre Contralor y el resto)
    if (item.__spacer) {
      worksheet.addRow({})
      lastDir = null; lastDiv = null; lastUni = null
      return
    }

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

  if (summaryConfig && summaryConfig.length > 0) {
    worksheet.addRow([]);
    worksheet.addRow([]);

    const summaryData = summaryConfig.map(config => {
      let sum = 0;
      let count = 0;
      data.forEach(item => {
        let val = item[config.key];
        if (typeof val === 'string') {
          val = Number(val.replace(/[^0-9,-]+/g, '').replace(',', '.'));
        }
        val = Number(val) || 0;
        if (val > 0) { sum += val; count++; }
      });
      return { ...config, sum, count };
    });

    const sumHeaderRow = worksheet.addRow(['CONCEPTO', 'ASIGNACIONES', 'CANTIDAD', 'DEDUCCIONES', 'NETO']);
    sumHeaderRow.eachCell((cell, colNumber) => {
      cell.font = { bold: true, size: 10 };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
      cell.border = THIN_BORDER;
      if (colNumber === 2) cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE6F2FF' } };
      if (colNumber === 4) cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFE6E6' } };
      if (colNumber === 5) cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE6FFE6' } };
    });

    let totalAsignaciones = 0, totalDeducciones = 0, totalNetoConfig = 0;

    summaryData.forEach(item => {
      const rowVals = [item.concepto, '', '', '', ''];
      if (item.type === 'asignacion') { rowVals[1] = item.sum; rowVals[2] = item.count; totalAsignaciones += item.sum; }
      else if (item.type === 'deduccion') { rowVals[2] = item.count; rowVals[3] = item.sum; totalDeducciones += item.sum; }
      else if (item.type === 'neto') { rowVals[2] = item.count; rowVals[4] = item.sum; totalNetoConfig += item.sum; }

      const sumRow = worksheet.addRow(rowVals);
      sumRow.eachCell((cell, colNumber) => {
        cell.border = THIN_BORDER;
        if (colNumber > 1 && typeof cell.value === 'number') {
          if (colNumber !== 3) cell.numFmt = '#,##0.00';
          if (colNumber === 3) cell.numFmt = '0';
          cell.alignment = { horizontal: 'right' };
        } else if (colNumber === 1) { cell.font = { size: 10 }; }
        if (colNumber === 2 && item.type === 'asignacion') cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE6F2FF' } };
        if (colNumber === 4 && item.type === 'deduccion') { cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFE6E6' } }; cell.font = { color: { argb: 'FFDC3545' } }; }
      });
    });

    const netoFinal = totalNetoConfig > 0 ? totalNetoConfig : (totalAsignaciones - totalDeducciones);
    const totalRow = worksheet.addRow(['TOTALES', totalAsignaciones, '', totalDeducciones, netoFinal]);
    totalRow.eachCell((cell, colNumber) => {
      cell.font = { bold: true, size: 10 };
      cell.border = THIN_BORDER;
      if (colNumber > 1 && typeof cell.value === 'number') { cell.numFmt = '#,##0.00'; cell.alignment = { horizontal: 'right' }; }
      if (colNumber === 1) cell.alignment = { horizontal: 'center' };
      if ([2, 4, 5].includes(colNumber)) cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFF99' } };
      if (colNumber === 4) cell.font = { ...cell.font, color: { argb: 'FFDC3545' } };
      if (colNumber === 5) cell.font = { ...cell.font, color: { argb: 'FF28A745' } };
    });

    worksheet.getColumn(1).width = Math.max(worksheet.getColumn(1).width || 16, 40);
  }

  worksheet.columns.forEach(column => {
    const header = column.header?.toString().toUpperCase();
    const customCol = Object.keys(excelStyles.columns || {}).find(k => k.toUpperCase() === header);
    if (customCol && excelStyles.columns[customCol].width) column.width = excelStyles.columns[customCol].width;
  });

  if (firmantes) agregarBloqueFirmas(worksheet, dataHeaders.length, firmantes);

  return await workbook.xlsx.writeBuffer();
};

export const downloadExcel = async (data, fileName = 'reporte.xlsx', sheetName = 'Nómina', logoBase64 = null, summaryConfig = null, auditMetadata = null, firmantes = null) => {
  const buffer = await generateExcelBuffer(data, sheetName, logoBase64, summaryConfig, auditMetadata, firmantes);
  if (!buffer) return false;
  saveAs(new Blob([buffer]), fileName.endsWith('.xlsx') ? fileName : `${fileName}.xlsx`);
  return true;
};

export const downloadExcelZip = async (files, zipName, logoBase64 = null, firmantes = null) => {
  const JSZip = (await import('jszip')).default;
  const zip = new JSZip();
  for (const file of files) {
    let buffer;
    if (file.buffer) { buffer = file.buffer; }
    else { buffer = await generateExcelBuffer(file.data, file.sheetName, logoBase64, file.summaryConfig, file.auditMetadata, firmantes); }
    if (buffer) zip.file(file.fileName.endsWith('.xlsx') ? file.fileName : `${file.fileName}.xlsx`, buffer);
  }
  const content = await zip.generateAsync({ type: 'blob' });
  saveAs(content, zipName.endsWith('.zip') ? zipName : `${zipName}.zip`);
  return true;
};

const CONCEPTOS_RESUMEN = [
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
  { key: 'SSO Empleado Mensual', label: 'SEGURO SOCIAL OBLIGATORIO (IVSS)', type: 'deduccion' },
  { key: 'RPE Empleado Mensual', label: 'RÉGIMEN PRESTACIONAL DE EMPLEO', type: 'deduccion' },
  { key: 'FAOV Empleado Mensual', label: 'FONDO DE AHORRO OBLIGATORIO PARA LA VIVIENDA', type: 'deduccion' },
  { key: 'FEJP Empleado Mensual', label: 'FONDO ESPECIAL DE JUBILACIONES Y PENSIONES', type: 'deduccion' },
  { key: 'Caja Ahorro Empleado Mensual', label: 'CAJA DE AHORROS', type: 'deduccion' },
  { key: 'SSO Patronal Mensual', label: 'APORTE PATRONAL SEGURO SOCIAL OBLIGATORIO', type: 'aporte' },
  { key: 'RPE Patronal Mensual', label: 'APORTE PATRONAL RÉGIMEN PRESTACIONAL DE EMPLEO', type: 'aporte' },
  { key: 'FAOV Patronal Mensual', label: 'APORTE PATRONAL FONDO DE AHORRO OBLIGATORIO VIVIENDA', type: 'aporte' },
  { key: 'FEJP Patronal Mensual', label: 'APORTE PATRONAL FONDO DE JUBILACIONES Y PENSIONES', type: 'aporte' },
  { key: 'Caja Ahorro Patronal Mensual', label: 'APORTE PATRONAL CAJA DE AHORROS', type: 'aporte' }
];

const LIGHT_BLUE = 'FFE6F2FF';
const TOTAL_YELLOW = 'FFFFFF99';
const BORDER_GRAY = 'FFD3D3D3';

export const generateExcelResumenMensual = async (data, auditMetadata, logoBase64 = null, firmantes = null) => {
  if (!data || data.length === 0) return null;

  const conceptRows = CONCEPTOS_RESUMEN.map(c => {
    let total = 0, count = 0;
    data.forEach(emp => { const val = Number(emp[c.key]) || 0; if (val > 0) { total += val; count++; } });
    return { label: c.label, total, count, type: c.type };
  });

  const workbook = new ExcelJS.Workbook();
  const ws = workbook.addWorksheet('Resumen Mensual');

  ws.columns = [
    { header: 'CONCEPTO', key: 'concepto', width: 48 },
    { header: 'ASIGNACIONES', key: 'asignaciones', width: 18 },
    { header: 'CANTIDAD', key: 'cantidad', width: 12 },
    { header: 'DEDUCCIONES', key: 'deducciones', width: 18 },
    { header: 'APORTES', key: 'aportes', width: 18 },
    { header: 'NETO', key: 'neto', width: 18 }
  ];

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
    } catch (e) { console.error('Error al agregar el logo al Excel Resumen:', e); }
  }

  for (let i = 1; i <= 4; i++) {
    for (let j = 1; j <= 6; j++) {
      ws.getRow(i).getCell(j).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFFFF' } };
    }
  }

  const headerRow = ws.getRow(5);
  headerRow.height = 30;
  ['CONCEPTO', 'ASIGNACIONES', 'CANTIDAD', 'DEDUCCIONES', 'APORTES', 'NETO'].forEach((h, i) => {
    const cell = headerRow.getCell(i + 1);
    cell.value = h;
    cell.font = { name: 'Arial', size: 10, bold: true };
    cell.alignment = { horizontal: i === 0 ? 'left' : 'center', vertical: 'middle', wrapText: true };
    cell.border = THIN_BORDER;
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF2F2F2' } };
  });

  const firstDataRow = 6;
  conceptRows.forEach((row, idx) => {
    const rowNum = firstDataRow + idx;
    const r = ws.getRow(rowNum);
    r.height = 20;

    const isAsignacion = row.type === 'asignacion';
    const isDeduccion = row.type === 'deduccion';
    const isAporte = row.type === 'aporte';
    const bgColor = isAsignacion ? LIGHT_BLUE : 'FFFFFFFF';

    const cA = r.getCell(1);
    cA.value = row.label;
    cA.font = { name: 'Arial', size: 10 };
    cA.alignment = { horizontal: 'left', vertical: 'middle' };
    cA.border = THIN_BORDER;
    cA.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bgColor } };

    const cB = r.getCell(2);
    cB.value = isAsignacion ? row.total : 0;
    cB.numFmt = '#,##0.00';
    cB.font = { name: 'Arial', size: 10 };
    cB.alignment = { horizontal: 'right', vertical: 'middle' };
    cB.border = THIN_BORDER;
    cB.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bgColor } };

    const cC = r.getCell(3);
    cC.value = row.count;
    cC.numFmt = '0';
    cC.font = { name: 'Arial', size: 10 };
    cC.alignment = { horizontal: 'center', vertical: 'middle' };
    cC.border = THIN_BORDER;
    cC.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bgColor } };

    const cD = r.getCell(4);
    cD.value = isDeduccion ? row.total : 0;
    cD.numFmt = '#,##0.00';
    cD.font = { name: 'Arial', size: 10, color: { argb: isDeduccion ? 'FFDC3545' : 'FF000000' } };
    cD.alignment = { horizontal: 'right', vertical: 'middle' };
    cD.border = THIN_BORDER;
    cD.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bgColor } };

    const cE = r.getCell(5);
    cE.value = isAporte ? row.total : 0;
    cE.numFmt = '#,##0.00';
    cE.font = { name: 'Arial', size: 10, color: { argb: 'FF6C757D' } };
    cE.alignment = { horizontal: 'right', vertical: 'middle' };
    cE.border = THIN_BORDER;
    cE.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bgColor } };

    const cF = r.getCell(6);
    cF.value = { formula: `B${rowNum}-D${rowNum}`, result: row.total - (isDeduccion ? row.total : 0) };
    cF.numFmt = '#,##0.00';
    cF.font = { name: 'Arial', size: 10, bold: !isAsignacion };
    cF.alignment = { horizontal: 'right', vertical: 'middle' };
    cF.border = THIN_BORDER;
    cF.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bgColor } };
  });

  const lastDataRow = firstDataRow + conceptRows.length - 1;
  const totalRowNum = lastDataRow + 1;
  const totalRow = ws.getRow(totalRowNum);
  totalRow.height = 24;

  const totalBorder = { top: { style: 'thin', color: { argb: BORDER_GRAY } }, left: { style: 'thin', color: { argb: BORDER_GRAY } }, bottom: { style: 'double', color: { argb: 'FF000000' } }, right: { style: 'thin', color: { argb: BORDER_GRAY } } };
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

  if (firmantes) agregarBloqueFirmas(ws, 6, firmantes);

  return await workbook.xlsx.writeBuffer();
};

// ─── New: Simple export for ReportTable ─────────────────────────────────────

const CET_LIGHT_BLUE = 'D6E4F0';
const SUBTOTAL_FILL = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF2F2F2' } };
const GROUP_HEADER_FILL = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE8F0FE' } };
const HEADER_FILL = { type: 'pattern', pattern: 'solid', fgColor: { argb: CET_BLUE } };
const HEADER_FONT = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FFFFFF' } };
const BODY_FONT = { name: 'Calibri', size: 10 };

function writeGroupedData(ws, columns, data, groupBy, startRow) {
  const groups = {}
  data.forEach(row => {
    const key = row[groupBy] || 'Sin Tipo'
    if (!groups[key]) groups[key] = []
    groups[key].push(row)
  })

  const currencyIndices = columns.map((col, i) => col.type === 'currency' ? i : -1).filter(i => i >= 0)
  const groupKeys = Object.keys(groups)
  const labelMap = { 'Funcionario': 'FUNCIONARIOS', 'Obrero Fijo': 'OBREROS', 'Jubilado': 'JUBILADOS', 'Pensionado': 'PENSIONADOS', 'Sobreviviente': 'SOBREVIVIENTES' }

  let currentRow = startRow
  let firstGroup = true

  groupKeys.forEach(key => {
    const groupData = groups[key]
    const label = labelMap[key] || key.toUpperCase()

    if (!firstGroup) {
      ws.getRow(currentRow).height = 6
      currentRow++
    }
    firstGroup = false

    ws.mergeCells(currentRow, 1, currentRow, columns.length)
    const groupRow = ws.getRow(currentRow)
    groupRow.height = 22
    const groupCell = groupRow.getCell(1)
    groupCell.value = `» ${label}`
    groupCell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: '003366' } }
    groupCell.fill = GROUP_HEADER_FILL
    groupCell.alignment = { horizontal: 'left', vertical: 'middle' }
    groupCell.border = { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } }
    currentRow++

    const headerRow = ws.getRow(currentRow)
    headerRow.height = 20
    columns.forEach((col, i) => {
      const cell = headerRow.getCell(i + 1)
      cell.value = col.header
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'D6E4F0' } }
      cell.font = { name: 'Calibri', size: 10, bold: true }
      cell.alignment = { horizontal: col.align || 'left', vertical: 'middle' }
      cell.border = THIN_BORDER
    })
    currentRow++

    groupData.forEach(row => {
      const excelRow = ws.getRow(currentRow)
      excelRow.height = 18
      columns.forEach((col, colIdx) => {
        const cell = excelRow.getCell(colIdx + 1)
        const val = col.accessor ? row[col.accessor] : (col.format ? col.format(row) : '')
        cell.value = val != null ? val : ''
        cell.font = BODY_FONT
        cell.alignment = { horizontal: col.align || 'left', vertical: 'middle' }
        cell.border = THIN_BORDER
        if (col.type === 'currency' && typeof val === 'number') {
          cell.numFmt = '#,##0.00'
        }
      })
      currentRow++
    })

    const subRow = ws.getRow(currentRow)
    subRow.height = 20
    subRow.getCell(1).value = `Subtotal ${key === 'Obrero Fijo' ? 'Obrero' : key}`
    subRow.getCell(1).font = { name: 'Calibri', size: 10, bold: true }
    subRow.getCell(1).fill = SUBTOTAL_FILL
    subRow.getCell(1).border = THIN_BORDER
    for (let i = 2; i <= columns.length; i++) {
      subRow.getCell(i).fill = SUBTOTAL_FILL
      subRow.getCell(i).border = THIN_BORDER
      subRow.getCell(i).font = { name: 'Calibri', size: 10, bold: true }
    }
    currencyIndices.forEach(colIdx => {
      const col = columns[colIdx]
      const sum = groupData.reduce((s, r) => s + (Number(r[col.accessor]) || 0), 0)
      const cell = subRow.getCell(colIdx + 1)
      cell.value = sum
      cell.numFmt = '#,##0.00'
      cell.alignment = { horizontal: 'right', vertical: 'middle' }
    })
    currentRow++
  })

  return currentRow
}

export async function exportToExcel({ columns, data, title, filename, summaryConfig, groupBy }) {
  const wb = new ExcelJS.Workbook();
  wb.creator = 'SIGET - RRHH';
  wb.created = new Date();

  const safeName = (title || 'Reporte').replace(/[*?:\\\/\[\]]/g, '').slice(0, 31);
  const ws = wb.addWorksheet(safeName);

  const totalCols = Math.max(columns.length, summaryConfig?.columns?.length || 0, 8);
  const lastColLetter = String.fromCharCode(64 + Math.min(totalCols, 26));

  ws.mergeCells('A1', `${lastColLetter}1`);
  const logoCell = ws.getCell('A1');
  logoCell.value = 'CONTRALORÍA DEL ESTADO TÁCHIRA';
  logoCell.font = { name: 'Calibri', size: 16, bold: true, color: { argb: CET_BLUE } };
  logoCell.alignment = { horizontal: 'center', vertical: 'middle' };
  ws.getRow(1).height = 35;

  ws.mergeCells('A2', `${lastColLetter}2`);
  const subCell = ws.getCell('A2');
  subCell.value = title || 'Reporte del Sistema SIGET';
  subCell.font = { name: 'Calibri', size: 12, color: { argb: '555555' } };
  subCell.alignment = { horizontal: 'center', vertical: 'middle' };
  ws.getRow(2).height = 22;

  let dataStartRow = 4;

  if (groupBy && data.length > 0) {
    writeGroupedData(ws, columns, data, groupBy, dataStartRow)
  } else {
    if (summaryConfig && summaryConfig.columns && summaryConfig.data && summaryConfig.data.length > 0) {
      ws.mergeCells('A3', `${lastColLetter}3`);
      const sumTitleCell = ws.getRow(3).getCell(1);
      sumTitleCell.value = summaryConfig.title || 'Resumen';
      sumTitleCell.font = { name: 'Calibri', size: 11, bold: true, color: { argb: '003366' } };
      sumTitleCell.alignment = { horizontal: 'center', vertical: 'middle' };
      ws.getRow(3).height = 24;

      const sumHeaderRow = ws.getRow(4);
      sumHeaderRow.height = 20;
      summaryConfig.columns.forEach((col, i) => {
        const cell = sumHeaderRow.getCell(i + 1);
        cell.value = col.header;
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'D6E4F0' } };
        cell.font = { name: 'Calibri', size: 10, bold: true };
        cell.alignment = { horizontal: col.align || 'left', vertical: 'middle' };
        cell.border = THIN_BORDER;
      });

      summaryConfig.data.forEach((row, idx) => {
        const excelRow = ws.getRow(5 + idx);
        excelRow.height = 18;
        summaryConfig.columns.forEach((col, colIdx) => {
          const cell = excelRow.getCell(colIdx + 1);
          const val = col.accessor ? row[col.accessor] : '';
          cell.value = val != null ? val : '';
          cell.font = BODY_FONT;
          cell.alignment = { horizontal: col.align || 'left', vertical: 'middle' };
          cell.border = THIN_BORDER;
          if (col.type === 'currency' && typeof val === 'number') {
            cell.numFmt = '#,##0.00';
          }
        });
      });

      dataStartRow = 5 + summaryConfig.data.length + 1;
    }

    const headerRow = ws.getRow(dataStartRow);
    headerRow.height = 22;
    columns.forEach((col, i) => {
      const cell = headerRow.getCell(i + 1);
      cell.value = col.header;
      cell.fill = HEADER_FILL;
      cell.font = HEADER_FONT;
      cell.alignment = { horizontal: col.align || 'left', vertical: 'middle', wrapText: true };
      cell.border = THIN_BORDER;
    });

    data.forEach((row, rowIdx) => {
      const excelRow = ws.getRow(dataStartRow + 1 + rowIdx);
      excelRow.height = 18;
      columns.forEach((col, colIdx) => {
        const cell = excelRow.getCell(colIdx + 1);
        const val = col.accessor ? row[col.accessor] : (col.format ? col.format(row) : '');
        cell.value = val != null ? val : '';
        cell.font = BODY_FONT;
        cell.alignment = { horizontal: col.align || 'left', vertical: 'middle' };
        cell.border = THIN_BORDER;
        if (col.type === 'currency' && typeof val === 'number') {
          cell.numFmt = '#,##0.00';
        }
      });
    });

    if (data.length > 0) {
      const footerRow = ws.getRow(dataStartRow + 1 + data.length);
      footerRow.height = 20;
      footerRow.getCell(1).value = 'Total General:';
      footerRow.getCell(1).font = { name: 'Calibri', size: 10, bold: true };
      footerRow.getCell(1).border = THIN_BORDER;
      for (let i = 2; i <= columns.length; i++) {
        footerRow.getCell(i).border = THIN_BORDER;
        footerRow.getCell(i).font = { name: 'Calibri', size: 10, bold: true };
      }
    }
  }

  columns.forEach((col, i) => {
    const maxLen = Math.max(
      col.header.length,
      ...data.map(r => String(col.accessor ? r[col.accessor] || '' : '').length)
    );
    ws.getColumn(i + 1).width = Math.min(Math.max(maxLen + 3, 12), 30);
  });

  const buf = await wb.xlsx.writeBuffer();
  const blob = new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename || 'reporte'}.xlsx`;
  a.click();
  window.URL.revokeObjectURL(url);
}
