import { NominaActivosService } from '../services/nominaActivos.service.js';

export class NominaActivosController {
  static async calcularNominaActivos(req, res) {
    try {
      // Por defecto calcular nomina del mes actual y quincena 1 si no se envía
      const hoy = new Date();
      const mes = parseInt(req.query.mes) || (hoy.getMonth() + 1);
      const anio = parseInt(req.query.anio) || hoy.getFullYear();
      const quincena = parseInt(req.query.quincena) || (hoy.getDate() <= 15 ? 1 : 2);

      const nominaProcessada = await NominaActivosService.generarNomina(mes, anio, quincena);

      res.status(200).json({
        ok: true,
        periodo: { mes, anio, quincena },
        total_funcionarios: nominaProcessada.length,
        datos: nominaProcessada
      });
    } catch (error) {
      console.error('Error calculando la nómina de activos:', error);
      res.status(500).json({ ok: false, message: 'Error interno al procesar la nómina', error: error.message });
    }
  }
}
