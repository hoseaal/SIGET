import PDFDocument from 'pdfkit';
import pool from '../utils/database.js';
import { NominaActivosModel } from '../models/nominaActivos.model.js';
import { format } from 'date-fns';
import { es } from 'date-fns/locale/es';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function numeroALetras(num) {
  const unidades = ['', 'UN', 'DOS', 'TRES', 'CUATRO', 'CINCO', 'SEIS', 'SIETE', 'OCHO', 'NUEVE'];
  const decenas = ['', 'DIEZ', 'VEINTE', 'TREINTA', 'CUARENTA', 'CINCUENTA', 'SESENTA', 'SETENTA', 'OCHENTA', 'NOVENTA'];
  const especiales = {
    11: 'ONCE', 12: 'DOCE', 13: 'TRECE', 14: 'CATORCE', 15: 'QUINCE',
    16: 'DIECISEIS', 17: 'DIECISIETE', 18: 'DIECIOCHO', 19: 'DIECINUEVE',
    21: 'VEINTIUNO', 22: 'VEINTIDOS', 23: 'VEINTITRES', 24: 'VEINTICUATRO',
    25: 'VEINTICINCO', 26: 'VEINTISEIS', 27: 'VEINTISIETE', 28: 'VEINTIOCHO', 29: 'VEINTINUEVE'
  };
  const centenas = ['', 'CIENTO', 'DOSCIENTOS', 'TRESCIENTOS', 'CUATROCIENTOS', 'QUINIENTOS', 'SEISCIENTOS', 'SETECIENTOS', 'OCHOCIENTOS', 'NOVECIENTOS'];

  function convertirGrupo(n) {
    if (n === 0) return '';
    let output = '';
    const c = Math.floor(n / 100);
    const d = Math.floor((n % 100) / 10);
    const u = n % 10;
    const du = n % 100;

    if (n === 100) return 'CIEN';
    if (c > 0) output += centenas[c] + ' ';

    if (du > 0) {
      if (especiales[du]) {
        output += especiales[du];
      } else {
        if (d > 0) {
          output += decenas[d];
          if (u > 0) output += ' Y ';
        }
        if (u > 0) {
          output += unidades[u];
        }
      }
    }
    return output.trim();
  }

  if (num === 0) return 'CERO';

  const partes = parseFloat(num).toFixed(2).split('.');
  let entero = parseInt(partes[0], 10);
  const centimos = parseInt(partes[1], 10);

  let letras = '';

  if (entero === 0) {
    letras = 'CERO';
  } else {
    const millones = Math.floor(entero / 1000000);
    const miles = Math.floor((entero % 1000000) / 1000);
    const resto = entero % 1000;

    if (millones > 0) {
      if (millones === 1) {
        letras += 'UN MILLÓN ';
      } else {
        letras += convertirGrupo(millones) + ' MILLONES ';
      }
    }

    if (miles > 0) {
      if (miles === 1) {
        letras += 'MIL ';
      } else {
        letras += convertirGrupo(miles) + ' MIL ';
      }
    }

    if (resto > 0) {
      letras += convertirGrupo(resto);
    }
  }

  letras = letras.trim();

  if (centimos > 0) {
    const centimosTexto = especiales[centimos] ||
      (centimos % 10 === 0 ? decenas[Math.floor(centimos / 10)] :
        (centimos < 10 ? unidades[centimos] :
          decenas[Math.floor(centimos / 10)] + ' Y ' + unidades[centimos % 10]));
    return `${letras} CON ${centimosTexto.trim()} CÉNTIMOS`;
  }

  return `${letras} EXACTOS`;
}

function formatMontoLetras(num) {
  const texto = numeroALetras(num).toLowerCase();
  return texto.replace('exactos', 'Exactos').replace('céntimos', 'Céntimos');
}

