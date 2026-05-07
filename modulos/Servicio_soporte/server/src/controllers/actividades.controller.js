import { ActividadesService } from '../services/actividades.service.js';

export const obtenerTodas = async (req, res) => {
    try {
        const actividades = await ActividadesService.obtenerTodas();
        res.json(actividades);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const generarProximoNumero = async (req, res) => {
    try {
        const numero = await ActividadesService.generarNroActividad();
        res.json({ numero });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const obtenerPorId = async (req, res) => {
    try {
        const { id } = req.params;
        const actividad = await ActividadesService.obtenerPorId(id);
        res.json(actividad);
    } catch (error) {
        // Si el servicio lanza "Actividad no encontrada", enviamos 404
        const status = error.message.includes('encontrada') ? 404 : 500;
        res.status(status).json({ error: error.message });
    }
};

export const crear = async (req, res) => {
    try {
        // req.body contiene los datos enviados desde el formulario de React
        const nuevaActividad = await ActividadesService.crear(req.body);
        res.status(201).json({
            message: 'Actividad registrada exitosamente',
            data: nuevaActividad
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

export const actualizar = async (req, res) => {
    try {
        const { id } = req.params;
        const actividadActualizada = await ActividadesService.actualizar(id, req.body);
        res.json({
            message: 'Actividad actualizada correctamente',
            data: actividadActualizada
        });
    } catch (error) {
        const status = error.message.includes('existe') ? 404 : 400;
        res.status(status).json({ error: error.message });
    }
};

export const eliminar = async (req, res) => {
    try {
        const { id } = req.params;
        const resultado = await ActividadesService.eliminar(id);
        res.json(resultado);
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
};