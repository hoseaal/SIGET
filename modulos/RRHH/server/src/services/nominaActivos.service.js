import { NominaActivosModel } from '../models/nominaActivos.model.js';
import { HistorialSalarioModel } from '../models/historialSalario.model.js';
import { CajaAhorroModel } from '../models/cajaAhorro.model.js';
import pool from '../utils/database.js';
import { differenceInDays } from 'date-fns';

export class NominaActivosService {

  // ─── Helpers ───────────────────────────────────────────────────────────────

  static normalizeString(str) {
    if (!str) return '';
    return str
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();
  }

  /** Cuenta los lunes dentro del rango de fechas [inicio, fin] (inclusive). */
  static contarLunes(fechaInicio, fechaFin) {
    let count = 0;
    const cur = new Date(fechaInicio);
    const fin = new Date(fechaFin);

    // Normalizar a medianoche local para evitar desfases horarios
    cur.setHours(0, 0, 0, 0);
    fin.setHours(0, 0, 0, 0);

    while (cur <= fin) {
      if (cur.getDay() === 1) count++;
      cur.setDate(cur.getDate() + 1);
    }
    return count;
  }

  // ─── Mapas de tablas de configuración ─────────────────────────────────────

  /**
   * Construye un mapa de deducciones a partir de la tabla `deducciones`.
   * Nombres reales en BD: 'IVSS', 'FAOV', 'R.P.E Empleado', 'R.P.E Patronal',
   * 'F.E.J.P empleado', 'Caja Ahorro', 'FAOV Patronal'.
   * El campo `porcentaje` se almacena como valor porcentual (ej: 4.00 → 4%).
   */
  static getDeduccionesMap(deduccionesDB) {
    const mapa = {
      seguro_empleado: 0.04,   // IVSS: 4 % (default)
      seguro_patronal: 0.09,   // 9 % (patronal, sin fila propia en BD)
      rpe_empleado: 0.005,     // R.P.E Empleado: 0.5 %
      rpe_patronal: 0.02,      // R.P.E Patronal: 2 %
      faov_empleado: 0.01,     // FAOV: 1 %
      faov_patronal: 0.02,     // FAOV Patronal: 2 %
      fejp: 0.03,              // F.E.J.P: 3 %
      fejp_patronal: 0.03,     // F.E.J.P Patronal: 3 % (default)
      caja_ahorro: 0.10,       // Caja Ahorro: 10 %
      caja_ahorro_patronal: 0.10 // Caja Ahorro Patronal: 10 % (default)
    };

    deduccionesDB.forEach(ded => {
      const nombre = ded.nombre.trim();
      const n = nombre.toLowerCase();
      const pct = Number(ded.porcentaje) / 100;

      if (nombre === 'IVSS') mapa.seguro_empleado = pct;
      else if (nombre === 'FAOV') mapa.faov_empleado = pct;
      else if (nombre === 'FAOV Patronal') mapa.faov_patronal = pct;
      else if (n.includes('r.p.e') && n.includes('empleado')) mapa.rpe_empleado = pct;
      else if (n.includes('r.p.e') && n.includes('patronal')) mapa.rpe_patronal = pct;
      else if (n.includes('f.e.j.p') || n.includes('fejp')) {
        if (n.includes('patronal')) mapa.fejp_patronal = pct;
        else mapa.fejp = pct;
      }
      else if (n.includes('caja')) {
        if (n.includes('patronal')) mapa.caja_ahorro_patronal = pct;
        else mapa.caja_ahorro = pct;
      }
    });

    return mapa;
  }

  /**
   * Construye un mapa de primas generales (montos fijos) a partir de `primas_generales`.
   * Nombres reales en BD: 'Prima hogares', 'Prima Transporte', 'Prima por hijos',
   * 'Complemento de alimentación'. El campo `monto` (alias de `asignacion`) es el valor
   * mensual completo que se divide /2 al calcular la quincena.
   */
  static getPrimasMap(primasDB) {
    const mapa = { transporte: 0, hijos: 0, hogares: 0, alimentacion: 0 };
    primasDB.forEach(pri => {
      const nombre = this.normalizeString(pri.nombre);
      if (nombre.includes('transporte')) mapa.transporte = Number(pri.monto);
      if (nombre.includes('por hijo') || nombre.includes('prima hijo')) mapa.hijos = Number(pri.monto);
      if (nombre.includes('hogar') && !nombre.includes('alimentacion')) mapa.hogares = Number(pri.monto);
      if (nombre.includes('alimentacion') || nombre.includes('complemento')) mapa.alimentacion = Number(pri.monto);
    });
    return mapa;
  }

