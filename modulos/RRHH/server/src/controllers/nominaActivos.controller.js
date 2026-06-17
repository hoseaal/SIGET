import { NominaActivosService } from '../services/nominaActivos.service.js';
import {
  calcularPeriodoNominaObjetivo,
  crearEncabezadoAuditoria,
  normalizarTipoNomina
} from '../utils/periodoNomina.js';
import { validarPeriodoDisponible } from '../utils/nominaResponse.js';

export class NominaActivosController {
  static async obtenerPeriodoObjetivo(req, res) {
    try {
      const periodo = calcularPeriodoNominaObjetivo();

      res.status(200).json({
        ok: true,
        periodo,
        tiposNomina: [
          { value: '1', label: 'Primera Quincena (1)' },
          { value: '2', label: 'Segunda Quincena (2)' },
          { value: 'unificada', label: 'Nomina Unificada (Mensual)' }
        ]
      });
    } catch (error) {
      console.error('Error obteniendo periodo objetivo de nomina:', error);
      res.status(500).json({ ok: false, message: 'Error interno al obtener el periodo de nomina' });
    }
  }

  static async calcularNominaActivos(req, res) {
    try {
      const periodo = calcularPeriodoNominaObjetivo();
      const tipoNomina = normalizarTipoNomina(req.query.tipoNomina ?? req.query.quincena);
      const quincenas = tipoNomina === 'unificada' ? [1, 2] : [Number(tipoNomina)];

      // ─── Capa 2: Validación preventiva (409 Conflict) ─────────────────
      await validarPeriodoDisponible(periodo.mes, periodo.anio, quincenas, NominaActivosService.tipoPersonal);

      const resultados = await Promise.all(
        quincenas.map(quincena => NominaActivosService.generarNomina(periodo.mes, periodo.anio, quincena))
      );
      const datos = tipoNomina === 'unificada'
        ? { isUnificada: true, q1: resultados[0], q2: resultados[1] }
        : resultados[0];

      // Persistencia automática del histórico
      console.log(`[Activos] Procesando quincenas: [${quincenas}], mes: ${periodo.mes}, anio: ${periodo.anio}, registros por quincena: ${resultados.map(r => r?.length ?? 0).join(', ')}`);
      const persistencia = {};
      for (let i = 0; i < quincenas.length; i++) {
        const q = quincenas[i];
        const resultado = resultados[i];
        console.log(`[Activos] Persistiendo Q${q} (${resultado?.length ?? 0} registros)...`);
        const resPersist = await NominaActivosService.persistirNomina(resultado, periodo.mes, periodo.anio, q);
        console.log(`[Activos] Q${q} persistido:`, JSON.stringify(resPersist));
        persistencia[`q${q}`] = resPersist;
      }

      res.status(200).json({
        ok: true,
        periodo: { ...periodo, tipoNomina },
        auditoria: {
          calculoEnCaliente: true,
          persistenciaAutomatica: true,
          registrosPersistidos: persistencia,
          encabezadoExcel: crearEncabezadoAuditoria(periodo)
        },
        total_funcionarios: tipoNomina === 'unificada' ? resultados[0].length + resultados[1].length : datos.length,
        datos
      });
    } catch (error) {
      console.error('Error calculando la nomina de activos:', error);
      const status = error.statusCode || (error.message?.includes('Tipo de nomina invalido') ? 400 : 500);
      const message = error.isConflict ? error.message : (status === 400 ? error.message : 'Error al procesar la nomina');
      res.status(status).json({ ok: false, message, error: error.message });
    }
  }

  static async firmantes(req, res) {
    try {
      const datos = await NominaActivosService.obtenerFirmantes();
      res.status(200).json({ ok: true, firmantes: datos });
    } catch (error) {
      console.error('Error obteniendo firmantes:', error);
      res.status(500).json({ ok: false, message: 'Error al obtener los firmantes', error: error.message });
    }
  }

  static async resumenMensual(req, res) {
    try {
      const periodo = calcularPeriodoNominaObjetivo();
      const datos = await NominaActivosService.generarResumenMensual(periodo.mes, periodo.anio);

      res.status(200).json({
        ok: true,
        periodo: { ...periodo, tipoNomina: 'mensual' },
        auditoria: {
          calculoEnCaliente: true,
          encabezadoExcel: `Resumen Mensual - ${crearEncabezadoAuditoria(periodo)}`
        },
        total_funcionarios: datos.length,
        datos
      });
    } catch (error) {
      console.error('Error generando resumen mensual:', error);
      res.status(500).json({ ok: false, message: 'Error al generar el resumen mensual', error: error.message });
    }
  }
}
