import { CajaAhorroService } from '../services/cajaAhorro.service.js';

export class CajaAhorroController {
  static async listarPorEmpleado(req, res) {
    try {
      const { empleado_id } = req.params;
      const data = await CajaAhorroService.listarPorEmpleado(empleado_id);
      res.json({ ok: true, data });
    } catch (error) {
      res.status(400).json({ ok: false, error: error.message });
    }
  }

  static async listarPorPeriodo(req, res) {
    try {
      const { mes, anio, quincena_no } = req.query;
      if (!mes || !anio) {
        return res.status(400).json({ ok: false, error: 'mes y anio son requeridos' });
      }
      const data = await CajaAhorroService.listarPorPeriodo(
        Number(mes), Number(anio), quincena_no ? Number(quincena_no) : null
      );
      res.json({ ok: true, data });
    } catch (error) {
      res.status(400).json({ ok: false, error: error.message });
    }
  }

  static async resumenPeriodo(req, res) {
    try {
      const { mes, anio, quincena_no } = req.query;
      if (!mes || !anio) {
        return res.status(400).json({ ok: false, error: 'mes y anio son requeridos' });
      }
      const resumen = await CajaAhorroService.obtenerResumenPeriodo(
        Number(mes), Number(anio), quincena_no ? Number(quincena_no) : null
      );
      res.json({ ok: true, resumen });
    } catch (error) {
      res.status(400).json({ ok: false, error: error.message });
    }
  }

  static async reporteCajaAhorro(req, res) {
    try {
      const { mes, anio, quincena_no, tipo_personal } = req.query;
      if (!mes || !anio) {
        return res.status(400).json({ ok: false, error: 'mes y anio son requeridos' });
      }
      const resultado = await CajaAhorroService.obtenerReporte({
        mes, anio, quincena_no, tipo_personal
      });
      res.json({ ok: true, ...resultado });
    } catch (error) {
      res.status(400).json({ ok: false, error: error.message });
    }
  }

  static async eliminar(req, res) {
    try {
      const { id_caja } = req.params;
      await CajaAhorroService.eliminar(id_caja);
      res.json({ ok: true, message: 'Registro eliminado' });
    } catch (error) {
      res.status(404).json({ ok: false, error: error.message });
    }
  }
}