  /**
   * Construye un mapa { cargo_normalizado → porcentaje_decimal } a partir de
   * la tabla dinámica `porcentajes_jerarquias`.
   */
  static getJerarquiasMap(jerarquiasDB) {
    const mapa = {};
    jerarquiasDB.forEach(j => {
      const key = this.normalizeString(j.cargo);
      mapa[key] = Number(j.porcentaje) / 100;
    });
    return mapa;
  }

  /**
   * Busca el porcentaje de jerarquía para un cargo dado usando el mapa dinámico.
   * Devuelve el porcentaje como decimal (ej: 0.95 para 95%).
   * Maneja variantes como 'Director(a) General' → 'Director General'.
   */
  static getPorcentajeJerarquia(cargo, mapaJerarquias) {
    if (!cargo) return 0;
    // Normalizar y eliminar '(a)' o similares: 'Director(a)' → 'director'
    const nCargo = this.normalizeString(cargo).replace(/\([a-z]\)/gi, '').replace(/\s+/g, ' ').trim();

    // Búsqueda exacta primero
    if (mapaJerarquias[nCargo] !== undefined) return mapaJerarquias[nCargo];

    // Búsqueda por coincidencia parcial
    for (const [key, pct] of Object.entries(mapaJerarquias)) {
      const nKey = key.replace(/\([a-z]\)/gi, '').replace(/\s+/g, ' ').trim();
      if (nCargo.includes(nKey) || nKey.includes(nCargo)) return pct;
    }
    return 0;
  }

  /**
   * Obtiene el porcentaje de antigüedad para N años usando la escala de la BD.
   * Interpola hacia el valor más alto si supera el máximo configurado.
   */
  static getPorcentajeAntiguedad(anosAntiguedad, escalaAntiguedad, campo = 'porcentaje_actual') {
    // escalaAntiguedad: array ordenado por anios_cumplidos ASC
    let porcentaje = 0;
    for (const esc of escalaAntiguedad) {
      if (anosAntiguedad >= esc.anios_cumplidos) {
        porcentaje = Number(esc[campo]);
      }
    }
    return porcentaje / 100; // devolver como decimal
  }

  // ─── Método principal ──────────────────────────────────────────────────────

