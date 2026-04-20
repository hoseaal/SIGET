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

    static async crear(datos) {
        // 1. Validaciones básicas de campos obligatorios
        const { nro_act, fecha, direc_id, equipo_id, usuario_id } = datos;
        if (!nro_act || !fecha || !direc_id || !equipo_id || !usuario_id) {
            throw new Error('Faltan campos obligatorios para registrar la actividad');
        }

        // 2. Normalización de textos (Limpieza de espacios y mayúsculas)
        const observacionesLimpias = datos.observaciones
            ? datos.observaciones.trim().replace(/\s+/g, ' ').toUpperCase()
            : 'SIN OBSERVACIONES';

        // 3. Llamada al modelo con los datos procesados
        return await actividadesModel.create({
            ...datos,
            observaciones: observacionesLimpias
        });
    }

    static async actualizar(id, datos) {
        // Verificamos si existe antes de intentar actualizar
        const existe = await actividadesModel.getById(id);
        if (!existe) throw new Error('La actividad que intentas actualizar no existe');

        // Normalizamos observaciones si vienen en el update
        if (datos.observaciones) {
            datos.observaciones = datos.observaciones.trim().replace(/\s+/g, ' ').toUpperCase();
        }

        // Combinamos datos viejos con nuevos para no perder información si el update es parcial
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