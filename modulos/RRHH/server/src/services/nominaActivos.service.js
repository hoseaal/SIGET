import { NominaActivosModel } from '../models/nominaActivos.model.js';
import { differenceInDays, parseISO, addMonths } from 'date-fns';

export class NominaActivosService {
  
  static normalizeString(str) {
    if (!str) return "";
    return str
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();
  }

  static contarLunes(fechaInicio, fechaFin) {
    let cantidadLunes = 0;
    let fechaActual = new Date(fechaInicio);
    const fin = new Date(fechaFin);

    while (fechaActual <= fin) {
      if (fechaActual.getDay() === 1) { // 1 = Lunes
        cantidadLunes++;
      }
      fechaActual.setDate(fechaActual.getDate() + 1);
    }
    return cantidadLunes;
  }

  static getDeduccionesMap(deduccionesDB) {
    const mapa = {
      seguro_empleado: 0,
      seguro_patronal: 0,
      rpe_empleado: 0,
      rpe_patronal: 0,
      faov_empleado: 0,
      faov_patronal: 0,
      fejp: 0,
      caja_ahorro: 0
    };

    deduccionesDB.forEach(ded => {
      const nombre = ded.nombre.toLowerCase();
      if (nombre.includes('seguro') && nombre.includes('empleado')) mapa.seguro_empleado = ded.porcentaje / 100;
      else if (nombre.includes('seguro') && nombre.includes('patronal')) mapa.seguro_patronal = ded.porcentaje / 100;
      else if (nombre.includes('r.p.e') && nombre.includes('empleado')) mapa.rpe_empleado = ded.porcentaje / 100;
      else if (nombre.includes('r.p.e') && nombre.includes('patronal')) mapa.rpe_patronal = ded.porcentaje / 100;
      else if (nombre.includes('f.a.o.v') && nombre.includes('empleado')) mapa.faov_empleado = ded.porcentaje / 100;
      else if (nombre.includes('f.a.o.v') && nombre.includes('patronal')) mapa.faov_patronal = ded.porcentaje / 100;
      else if (nombre.includes('f.e.j.p')) mapa.fejp = ded.porcentaje / 100;
      else if (nombre.includes('caja')) mapa.caja_ahorro = ded.porcentaje / 100;
    });

    return mapa;
  }

  static getPrimasMap(primasDB) {
    const mapa = {
      transporte: 0,
      hijos: 0,
      hogares: 0,
      alimentacion: 0
    };
    primasDB.forEach(pri => {
      const nombre = pri.nombre.toLowerCase();
      if (nombre.includes('transporte')) mapa.transporte = pri.asignacion;
      if (nombre.includes('hijos')) mapa.hijos = pri.asignacion;
      if (nombre.includes('hogares')) mapa.hogares = pri.asignacion;
      if (nombre.includes('alimentacion')) mapa.alimentacion = pri.asignacion;
    });
    return mapa;
  }