  static async generarNomina(mes, anio, quincena) {

    // 1. Obtener todos los datos necesarios de la BD
    // Retroactivos solo se aplican en la segunda quincena del mes en curso
    const esSegundaQuincena = String(quincena) === '2';
    const [
      empleados,
      encargosDB,
      deduccionesDB,
      primasDB,
      escalasList,
      jerarquiasDB,
      salarioMinimo,
      retroactivosDB,
      retroactivosDetalleDB
    ] = await Promise.all([
      NominaActivosModel.getActivosData(),
      NominaActivosModel.getEncargosTemporales(),
      NominaActivosModel.getDeducciones(),
      NominaActivosModel.getPrimasGenerales(),
      NominaActivosModel.getEscalasAntiguedad(),
      NominaActivosModel.getPorcentajesJerarquias(),
      NominaActivosModel.getMinSalarialBase(),
      esSegundaQuincena
        ? NominaActivosModel.getRetroactivosPagados(mes, anio, quincena)
        : Promise.resolve([]),
      esSegundaQuincena
        ? NominaActivosModel.getRetroactivosDetalle(mes, anio, quincena)
        : Promise.resolve([])
    ]);

    const faovApplyCap = process.env.FAOV_APPLY_CAP !== 'false';

    // 2. Construir mapas de acceso rápido
    const mapEncargos = {};
    encargosDB.forEach(e => { mapEncargos[e.empleado_id] = e; });
    const mapRetroactivos = {};
    retroactivosDB.forEach(r => { mapRetroactivos[r.empleado_id] = Number(r.monto) || 0; });
    const mapRetroactivosDetalle = {};
    retroactivosDetalleDB.forEach(r => {
      if (!mapRetroactivosDetalle[r.empleado_id]) mapRetroactivosDetalle[r.empleado_id] = [];
      mapRetroactivosDetalle[r.empleado_id].push({
        retroactivo_id: r.retroactivo_id,
        fecha_inicio: r.fecha_inicio,
        fecha_corte: r.fecha_corte,
        dias_diferencia: r.dias_diferencia,
        delta_sueldo: Number(r.delta_sueldo),
        delta_antiguedad: Number(r.delta_antiguedad),
        delta_profesionalizacion: Number(r.delta_profesionalizacion),
        delta_jerarquia: Number(r.delta_jerarquia),
        monto_retroactivo: Number(r.monto_retroactivo)
      });
    });

    const porcentajesDed = this.getDeduccionesMap(deduccionesDB);
    const primasVal = this.getPrimasMap(primasDB);
    const mapaJerarquias = this.getJerarquiasMap(jerarquiasDB);

    // 3. Determinar fechas de la quincena y contar lunes
    let fechaInicio, fechaFin;
    if (Number(quincena) === 1) {
      fechaInicio = new Date(anio, mes - 1, 1);
      fechaFin = new Date(anio, mes - 1, 15);
    } else {
      fechaInicio = new Date(anio, mes - 1, 16);
      fechaFin = new Date(anio, mes, 0); // último día del mes
    }
    const cantidadLunes = this.contarLunes(fechaInicio, fechaFin);
    // 4. Calcular nómina por empleado
    const nominaResult = [];

    for (const data of empleados) {

      // ── ASIGNACIONES ──────────────────────────────────────────────────────

      // SALARIO BASE (con validación de mínimo dinámico)
      const salario_base_efectivo = Number(data.salario_base) < salarioMinimo
        ? (() => { console.error(`[ALERTA DE SEGURIDAD] Salario base (${data.salario_base}) inferior al mínimo (${salarioMinimo}) para empleado ${data.cedula}`); return salarioMinimo; })()
        : Number(data.salario_base);

      // SALARIO BASE QUINCENAL = SALARIO BASE / 2
      const sueldo_quincenal = Number((salario_base_efectivo / 2).toFixed(2));

      // Salario histórico (sueldo viejo) para jerarquía y reconocimiento
      const salario_historico = Number(data.salario_historico) || Number(data.salario_base);

      // PRIMA PROFESIONALIZACIÓN = SALARIO BASE QUINCENAL × % PROFESIONALIZACIÓN
      const pct_prof = data.profesionalizacion ? Number(data.profesionalizacion) / 100 : 0;
      const profesionalizacion = Number((sueldo_quincenal * pct_prof).toFixed(2));

      // PRIMA JERARQUÍA = % JERARQUÍA × SALARIO HISTÓRICO (quincenal)
      const pct_jerarquia = this.getPorcentajeJerarquia(data.cargo_onapre || data.cargo_cet, mapaJerarquias);
      const prima_jerarquia = Number(((salario_historico * pct_jerarquia) / 2).toFixed(2));



      // PRIMA TRANSPORTE = MONTO_TABLA / 2
      const prima_transporte = Number((primasVal.transporte / 2).toFixed(2));

      // PRIMA HOGARES = MONTO_TABLA / 2
      const prima_hogares = Number((primasVal.hogares / 2).toFixed(2));

      // COMPLEMENTO ALIMENTACIÓN = (MONTO_TABLA × HIJOS_MENORES_18) / 2
      const num_hijos = Number(data.numero_hijos) || 0;
      const comp_alimentacion = num_hijos > 0
        ? Number(((primasVal.alimentacion * num_hijos) / 2).toFixed(2))
        : 0;

      // PRIMA HIJOS = (MONTO_TABLA / 2) × HIJOS_MENORES_18 
      const prima_hijos = num_hijos > 0
        ? Number((((primasVal.hijos / 2) * num_hijos)).toFixed(2))
        : 0;

      // ANTIGÜEDAD
      const anosAntiguedad = Number(data.anios_antiguedad) || 0;
      const pct_antiguedad = this.getPorcentajeAntiguedad(anosAntiguedad, escalasList, 'porcentaje_actual');
      // ANTIGÜEDAD = SALARIO QUINCENAL × % ANTIGÜEDAD
      const antiguedad_quincenal = Number((sueldo_quincenal * pct_antiguedad).toFixed(2));

      // PRIMA RECONOCIMIENTO = SUELDO VIEJO × % ANTIGÜEDAD ANTERIOR (porcentaje_anterior) / 2
      const pct_reconocimiento = this.getPorcentajeAntiguedad(anosAntiguedad, escalasList, 'porcentaje_anterior');
      const prima_reconocimiento = Number(((salario_historico * pct_reconocimiento) / 2).toFixed(2));

      // ── SUPLENCIAS / ENCARGOS TEMPORALES ──────────────────────────────────

      let dif_sueldo = 0;
      let dif_antiguedad = 0;
      let dif_prof = 0;
      let dif_jerarquia = 0;

      const encargo = mapEncargos[data.empleado_id];
      if (encargo) {
        const sal_sup = Number(encargo.salario_suplencia);
        const sal_principal = Number(data.salario_base);

        // DIFERENCIA SUELDO = (SALARIO_SUP – SALARIO_PRINCIPAL) / 2
        dif_sueldo = Number(Math.abs((sal_principal - sal_sup) / 2).toFixed(2));

        // DIFERENCIA ANTIGÜEDAD = DIFERENCIA_SUELDO × % PROFESIONALIZACIÓN
        // (Según fórmula del usuario: dif_antiguedad = dif_sueldo * pct_prof)
        dif_antiguedad = Number((dif_sueldo * pct_prof).toFixed(2));

        // DIFERENCIA PROFESIONALIZACIÓN (diferencia de sueldo quincenal suplencia vs cargo base)
        dif_prof = Number((dif_sueldo * pct_prof).toFixed(2));

        // PRIMA JERARQUÍA DEL ENCARGO
        const sal_hist_sup = Number(encargo.salario_historico_suplencia) || sal_sup;
        const pct_jer_sup = this.getPorcentajeJerarquia(encargo.cargo_onapre_suplencia || encargo.cargo_suplencia, mapaJerarquias);
        const prima_jer_sup = Number(((sal_hist_sup * pct_jer_sup) / 2).toFixed(2));

        // DIFERENCIA JERARQUÍA = PRIMA_JERARQUÍA_SUPLENCIA – PRIMA_JERARQUÍA_CARGO_PRINCIPAL
        dif_jerarquia = Number((prima_jerarquia - prima_jer_sup).toFixed(2));
      }

      // ── TOTALES ASIGNACIONES ──────────────────────────────────────────────

      const total_asignaciones = Number((
        sueldo_quincenal +
        antiguedad_quincenal +
        profesionalizacion +
        prima_jerarquia +
        prima_transporte +
        prima_reconocimiento +
        prima_hogares +
        comp_alimentacion +
        prima_hijos +
        dif_sueldo +
        dif_antiguedad +
        dif_prof +
        dif_jerarquia
      ).toFixed(2));
      const retroactivo = Number((mapRetroactivos[data.empleado_id] || 0).toFixed(2));
      const total_asignaciones_con_retroactivo = Number((total_asignaciones + retroactivo).toFixed(2));

      // ── DEDUCCIONES ───────────────────────────────────────────────────────

      // ASIGNACIÓN MENSUAL = TOTAL ASIGNACIONES × 2
      const asignacion_mensual = Number((total_asignaciones * 2).toFixed(2));

      // IVSS: cap de 5 salarios mínimos sobre la base mensual
      const ivss_base_mensual_cap = 5 * salarioMinimo;
      const asignacion_mensual_ivss = Math.min(asignacion_mensual, ivss_base_mensual_cap);

      // ASIGNACIÓN SEMANAL IVSS = (BASE_MENSUAL_CAPS × 12) / 52
      const asignacion_semanal_ivss = Number(((asignacion_mensual_ivss * 12) / 52).toFixed(6));

      // SSO EMPLEADO  = (ASIG_SEMANAL × 4%)  × NRO_LUNES
      const seguro_empleado = Number((asignacion_semanal_ivss * porcentajesDed.seguro_empleado * cantidadLunes).toFixed(2));
      // SSO PATRONAL  = (ASIG_SEMANAL × 9%)  × NRO_LUNES
      const seguro_patronal = Number((asignacion_semanal_ivss * porcentajesDed.seguro_patronal * cantidadLunes).toFixed(2));

      // R.P.E EMPLEADO = (ASIG_SEMANAL × 0.5%) × NRO_LUNES
      const rpe_empleado = Number((asignacion_semanal_ivss * porcentajesDed.rpe_empleado * cantidadLunes).toFixed(2));
      // R.P.E PATRONAL = (ASIG_SEMANAL × 2%)   × NRO_LUNES
      const rpe_patronal = Number((asignacion_semanal_ivss * porcentajesDed.rpe_patronal * cantidadLunes).toFixed(2));

      // F.A.O.V: cap de 10 salarios mínimos sobre el quincenal
      const faov_base_quincenal = faovApplyCap
        ? Math.min(total_asignaciones, (10 * salarioMinimo) / 2)
        : total_asignaciones;
      const faov_empleado = Number((faov_base_quincenal * porcentajesDed.faov_empleado).toFixed(2));
      const faov_patronal = Number((faov_base_quincenal * porcentajesDed.faov_patronal).toFixed(2));

      // F.E.J.P = (SUELDO_BASE + ANTIGÜEDAD + DIFERENCIA_SUELDO + DIFERENCIA_ANTIGÜEDAD) × %
      const base_fejp = sueldo_quincenal + antiguedad_quincenal + dif_sueldo + dif_antiguedad;
      const fejp = Number((base_fejp * porcentajesDed.fejp).toFixed(2));
      const fejp_patronal = Number((base_fejp * porcentajesDed.fejp_patronal).toFixed(2));

      // CAJA AHORRO = (SALARIO_BÁSICO_QUINCENAL + DIFERENCIA_SUELDO_QUINCENAL) × %
      const caja_ahorro = Number(((sueldo_quincenal + dif_sueldo) * porcentajesDed.caja_ahorro).toFixed(2));
      const caja_ahorro_patronal = Number(((sueldo_quincenal + dif_sueldo) * porcentajesDed.caja_ahorro_patronal).toFixed(2));

      // Total deducciones (parte empleado)
      const total_deducciones = Number((
        seguro_empleado + rpe_empleado + faov_empleado + fejp + caja_ahorro
      ).toFixed(2));

      // SALARIO NETO = TOTAL ASIGNACIONES - TOTAL DEDUCCIONES
      const salario_neto = Number((total_asignaciones_con_retroactivo - total_deducciones).toFixed(2));

      // ── Registro resultado ─────────────────────────────────────────────────
      nominaResult.push({
        empleado: {
          cedula: data.cedula,
          nombres: data.nombre,
          apellidos: data.apellido,
          departamento: data.departamento,
          division: data.division,
          unidad: data.unidad,
          cargo_cet: data.cargo_cet,
          cargo_onapre: data.cargo_onapre,
          salario_base_mensual: Number(data.salario_base)
        },
        asignaciones: {
          sueldo_quincenal,
          antiguedad_quincenal,
          profesionalizacion,
          prima_jerarquia,
          prima_transporte,
          prima_reconocimiento,
          prima_hogares,
          complemento_alimentacion: comp_alimentacion,
          prima_hijos,
          porcentaje_antiguedad_nuevo: pct_antiguedad,
          porcentaje_antiguedad_antiguo: pct_reconocimiento,
          diferencias_suplencia: encargo ? {
            sueldo: dif_sueldo,
            antiguedad: dif_antiguedad,
            profesionalizacion: dif_prof,
            jerarquia: dif_jerarquia
          } : null,
          retroactivo,
          retroactivo_detalle: mapRetroactivosDetalle[data.empleado_id] || null,
          total_asignaciones: total_asignaciones_con_retroactivo
        },
        deducciones: {
          asignacion_mensual,
          asignacion_semanal_ivss: Number(asignacion_semanal_ivss.toFixed(2)),
          seguro_empleado,
          seguro_patronal,
          rpe_empleado,
          rpe_patronal,
          faov_empleado,
          faov_patronal,
          fejp,
          fejp_patronal,
          caja_ahorro,
          caja_ahorro_patronal,
          total_deducciones
        },
        salario_neto
      });
    }

    return nominaResult;
  }

