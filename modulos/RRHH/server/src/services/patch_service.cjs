const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'vacaciones.service.js');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Insert firmantesRows fetch before 'return {'
const oldReturn = 'const bonoVacacional = Number((sueldoDiario * diasBonoVacacional).toFixed(2))\r\n\r\n    return {';
const newReturn = 'const bonoVacacional = Number((sueldoDiario * diasBonoVacacional).toFixed(2))\r\n\r\n    // Firmantes dinamicos desde la BD\r\n    const firmantesRows = await VacacionesModel.getFirmantes()\r\n\r\n    return {';

if (!content.includes(oldReturn)) {
  console.error('ERROR: oldReturn not found. Trying LF version...');
  const oldReturnLF = oldReturn.replace(/\r\n/g, '\n');
  if (content.includes(oldReturnLF)) {
    content = content.replace(oldReturnLF, newReturn.replace(/\r\n/g, '\n'));
    console.log('Replaced using LF version');
  } else {
    console.error('Neither CRLF nor LF version found for oldReturn');
    process.exit(1);
  }
} else {
  content = content.replace(oldReturn, newReturn);
  console.log('Step 1 OK');
}

// 2. Add firmantes field before ultima_nomina
const oldField = '      ultima_nomina: emp.fecha ? {';
const newField = '      firmantes: firmantesRows,\r\n      ultima_nomina: emp.fecha ? {';

if (!content.includes(oldField)) {
  console.error('ERROR: oldField not found');
  process.exit(1);
}
// Only replace the FIRST occurrence (inside getRecibo)
const idx = content.indexOf(oldField);
content = content.slice(0, idx) + newField + content.slice(idx + oldField.length);
console.log('Step 2 OK');

// 3. Add actualizarFirmante method after getRecibo closing
// Find the closing of getRecibo } followed by getDetalleNomina
const oldClose = '  }\r\n\r\n\r\n  static async getDetalleNomina';
const newClose = '  }\r\n\r\n  static async actualizarFirmante(cargo_clave, nombre) {\r\n    return VacacionesModel.updateFirmante(cargo_clave, nombre)\r\n  }\r\n\r\n\r\n  static async getDetalleNomina';

if (content.includes(oldClose)) {
  content = content.replace(oldClose, newClose);
  console.log('Step 3 OK');
} else {
  console.warn('Step 3: Pattern not found, skipping (method may already exist)');
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('Done. Total lines:', content.split('\n').length);
