import { actividadesModel } from '../models/actividades.model.js';

export class ActividadesService {

    static async obtenerTodas() {
        const actividades = await actividadesModel.getAll();
        // Aquí podrías formatear fechas antes de enviarlas al frontend si lo deseas
        return actividades;
    }

    static async obtenerPorId(id) {
        if (!id) throw new Error('El ID de la actividad es obligatorio');

        const actividad = await actividadesModel.getById(id);
        if (!actividad) throw new Error('Actividad no encontrada');

        return actividad;
    }

    static async generarNroActividad() {
        const year = new Date().getFullYear();
        const prefix = `ACT-${year}-`;
        const lastNumber = await actividadesModel.getLastActivityNumber(prefix);
        
        let nextSequence = 1;
        if (lastNumber) {
            const parts = lastNumber.split('-');
            const lastSeq = parseInt(parts[parts.length - 1]);
            if (!isNaN(lastSeq)) nextSequence = lastSeq + 1;
        }
        
        return `${prefix}${String(nextSequence).padStart(4, '0')}`;
    }

    static async crear(datos) {
        // 1. Validaciones básicas de campos obligatorios
        const { nro_act, fecha, direc_id, usuario_id, tipo_act, clasificacion_id } = datos;
        if (!nro_act || !fecha || !direc_id || !usuario_id || !tipo_act || !clasificacion_id) {
            throw new Error('Faltan campos obligatorios para registrar la actividad');
        }

        // 2. Normalización de textos y valores por defecto
        const observationsFinal = datos.observaciones
            ? datos.observaciones.trim().toUpperCase()
            : 'SIN OBSERVACIONES';
            
        const processedData = {
            ...datos,
            equipo_id: datos.equipo_id || null,
            descrip_id: datos.descrip_id || 1, // Por defecto 1 si no se usa
            observaciones: observationsFinal
        };

        return await actividadesModel.create(processedData);
    }

    static async actualizar(id, datos) {
        const existe = await actividadesModel.getById(id);
        if (!existe) throw new Error('La actividad que intentas actualizar no existe');

        if (datos.observaciones) {
            datos.observaciones = datos.observaciones.trim().replace(/\s+/g, ' ').toUpperCase();
        }

        const datosActualizados = { ...existe, ...datos };
        return await actividadesModel.update(id, datosActualizados);
    }

    static async eliminar(id) {
        const eliminado = await actividadesModel.delete(id);
        if (!eliminado) {
            throw new Error('No se pudo eliminar la actividad o no existe');
        }
        return { message: 'Actividad eliminada correctamente' };
    }
}