  // ─── Firmantes autorizados ─────────────────────────────────────────────

  static async obtenerFirmantes() {
    const firmantes = await NominaActivosModel.getFirmantes();
    // Mapa de títulos fijos en el orden deseado
    const orden = {
      80: 'DIRECTOR(A) DE RECURSOS HUMANOS',
      43: 'JEFE DE DIVISIÓN GENERAL DE RECURSOS HUMANOS',
      44: 'JEFE DE DIVISIÓN DE REMUNERACIONES',
      69: 'ASISTENTE ADMINISTRATIVO'
    };
    // Devolver en el orden jerárquico descendente
    return Object.entries(orden).map(([cargoCetId, cargoFirma]) => {
      const encontrado = firmantes.find(f => f.cargo_cet_id === Number(cargoCetId));
      return {
        cargo_cet_id: Number(cargoCetId),
        nombre_completo: encontrado?.nombre_completo || '[Por Asignar]',
        cargo_firma: cargoFirma
      };
    });
  }

  // ─── Resumen Mensual (unificación Q1 + Q2) ──────────────────────────────

  /**
   * Genera el resumen mensual consolidado sumando linealmente los conceptos
   * de la primera y segunda quincena para cada empleado.
   */
  static async generarResumenMensual(mes, anio) {
    const [q1, q2] = await Promise.all([
      this.generarNomina(mes, anio, 1),
      this.generarNomina(mes, anio, 2)
    ]);

    const empleadosMap = new Map();

    const agregar = (data) => {
      const cedula = data.empleado.cedula;
      if (!empleadosMap.has(cedula)) {
        empleadosMap.set(cedula, {
          empleado: { ...data.empleado },
          asignaciones: {
            sueldo_quincenal: 0,
            antiguedad_quincenal: 0,
            profesionalizacion: 0,
            prima_jerarquia: 0,
            prima_transporte: 0,
            prima_reconocimiento: 0,
            prima_hogares: 0,
            complemento_alimentacion: 0,
            prima_hijos: 0,
            porcentaje_antiguedad_nuevo: data.asignaciones.porcentaje_antiguedad_nuevo,
            porcentaje_antiguedad_antiguo: data.asignaciones.porcentaje_antiguedad_antiguo,
            diferencias_suplencia: null,
            retroactivo: 0,
            total_asignaciones: 0
          },
          deducciones: {
            asignacion_mensual: 0,
            asignacion_semanal_ivss: 0,
            seguro_empleado: 0,
            seguro_patronal: 0,
            rpe_empleado: 0,
            rpe_patronal: 0,
            faov_empleado: 0,
            faov_patronal: 0,
            fejp: 0,
            fejp_patronal: 0,
            caja_ahorro: 0,
            caja_ahorro_patronal: 0,
            total_deducciones: 0
          },
          salario_neto: 0
        });
      }

      const emp = empleadosMap.get(cedula);

      emp.asignaciones.sueldo_quincenal += data.asignaciones.sueldo_quincenal;
      emp.asignaciones.antiguedad_quincenal += data.asignaciones.antiguedad_quincenal;
      emp.asignaciones.profesionalizacion += data.asignaciones.profesionalizacion;
      emp.asignaciones.prima_jerarquia += data.asignaciones.prima_jerarquia;
      emp.asignaciones.prima_transporte += data.asignaciones.prima_transporte;
      emp.asignaciones.prima_reconocimiento += data.asignaciones.prima_reconocimiento;
      emp.asignaciones.prima_hogares += data.asignaciones.prima_hogares;
      emp.asignaciones.complemento_alimentacion += data.asignaciones.complemento_alimentacion;
      emp.asignaciones.prima_hijos += data.asignaciones.prima_hijos;
      emp.asignaciones.retroactivo += data.asignaciones.retroactivo;

      if (data.asignaciones.diferencias_suplencia) {
        if (!emp.asignaciones.diferencias_suplencia) {
          emp.asignaciones.diferencias_suplencia = { sueldo: 0, antiguedad: 0, profesionalizacion: 0, jerarquia: 0 };
        }
        emp.asignaciones.diferencias_suplencia.sueldo += data.asignaciones.diferencias_suplencia.sueldo;
        emp.asignaciones.diferencias_suplencia.antiguedad += data.asignaciones.diferencias_suplencia.antiguedad;
        emp.asignaciones.diferencias_suplencia.profesionalizacion += data.asignaciones.diferencias_suplencia.profesionalizacion;
        emp.asignaciones.diferencias_suplencia.jerarquia += data.asignaciones.diferencias_suplencia.jerarquia;
      }

      emp.deducciones.asignacion_mensual += data.deducciones.asignacion_mensual;
      emp.deducciones.asignacion_semanal_ivss += data.deducciones.asignacion_semanal_ivss;
      emp.deducciones.seguro_empleado += data.deducciones.seguro_empleado;
      emp.deducciones.seguro_patronal += data.deducciones.seguro_patronal;
      emp.deducciones.rpe_empleado += data.deducciones.rpe_empleado;
      emp.deducciones.rpe_patronal += data.deducciones.rpe_patronal;
      emp.deducciones.faov_empleado += data.deducciones.faov_empleado;
      emp.deducciones.faov_patronal += data.deducciones.faov_patronal;
      emp.deducciones.fejp += data.deducciones.fejp;
      emp.deducciones.fejp_patronal += data.deducciones.fejp_patronal;
      emp.deducciones.caja_ahorro += data.deducciones.caja_ahorro;
      emp.deducciones.caja_ahorro_patronal += data.deducciones.caja_ahorro_patronal;
    };

    q1.forEach(agregar);
    q2.forEach(agregar);

    for (const emp of empleadosMap.values()) {
      const asig = emp.asignaciones;
      const ded = emp.deducciones;

      asig.total_asignaciones = Number((
        asig.sueldo_quincenal +
        asig.antiguedad_quincenal +
        asig.profesionalizacion +
        asig.prima_jerarquia +
        asig.prima_transporte +
        asig.prima_reconocimiento +
        asig.prima_hogares +
        asig.complemento_alimentacion +
        asig.prima_hijos +
        (asig.diferencias_suplencia?.sueldo || 0) +
        (asig.diferencias_suplencia?.antiguedad || 0) +
        (asig.diferencias_suplencia?.profesionalizacion || 0) +
        (asig.diferencias_suplencia?.jerarquia || 0) +
        asig.retroactivo
      ).toFixed(2));

      ded.total_deducciones = Number((
        ded.seguro_empleado +
        ded.rpe_empleado +
        ded.faov_empleado +
        ded.fejp +
        ded.caja_ahorro
      ).toFixed(2));

      emp.salario_neto = Number((asig.total_asignaciones - ded.total_deducciones).toFixed(2));
    }

    return Array.from(empleadosMap.values());
  }

