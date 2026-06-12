import { NominaObrerosModel } from '../models/nominaObreros.model.js';
import { differenceInDays } from 'date-fns';

export class NominaObreroService {

    // ─── Helpers ───────────────────────────────────────────────────────────────

    static normalizeString(str) {
        if (!str) return '';
        return str
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .trim();
    }

    static contarLunes(fechaInicio, fechaFin) {
        let count = 0;
        const cur = new Date(fechaInicio);
        const fin = new Date(fechaFin);
        cur.setHours(0, 0, 0, 0);
        fin.setHours(0, 0, 0, 0);

        while (cur <= fin) {
            if (cur.getDay() === 1) count++;
            cur.setDate(cur.getDate() + 1);
        }
        return count;
    }

    static getDeduccionesMap(deduccionesDB) {
        const mapa = {
            seguro_empleado: 0.04,
            seguro_patronal: 0.09,
            rpe_empleado: 0.005,
            rpe_patronal: 0.02,
            faov_empleado: 0.01,
            faov_patronal: 0.02,
            caja_ahorro: 0.10,
            caja_ahorro_patronal: 0.10
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
            else if (n.includes('caja')) {
                if (n.includes('patronal')) mapa.caja_ahorro_patronal = pct;
                else mapa.caja_ahorro = pct;
            }
        });

        return mapa;
    }

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



    static getPorcentajeAntiguedad(anosAntiguedad, escalaAntiguedad, campo = 'porcentaje_actual') {
        let porcentaje = 0;
        for (const esc of escalaAntiguedad) {
            if (anosAntiguedad >= esc.anios_cumplidos) {
                porcentaje = Number(esc[campo]);
            }
        }
        return porcentaje / 100;
    }

    // ─── Método principal ──────────────────────────────────────────────────────

    static async generarNomina(mes, anio, quincena) {
        const [
            empleados,
            deduccionesDB,
            primasDB,
            escalasList,
            salarioMinimo
        ] = await Promise.all([
            NominaObrerosModel.getObrerosData(),
            NominaObrerosModel.getDeducciones(),
            NominaObrerosModel.getPrimasGenerales(),
            NominaObrerosModel.getEscalasAntiguedad(),
            NominaObrerosModel.getMinSalarialBase()
        ]);

        const faovApplyCap = process.env.FAOV_APPLY_CAP !== 'false';

        const porcentajesDed = this.getDeduccionesMap(deduccionesDB);
        const primasVal = this.getPrimasMap(primasDB);

        let fechaInicio, fechaFin;
        if (Number(quincena) === 1) {
            fechaInicio = new Date(anio, mes - 1, 1);
            fechaFin = new Date(anio, mes - 1, 15);
        } else {
            fechaInicio = new Date(anio, mes - 1, 16);
            fechaFin = new Date(anio, mes, 0);
        }
        const cantidadLunes = this.contarLunes(fechaInicio, fechaFin);


        const nominaResult = [];

        for (const data of empleados) {
            // ── ASIGNACIONES ──────────────────────────────────────────────────────

            // SALARIO BASE (con validación de mínimo dinámico)
            const salario_base_efectivo = Number(data.salario_base) < salarioMinimo
                ? (() => { console.error(`[ALERTA DE SEGURIDAD] Salario base (${data.salario_base}) inferior al mínimo (${salarioMinimo}) para obrero ${data.cedula}`); return salarioMinimo; })()
                : Number(data.salario_base);

            const sueldo_quincenal = Number((salario_base_efectivo / 2).toFixed(2));
            const salario_historico = Number(data.salario_historico) || salario_base_efectivo;

            const anosAntiguedad = Number(data.anios_antiguedad) || 0;
            const pct_antiguedad = this.getPorcentajeAntiguedad(anosAntiguedad, escalasList, 'porcentaje_actual');
            const antiguedad_quincenal = Number((sueldo_quincenal * pct_antiguedad).toFixed(2));

            const prima_transporte = Number((primasVal.transporte / 2).toFixed(2));
            const prima_hogares = Number((primasVal.hogares / 2).toFixed(2));

            const num_hijos = Number(data.numero_hijos) || 0;
            const comp_alimentacion = num_hijos > 0 ? Number(((primasVal.alimentacion * num_hijos) / 2).toFixed(2)) : 0;
            const prima_hijos = num_hijos > 0 ? Number(((primasVal.hijos / 2) * num_hijos).toFixed(2)) : 0;

            const pct_reconocimiento = this.getPorcentajeAntiguedad(anosAntiguedad, escalasList, 'porcentaje_anterior');
            const prima_reconocimiento = Number(((salario_historico * pct_reconocimiento) / 2).toFixed(2));

            const total_asignaciones = Number((
                sueldo_quincenal +
                antiguedad_quincenal +
                prima_transporte +
                prima_reconocimiento +
                prima_hogares +
                comp_alimentacion +
                prima_hijos
            ).toFixed(2));

            // ── DEDUCCIONES ───────────────────────────────────────────────────────

            const asignacion_mensual = Number((total_asignaciones * 2).toFixed(2));

            // IVSS: cap de 5 salarios mínimos sobre la base mensual
            const ivss_base_mensual_cap = 5 * salarioMinimo;
            const asignacion_mensual_ivss = Math.min(asignacion_mensual, ivss_base_mensual_cap);
            const asignacion_semanal_ivss = Number(((asignacion_mensual_ivss * 12) / 52).toFixed(6));

            const seguro_empleado = Number((asignacion_semanal_ivss * porcentajesDed.seguro_empleado * cantidadLunes).toFixed(2));
            const seguro_patronal = Number((asignacion_semanal_ivss * porcentajesDed.seguro_patronal * cantidadLunes).toFixed(2));

            const rpe_empleado = Number((asignacion_semanal_ivss * porcentajesDed.rpe_empleado * cantidadLunes).toFixed(2));
            const rpe_patronal = Number((asignacion_semanal_ivss * porcentajesDed.rpe_patronal * cantidadLunes).toFixed(2));

            // FAOV: cap de 10 salarios mínimos sobre el quincenal
            const faov_base_quincenal = faovApplyCap
                ? Math.min(total_asignaciones, (10 * salarioMinimo) / 2)
                : total_asignaciones;
            const faov_empleado = Number((faov_base_quincenal * porcentajesDed.faov_empleado).toFixed(2));
            const faov_patronal = Number((faov_base_quincenal * porcentajesDed.faov_patronal).toFixed(2));

            // FONDO DE JUBILACION = ((salario quincenal + prima antiguedad)*3%)
            const fondo_jubilacion = Number(((sueldo_quincenal + antiguedad_quincenal) * 0.03).toFixed(2));

            const caja_ahorro = Number((sueldo_quincenal * porcentajesDed.caja_ahorro).toFixed(2));
            const caja_ahorro_patronal = Number((sueldo_quincenal * porcentajesDed.caja_ahorro_patronal).toFixed(2));

            const total_deducciones = Number((
                seguro_empleado + rpe_empleado + faov_empleado + fondo_jubilacion + caja_ahorro
            ).toFixed(2));

            const salario_neto = Number((total_asignaciones - total_deducciones).toFixed(2));

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
                    prima_transporte,
                    prima_reconocimiento,
                    prima_hogares,
                    complemento_alimentacion: comp_alimentacion,
                    prima_hijos,
                    total_asignaciones
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
                    fondo_jubilacion,
                    caja_ahorro,
                    caja_ahorro_patronal,
                    total_deducciones
                },
                salario_neto
            });
        }

        return nominaResult;
    }
}