export const descargarConstancia = async (req, res) => {
  try {
    const empleado_id = req.query.empleado_id || req.user.empleado_id;

    if (!empleado_id) {
      return res.status(400).json({ error: 'ID de empleado es requerido' });
    }

    // Obtener datos detallados del empleado
    const [empRows] = await pool.query(`
      SELECT t.empleado_id, t.cedula, t.nombres, t.apellidos, t.fecha_ingreso,
        (
          SELECT COUNT(*) 
          FROM nucleo_familiar nf 
          INNER JOIN sobreviviente s ON nf.familiar_id = s.familiar_id 
          WHERE s.empleado_id = t.empleado_id 
            AND LOWER(nf.parentesco) IN ('hijo', 'hija') 
            AND TIMESTAMPDIFF(YEAR, nf.fecha_nacimiento, CURDATE()) < 18
        ) AS numero_hijos,
        c.cargo_cet_id, cet.nombre AS cargo_cet_nombre, 
        c.cargo_onapre_id, ona.nombre AS cargo_onapre_nombre,
        c.nivel_salarial_id, COALESCE(niv.salario_base, 0) AS salario_base,
        (
          SELECT nsa.salario_antiguo 
          FROM niveles_salariales_antiguos nsa 
          WHERE nsa.nombre = niv.nombre 
            AND nsa.cargo_onapre_id = niv.cargo_onapre_id
          LIMIT 1
        ) AS salario_historico,
        c.direccion_id, dir.nombre AS direccion_nombre,
        pp.porcentaje_actual AS profesionalizacion,
        FLOOR((
          COALESCE((
            SELECT SUM(DATEDIFF(COALESCE(ra.fecha_fin, CURDATE()), ra.fecha_inicio))
            FROM registros_antiguedades ra
            WHERE ra.empleado_id = t.empleado_id
          ), 0) + DATEDIFF(CURDATE(), t.fecha_ingreso)
        ) / 365) AS anios_antiguedad
      FROM empleados t
      JOIN datos_laborales c ON t.empleado_id = c.empleado_id
      LEFT JOIN cargos_cet cet ON c.cargo_cet_id = cet.cargo_cet_id
      LEFT JOIN cargos_onapre ona ON c.cargo_onapre_id = ona.cargo_onapre_id
      LEFT JOIN niveles_salariales niv ON c.nivel_salarial_id = niv.nivel_salarial_id
      LEFT JOIN direcciones dir ON c.direccion_id = dir.direccion_id
      LEFT JOIN primas_profesionalizacion pp ON c.prima_profesional_id = pp.prima_profesional_id
      WHERE t.empleado_id = ?
    `, [empleado_id]);

    const empleado = empRows[0];
    if (!empleado) {
      return res.status(404).json({ error: 'Empleado no encontrado' });
    }

    // Obtener la Directora de Recursos Humanos de la BD
    const [directorRows] = await pool.query(`
      SELECT t.nombres, t.apellidos, t.genero
      FROM empleados t
      JOIN datos_laborales dl ON t.empleado_id = dl.empleado_id
      JOIN direcciones d ON dl.direccion_id = d.direccion_id
      LEFT JOIN cargos_onapre ona ON dl.cargo_onapre_id = ona.cargo_onapre_id
      LEFT JOIN cargos_cet cet ON dl.cargo_cet_id = cet.cargo_cet_id
      WHERE (d.nombre LIKE '%Recursos Humanos%' OR d.nombre LIKE '%RRHH%')
        AND (ona.nombre LIKE '%Director%' OR ona.nombre LIKE '%Directora%' OR cet.nombre LIKE '%Director%' OR cet.nombre LIKE '%Directora%' OR ona.nombre LIKE '%Jefe%' OR cet.nombre LIKE '%Jefe%')
      LIMIT 1
    `);

    let nombreDirectora = 'Directora de Recursos Humanos';
    if (directorRows && directorRows.length > 0) {
      const dir = directorRows[0];
      const prefijo = (dir.genero === 'F' || dir.genero === 'Femenino') ? 'Lcda.' : 'Lic.';
      nombreDirectora = `${prefijo} ${dir.nombres} ${dir.apellidos}`;
    }

    // Fetch configuraciones de primas
    const [escalasList, primasDB, jerarquiasDB] = await Promise.all([
      NominaActivosModel.getEscalasAntiguedad(),
      NominaActivosModel.getPrimasGenerales(),
      NominaActivosModel.getPorcentajesJerarquias()
    ]);

    // Primas map
    const primasVal = { transporte: 0, hijos: 0, hogares: 0, alimentacion: 0 };
    primasDB.forEach(pri => {
      const nombre = pri.nombre.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
      if (nombre.includes('transporte')) primasVal.transporte = Number(pri.monto);
      if (nombre.includes('por hijo') || nombre.includes('prima hijo')) primasVal.hijos = Number(pri.monto);
      if (nombre.includes('hogar') && !nombre.includes('alimentacion')) primasVal.hogares = Number(pri.monto);
      if (nombre.includes('alimentacion') || nombre.includes('complemento')) primasVal.alimentacion = Number(pri.monto);
    });

    // Jerarquias map
    const mapaJerarquias = {};
    jerarquiasDB.forEach(j => {
      mapaJerarquias[j.cargo.toLowerCase().trim()] = Number(j.porcentaje) / 100;
    });

    const getPorcentajeJerarquia = (cargoNombre) => {
      if (!cargoNombre) return 0;
      const key = cargoNombre.toLowerCase().trim();
      return mapaJerarquias[key] || 0;
    };

    const getPorcentajeAntiguedad = (anos, campo) => {
      const escala = escalasList.find(e => Number(e.anios_cumplidos) === Number(anos));
      if (escala) return Number(escala[campo]) / 100;
      const menores = escalasList.filter(e => Number(e.anios_cumplidos) <= Number(anos));
      if (menores.length > 0) {
        const maxEscala = menores.reduce((prev, current) => (Number(prev.anios_cumplidos) > Number(current.anios_cumplidos)) ? prev : current);
        return Number(maxEscala[campo]) / 100;
      }
      return 0;
    };

    // Calcular valores mensuales
    const salario_base = Number(empleado.salario_base) || 0;
    const salario_historico = Number(empleado.salario_historico) || salario_base;
    const num_hijos = Number(empleado.numero_hijos) || 0;

    const pct_prof = empleado.profesionalizacion ? Number(empleado.profesionalizacion) / 100 : 0;
    const profesionalizacion = Number((salario_base * pct_prof).toFixed(2));

    const cargoNombre = empleado.cargo_onapre_nombre || empleado.cargo_cet_nombre;
    const pct_jerarquia = getPorcentajeJerarquia(cargoNombre);
    const prima_jerarquia = Number((salario_historico * pct_jerarquia).toFixed(2));

    const prima_transporte = Number(primasVal.transporte.toFixed(2));
    const prima_hogares = Number(primasVal.hogares.toFixed(2));
    const comp_alimentacion = num_hijos > 0 ? Number((primasVal.alimentacion * num_hijos).toFixed(2)) : 0;
    const prima_hijos = num_hijos > 0 ? Number((primasVal.hijos * num_hijos).toFixed(2)) : 0;

    const anosAntiguedad = Number(empleado.anios_antiguedad) || 0;
    const pct_antiguedad = getPorcentajeAntiguedad(anosAntiguedad, 'porcentaje_actual');
    const antiguedad = Number((salario_base * pct_antiguedad).toFixed(2));

    const pct_reconocimiento = getPorcentajeAntiguedad(anosAntiguedad, 'porcentaje_anterior');
    const prima_reconocimiento = Number((salario_historico * pct_reconocimiento).toFixed(2));

    const total_primas = Number((
      profesionalizacion +
      prima_jerarquia +
      prima_transporte +
      prima_hogares +
      comp_alimentacion +
      prima_hijos +
      antiguedad +
      prima_reconocimiento
    ).toFixed(2));

    const sueldo_total = Number((salario_base + total_primas).toFixed(2));

    // Configurar encabezados para descarga de PDF
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=Constancia_Trabajo_${empleado.cedula}.pdf`);

    // Margenes en puntos: Superior: 3cm (85pt), Izquierdo: 3cm (85pt), Inferior: 30pt, Derecho: 3cm (85pt)
    const doc = new PDFDocument({
      margins: {
        top: 85,
        bottom: 30,
        left: 85,
        right: 85
      }
    });
    doc.pipe(res);

    // Cabecera (Logo CET y RIF justo debajo de la imagen)
    const logoPath = path.join(__dirname, '..', '..', '..', 'client', 'src', 'assets', 'logo-cet.png');
    try {
      doc.image(logoPath, 85, 25, { width: 80 });
    } catch (err) {
      console.warn('No se pudo cargar el logo de la CET:', err.message);
      doc.fontSize(8).font('Helvetica').text('LOGO CET', 100, 55, { width: 50, align: 'center' });
    }

    // Texto de RIF justo debajo de la imagen
    doc.fontSize(8).font('Helvetica').text('RIF. G-20000523-8', 85, 70, { width: 80, align: 'center' });

    // Texto del encabezado centrado
    doc.fontSize(10).font('Helvetica-BoldOblique').text('Sistema Nacional de Control Fiscal', 175, 30, { width: 352, align: 'center' });
    doc.font('Helvetica-BoldOblique').text('Contraloría del Estado Táchira', 175, 42, { width: 352, align: 'center' });
    doc.fontSize(8).font('Helvetica-Oblique').text('Dirección de Recursos Humanos', 175, 54, { width: 352, align: 'center' });

    // Línea divisora del encabezado
    doc.lineWidth(2).moveTo(85, 86).lineTo(527, 86).stroke();

    doc.y = 110;

    doc.fontSize(16).font('Helvetica-Bold').text('CONSTANCIA', 85, doc.y, { align: 'center', width: 442, underline: true });
    doc.moveDown(1.5);

    // Un solo párrafo continuo del cuerpo
    doc.fontSize(12).font('Helvetica').text('Quien suscribe, hace constar que el ciudadano(a), ', 85, doc.y, { align: 'justify', lineGap: 5, width: 442, continued: true });
    doc.font('Helvetica-Bold').text(`${empleado.apellidos.toUpperCase()}, ${empleado.nombres.toUpperCase()}`, { continued: true });
    doc.font('Helvetica').text(', titular de la cédula de identidad N° V-', { continued: true });
    doc.font('Helvetica-Bold').text(`${empleado.cedula}`, { continued: true });
    doc.font('Helvetica').text(', labora en este Órgano de Control Fiscal desde el ', { continued: true });
    doc.font('Helvetica-Bold').text(`${format(new Date(empleado.fecha_ingreso), 'dd/MM/yyyy')}`, { continued: true });
    doc.font('Helvetica').text(', hasta la presente en el cargo de ', { continued: true });
    doc.font('Helvetica-Bold').text(`${(empleado.cargo_onapre_nombre || empleado.cargo_cet_nombre || 'No asignado').toUpperCase()}`, { continued: true });
    doc.font('Helvetica').text(', devengando un sueldo básico mensual de bolívares, ', { continued: true });
    doc.font('Helvetica-Bold').text(`${formatMontoLetras(salario_base)}`, { continued: true });
    doc.font('Helvetica').text(` (Bs. ${salario_base.toFixed(2)}), con unas primas por un monto de bolívares, `, { continued: true });
    doc.font('Helvetica-Bold').text(`${formatMontoLetras(total_primas)}`, { continued: true });
    doc.font('Helvetica').text(` (Bs. ${total_primas.toFixed(2)}), para un total mensual de bolívares, `, { continued: true });
    doc.font('Helvetica-Bold').text(`${formatMontoLetras(sueldo_total)}`, { continued: true });
    doc.font('Helvetica').text(` (Bs. ${sueldo_total.toFixed(2)}).`, { continued: false });

    doc.moveDown(1.5);

    // Formatear fecha en formato literal "veintiséis (26) días del mes de Marzo de 2026."
    const diasLetras = ['', 'un', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve', 'diez',
      'once', 'doce', 'trece', 'catorce', 'quince', 'dieciséis', 'diecisiete', 'dieciocho', 'diecinueve', 'veinte',
      'veintiuno', 'veintidós', 'veintitrés', 'veinticuatro', 'veinticinco', 'veintiséis', 'veintisiete', 'veintiocho', 'veintinueve', 'treinta', 'treinta y uno'];
    const fechaObj = new Date();
    const diaNum = fechaObj.getDate();
    const diaText = diasLetras[diaNum];
    const mesText = format(fechaObj, 'MMMM', { locale: es });
    const mesCapitalizado = mesText.charAt(0).toUpperCase() + mesText.slice(1);
    const anioNum = fechaObj.getFullYear();

    doc.font('Helvetica').text('Constancia que se expide a petición de la parte interesada, a los ', 85, doc.y, { align: 'justify', lineGap: 5, width: 442, continued: true });
    doc.font('Helvetica-Bold').text(`${diaText} (${diaNum}) días del mes de ${mesCapitalizado} de ${anioNum}.`, { continued: false });

    doc.moveDown(5);

    // Bloque de firma
    doc.font('Helvetica-Bold').text(nombreDirectora, 85, doc.y, { align: 'center', width: 442 });
    doc.font('Helvetica-Bold').text('Directora de Recursos Humanos (E)', 85, doc.y, { align: 'center', width: 442 });
    doc.fontSize(10).font('Helvetica').text('Según Resolución C.E.T N° 108 de fecha 04 de agosto de 2025', 85, doc.y, { align: 'center', width: 442 });

    // Pie de página: frase, línea divisora y datos de contacto
    doc.fontSize(8).font('Helvetica-Oblique').text('"Hacia la Transparencia de la Gestión Pública"', 85, doc.page.height - 116, { width: 442, align: 'center' });
    doc.lineWidth(1).moveTo(85, doc.page.height - 105).lineTo(527, doc.page.height - 105).stroke();

    doc.fontSize(8).font('Helvetica').text('Centro Residencial y Empresarial La Concordia (CREMCO) Prolongación Quinta Avenida, N° 7-40, La Concordia, San Cristóbal, Estado Táchira', 85, doc.page.height - 93, { width: 442, align: 'center' });
    doc.text('Teléfonos: (0276) 3469031 y (0276) 3489045. Página Web: www.contraloriatachira.gob.ve', 85, doc.page.height - 77, { width: 442, align: 'center' });
    doc.text('E-mail: dirrhh@contraloriatachira.gob.ve', 85, doc.page.height - 61, { width: 442, align: 'center' });

    doc.end();

  } catch (error) {
    console.error('Error generando constancia:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Error interno del servidor al generar el PDF' });
    }
  }
};