  // ─── Persistencia automática ──────────────────────────────────────────────

  /**
   * Persiste los resultados del cálculo de nómina en las tablas de historial
   * salarial y caja de ahorro, garantizando:
   *
   * 1. IDEMPOTENCIA (Opción A - Reescritura segura):
   *    Se usa ON DUPLICATE KEY UPDATE sobre la llave única compuesta
   *    (empleado_id, quincena_no, mes, anio). Si el usuario presiona el botón
   *    múltiples veces, el registro se SOBREESCRIBE con los montos más recientes,
   *    evitando filas duplicadas o sumas acumulativas erróneas.
   *
   * 2. AISLAMIENTO ATÓMICO:
   *    Cada empleado se procesa dentro de una transacción independiente.
   *    Si falla la escritura en historial_salarios, se revierte también la de
   *    caja_ahorro, y viceversa. Nunca quedan registros huérfanos.
   *
   * 3. CAJA DE AHORRO CONSOLIDADA:
   *    Se suman algebraicamente el Aporte del Empleado (deducción) y el Aporte
   *    del Patrono (aporte institucional) para reflejar el monto total depositado
   *    en el período.
   *
   * @param {Array}  nominaResult  - Arreglo devuelto por generarNomina()
   * @param {number} mes           - Mes (1-12)
   * @param {number} anio          - Año
   * @param {number} quincena      - 1 o 2
   * @returns {Promise<{ historial: number, caja_ahorro: number, errores: number }>}
   */
  static async persistirNomina(nominaResult, mes, anio, quincena) {
    let historialCount = 0;
    let cajaCount = 0;
    let errorCount = 0;

    // Resolver empleado_id desde cédula para todos los registros (en paralelo)
    const empleadosIds = await Promise.all(
      nominaResult.map(async (item) => {
        const cedula = item.empleado?.cedula;
        if (!cedula) return null;
        try {
          const [rows] = await pool.query(
            'SELECT empleado_id FROM empleados WHERE cedula = ? LIMIT 1',
            [String(cedula)]
          );
          return rows?.[0]?.empleado_id || null;
        } catch {
          return null;
        }
      })
    );

    // ─────────────────────────────────────────────────────────────────────────
    // Procesar cada empleado en una transacción aislada.
    // Por cada empleado se abre una transacción que cubre ambos UPSERTs:
    //   historial_salarios + caja_ahorro.
    // Si algo falla, se hace ROLLBACK y ningún registro queda huérfano.
    // ─────────────────────────────────────────────────────────────────────────
    for (let i = 0; i < nominaResult.length; i++) {
      const empleado_id = empleadosIds[i];
      if (!empleado_id) continue;

      const item = nominaResult[i];

      // ── Regla I: Totales del período ──────────────────────────────────────
      const total_asignaciones = item.asignaciones?.total_asignaciones || 0;
      const total_deducciones = item.deducciones?.total_deducciones || 0;
      const salario_neto = item.salario_neto || 0;

      // ── Regla II: Caja de Ahorro consolidada ──────────────────────────────
      // Se aísla el Aporte del Empleado (deducción) y el Aporte del Patrono
      // (aporte institucional/patronal). Ambos se suman algebraicamente para
      // reflejar el monto total depositado en la caja de ahorro del período.
      const cajaEmpleado = item.deducciones?.caja_ahorro || 0;
      const cajaPatronal = item.deducciones?.caja_ahorro_patronal || 0;
      const montoCaja = Number((cajaEmpleado + cajaPatronal).toFixed(2));

      const connection = await pool.getConnection();
      try {
        await connection.beginTransaction();

        // UPSERT en historial_salarios (idempotente por unique key compuesta)
        await HistorialSalarioModel.upsert({
          empleado_id,
          quincena_no: quincena,
          mes,
          anio,
          total_asignaciones,
          total_deducciones,
          salario_neto
        }, connection); // ← misma conexión transaccional

        // UPSERT en caja_ahorro — solo si hay monto consolidado > 0
        if (montoCaja > 0) {
          await CajaAhorroModel.upsert({
            empleado_id,
            quincena_no: quincena,
            mes,
            anio,
            monto: montoCaja
          }, connection); // ← misma conexión transaccional
          cajaCount++;
        }

        // Confirmar ambas escrituras atómicamente
        await connection.commit();
        historialCount++;
      } catch (err) {
        // Revertir todo — ni historial_salarios ni caja_ahorro se persisten
        await connection.rollback();
        errorCount++;
        console.error(
          `[Persistencia] Error atómico para empleado ${empleado_id} ` +
          `(Q${quincena}/${mes}/${anio}): ${err.message}`
        );
      } finally {
        connection.release();
      }
    }

    return { historial: historialCount, caja_ahorro: cajaCount, errores: errorCount };
  }
}