  static async generarNomina(mes, anio, quincena) {
    // 1. Obtener todos los datos necesarios
    const empleados = await NominaActivosModel.getActivosData();
    const antiguedadesDB = await NominaActivosModel.getAntiguedades();
    const encargosDB = await NominaActivosModel.getEncargosTemporales();
    const deduccionesDB = await NominaActivosModel.getDeducciones();
    const primasDB = await NominaActivosModel.getPrimas();
    const escalasList = await NominaActivosModel.getEscalasAntiguedad();

    // Mapas
    const mapAntiguedades = {};
    antiguedadesDB.forEach(a => {
      if (!mapAntiguedades[a.empleado_id]) mapAntiguedades[a.empleado_id] = [];
      mapAntiguedades[a.empleado_id].push(a);
    });

    const mapEncargos = {};
    encargosDB.forEach(e => {
      mapEncargos[e.empleado_id] = e;
    });

    const porcentajesDed = this.getDeduccionesMap(deduccionesDB);
    const primasVal = this.getPrimasMap(primasDB);

    // Escalas dinamicas
    const escalaAntiguedad = {};
    const escalaReconocimiento = {};
    let maxAnosAnt = 0;

    escalasList.forEach(esc => {
      // Se asume que viene como decimal (ej. 0.30)
      escalaAntiguedad[esc.anios_cumplidos] = Number(esc.porcentaje_actual);
      escalaReconocimiento[esc.anios_cumplidos] = Number(esc.porcentaje_anterior);
      if (esc.anios_cumplidos > maxAnosAnt) maxAnosAnt = esc.anios_cumplidos;
    });

    const maxPorcentajeAnt = maxAnosAnt > 0 ? escalaAntiguedad[maxAnosAnt] : 0;
    const maxPorcentajeRec = maxAnosAnt > 0 ? escalaReconocimiento[maxAnosAnt] : 0;

    // Fechas y semanas para deducciones
    let fechaInicio, fechaFin;
    if (quincena == 1) {
      fechaInicio = new Date(anio, mes - 1, 1);
      fechaFin = new Date(anio, mes - 1, 15);
    } else {
      fechaInicio = new Date(anio, mes - 1, 16);
      fechaFin = new Date(anio, mes, 0); // Último día del mes
    }
    const cantidadLunes = this.contarLunes(fechaInicio, fechaFin);
    const fechaActual = new Date();

    const nominaResult = [];

    for (let data of empleados) {
      let sueldo_quincenal = Number((data.salario_base / 2).toFixed(2));

      let porcentaje_prof = data.profesionalizacion ? (data.profesionalizacion / 100) : 0;
      let profesionalizacion = Number((sueldo_quincenal * porcentaje_prof).toFixed(2));

      // Buscar % jerarquía
      let jerarquia_porcentaje = 0;
      if (data.cargo_cet) {
        let nCargo = NominaActivosService.normalizeString(data.cargo_cet);
        if (nCargo.includes('contralor')) jerarquia_porcentaje = 95;
        else if (nCargo.includes('director general') || nCargo.includes('director(a) general')) jerarquia_porcentaje = 93;
        else if (nCargo.includes('director')) jerarquia_porcentaje = 90;
        else if (nCargo.includes('jefe de division general')) jerarquia_porcentaje = 85;
        else if (nCargo.includes('coordinador') || nCargo.includes('supervisor') || nCargo.includes('jefe de division')) jerarquia_porcentaje = 80;
      }

      let salario_historico = data.salario_historico || data.salario_base;
      let prima_jerarquia = Number(((salario_historico * (jerarquia_porcentaje / 100)) / 2).toFixed(2));

      // Primas fijas
      let prima_transporte = Number((primasVal.transporte / 2).toFixed(2));
      let prima_hogares = Number((primasVal.hogares / 2).toFixed(2));
      let comp_alimentacion = data.numero_hijos > 0 ? Number(((primasVal.alimentacion / 2) * data.numero_hijos).toFixed(2)) : 0;
      let prima_hijos = data.numero_hijos > 0 ? Number(((primasVal.hijos / 2) * data.numero_hijos).toFixed(2)) : 0;

      // Antiguedad
      let diasRecientes = differenceInDays(fechaActual, new Date(data.fecha_ingreso));
      let anosAntiguedad = 0;

      if (mapAntiguedades[data.empleado_id]) {
        let diasAntiguedadHist = 0;
        mapAntiguedades[data.empleado_id].forEach(ant => {
          diasAntiguedadHist += differenceInDays(
            new Date(ant.fecha_fin || fechaActual),
            new Date(ant.fecha_inicio)
          );
        });
        anosAntiguedad = Math.floor((diasAntiguedadHist + diasRecientes) / 365);
      } else {
        anosAntiguedad = Math.floor(diasRecientes / 365);
      }

      let porcentajeAntiguedad = escalaAntiguedad[anosAntiguedad] ?? (anosAntiguedad >= maxAnosAnt ? maxPorcentajeAnt : 0);
      let antiguedad_quincenal = Number(((data.salario_base * porcentajeAntiguedad) / 2).toFixed(2));

      let porcentajeReconocimiento = escalaReconocimiento[anosAntiguedad] ?? (anosAntiguedad >= maxAnosAnt ? maxPorcentajeRec : 0);
      let prima_reconocimiento = Number(((salario_historico * porcentajeReconocimiento) / 2).toFixed(2));

      // Suplencias - Encargos
      let dif_sueldo = 0, dif_antiguedad = 0, dif_prof = 0, dif_jerarquia = 0;
      const encargo = mapEncargos[data.empleado_id];
      if (encargo) {
        let salario_sup = encargo.salario_suplencia;
        let m = Math.max(salario_sup, data.salario_base) - Math.min(salario_sup, data.salario_base);
        dif_sueldo = Number((m / 2).toFixed(2));

        let ant_sup = Number(((salario_sup * porcentajeAntiguedad) / 2).toFixed(2));
        dif_antiguedad = Number((ant_sup - antiguedad_quincenal).toFixed(2));

        let prof_sup = Number(((salario_sup / 2) * porcentaje_prof).toFixed(2));
        dif_prof = Number((prof_sup - profesionalizacion).toFixed(2));

        // Jerarquia Suplencia
        let jp_sup = 0;
        if (encargo.cargo_suplencia) {
          let nC = NominaActivosService.normalizeString(encargo.cargo_suplencia);
          if (nC.includes('contralor')) jp_sup = 95;
          else if (nC.includes('director general') || nC.includes('director(a) general')) jp_sup = 93;
          else if (nC.includes('director')) jp_sup = 90;
          else if (nC.includes('jefe de division general')) jp_sup = 85;
          else if (nC.includes('coordinador') || nC.includes('supervisor') || nC.includes('jefe de division')) jp_sup = 80;
        }
        let shS = encargo.salario_historico_suplencia || salario_sup;
        let pj_sup = Number(((shS * (jp_sup / 100)) / 2).toFixed(2));
        dif_jerarquia = Number((pj_sup - prima_jerarquia).toFixed(2));
      }

      let total_asignaciones = Number((
        sueldo_quincenal + antiguedad_quincenal + profesionalizacion + prima_jerarquia +
        prima_transporte + prima_reconocimiento + prima_hogares + comp_alimentacion + prima_hijos +
        dif_sueldo + dif_antiguedad + dif_prof + dif_jerarquia
      ).toFixed(2));

      // Asignacion mensual base para deducciones
      let asignacion_mensual = Number(((
        sueldo_quincenal + antiguedad_quincenal + profesionalizacion +
        prima_jerarquia + prima_transporte + prima_reconocimiento + prima_hogares
      ) * 2).toFixed(2));

      // Deducciones SSO, RPE, etc
      let base_ss = (asignacion_mensual > 650.00) ? 650.00 : (asignacion_mensual / 2);
      let factor_ss = (asignacion_mensual > 650.00) ? 12 : 24;

      let seguro_empleado = Number((((base_ss * factor_ss) / 52) * porcentajesDed.seguro_empleado * cantidadLunes).toFixed(2));
      let seguro_patronal = Number((((base_ss * factor_ss) / 52) * porcentajesDed.seguro_patronal * cantidadLunes).toFixed(2));

      let limite_rpe = 130 * 10;
      let base_rpe = (asignacion_mensual > limite_rpe) ? limite_rpe : (asignacion_mensual / 2);
      let factor_rpe = (asignacion_mensual > limite_rpe) ? 12 : 24;

      let rpe_empleado = Number((((base_rpe * factor_rpe) / 52) * porcentajesDed.rpe_empleado * cantidadLunes).toFixed(2));
      let rpe_patronal = Number((((base_rpe * factor_rpe) / 52) * porcentajesDed.rpe_patronal * cantidadLunes).toFixed(2));

      let faov_empleado = Number((total_asignaciones * porcentajesDed.faov_empleado).toFixed(2));
      let faov_patronal = Number((faov_empleado * (porcentajesDed.faov_patronal / porcentajesDed.faov_empleado || 0)).toFixed(2));

      let base_fejp = sueldo_quincenal + antiguedad_quincenal + dif_sueldo + dif_antiguedad;
      let fejp = Number((base_fejp * porcentajesDed.fejp).toFixed(2));

      // Caja (se omitió validación a profundidad, aplicando a sueldo base + diff)
      let caja_ahorro = Number(((sueldo_quincenal + dif_sueldo) * porcentajesDed.caja_ahorro).toFixed(2));

      let total_deducciones = Number((seguro_empleado + rpe_empleado + faov_empleado + fejp + caja_ahorro).toFixed(2));

      let salario_neto = Number((total_asignaciones - total_deducciones).toFixed(2));

      nominaResult.push({
        empleado: {
          cedula: data.cedula,
          nombres: data.nombre,
          apellidos: data.apellido,
          departamento: data.departamento,
          cargo_cet: data.cargo_cet,
          cargo_onapre: data.cargo_onapre,
          salario_base_mensual: data.salario_base
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
          diferencias_suplencia: encargo ? {
            sueldo: dif_sueldo,
            antiguedad: dif_antiguedad,
            profesionalizacion: dif_prof,
            jerarquia: dif_jerarquia
          } : null,
          total_asignaciones
        },
        deducciones: {
          seguro_empleado,
          rpe_empleado,
          faov_empleado,
          fejp,
          caja_ahorro,
          total_deducciones
        },
        salario_neto
      });
    }

    return nominaResult;
  }
}
