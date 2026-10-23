import { ActividadModel } from '../models/actividad.model.js'
import { TipoActividadModel } from '../models/tipoActividad.model.js'
import { BienesService } from './bienes.service.js'
import { Validaciones } from '../utils/validations.js'

function normalizarFecha (fecha) {
  if (!fecha) return null
  const value = String(fecha)
  return value.length >= 10 ? value.slice(0, 10) : value
}

async function validarClasificacion (datos) {
  const tipo = await TipoActividadModel.getById(datos.tipo_actividad_id)
  if (!tipo) throw new Error('El tipo de actividad seleccionado no existe')
  if (Number(tipo.clasificacion_id) !== Number(datos.clasificacion_id)) {
    throw new Error('El tipo de actividad no pertenece a la clasificacion seleccionada')
  }
  return tipo.clasificacion_id
}

export class ActividadService {
  static async enriquecer (actividades) {
    const esLista = Array.isArray(actividades)
    const lista = esLista ? actividades : [actividades]
    if (!lista.length || !lista[0]) return actividades

    const ids = [...new Set(lista.map(a => a?.bim_ide).filter(Boolean))]

    if (!ids.length) {
      const sinBien = lista.map(a => ({ ...a, equipo_nro_bien: a?.bim_ide || null }))
      return esLista ? sinBien : sinBien[0]
    }

    try {
      const bienes = await BienesService.lookup(ids)
      const mapa = new Map(bienes.map(b => [String(b.bim_ide), b]))
      const enriquecidas = lista.map(a => {
        const bien = mapa.get(String(a.bim_ide))
        return {
          ...a,
          equipo_nro_bien: a.bim_ide || null,
          equipo_descripcion: bien?.bim_des || null,
          equipo_tipo: bien?.tipo_soporte || null,
          equipo_marca: bien?.marca || null,
          equipo_modelo: bien?.modelo || null,
          equipo_serial: bien?.bim_ser || null
        }
      })
      return esLista ? enriquecidas : enriquecidas[0]
    } catch (error) {
      console.error('No se pudieron consultar los bienes para las actividades:', error.message)
      const fallback = lista.map(a => ({ ...a, equipo_nro_bien: a?.bim_ide || null }))
      return esLista ? fallback : fallback[0]
    }
  }

  static async obtenerTodas (filters) {
    const actividades = await ActividadModel.getAll(filters)
    return await this.enriquecer(actividades)
  }

  static async obtenerPorId (id) {
    const actividad = await ActividadModel.getById(id)
    if (!actividad) throw new Error('Actividad no encontrada')
    return await this.enriquecer(actividad)
  }

  static async generarNroActividad () {
    const year = new Date().getFullYear()
    const prefix = `ACT-${year}-`
    const lastNumber = await ActividadModel.getLastActivityNumber(prefix)

    let nextSequence = 1
    if (lastNumber) {
      const parts = lastNumber.split('-')
      const lastSeq = parseInt(parts[parts.length - 1], 10)
      if (!isNaN(lastSeq)) nextSequence = lastSeq + 1
    }

    return `${prefix}${String(nextSequence).padStart(4, '0')}`
  }

  static async crear (datos, usuarioId) {
    Validaciones.requerido(datos.fecha, 'fecha')
    Validaciones.requerido(datos.departamento_id, 'departamento_id')
    Validaciones.requerido(datos.tipo_actividad_id, 'tipo_actividad_id')
    Validaciones.requerido(datos.clasificacion_id, 'clasificacion_id')

    const clasificacion_id = await validarClasificacion(datos)

    const nro_act = datos.nro_act && String(datos.nro_act).trim()
      ? String(datos.nro_act).trim()
      : await this.generarNroActividad()

    const observaciones = datos.observaciones
      ? String(datos.observaciones).trim().replace(/\s+/g, ' ').toUpperCase()
      : 'SIN OBSERVACIONES'

    return await ActividadModel.create({
      nro_act,
      fecha: normalizarFecha(datos.fecha),
      departamento_id: datos.departamento_id,
      clasificacion_id,
      tipo_actividad_id: datos.tipo_actividad_id,
      bim_ide: datos.bim_ide || null,
      usuario_id: usuarioId || datos.usuario_id,
      observaciones
    })
  }

  static async actualizar (id, datos) {
    const existe = await ActividadModel.getById(id)
    if (!existe) throw new Error('La actividad que intentas actualizar no existe')

    Validaciones.requerido(datos.fecha, 'fecha')
    Validaciones.requerido(datos.departamento_id, 'departamento_id')
    Validaciones.requerido(datos.tipo_actividad_id, 'tipo_actividad_id')
    Validaciones.requerido(datos.clasificacion_id, 'clasificacion_id')

    const clasificacion_id = await validarClasificacion(datos)

    const observaciones = datos.observaciones
      ? String(datos.observaciones).trim().replace(/\s+/g, ' ').toUpperCase()
      : 'SIN OBSERVACIONES'

    return await ActividadModel.update(id, {
      nro_act: datos.nro_act || existe.nro_act,
      fecha: normalizarFecha(datos.fecha),
      departamento_id: datos.departamento_id,
      clasificacion_id,
      tipo_actividad_id: datos.tipo_actividad_id,
      bim_ide: datos.bim_ide || null,
      usuario_id: datos.usuario_id || existe.usuario_id,
      observaciones
    })
  }

  static async eliminar (id) {
    const eliminado = await ActividadModel.delete(id)
    if (!eliminado) throw new Error('No se pudo eliminar la actividad o no existe')
    return { message: 'Actividad eliminada correctamente' }
  }

  static async obtenerEstadisticas () {
    const stats = await ActividadModel.getStats()

    try {
      const resumen = await BienesService.resumen()
      return {
        ...stats,
        total_equipos: Number(resumen.total) || 0,
        bienes_por_tipo: resumen.por_tipo || []
      }
    } catch (error) {
      console.error('No se pudo obtener el resumen de Bienes Muebles:', error.message)
      return {
        ...stats,
        total_equipos: 0,
        bienes_por_tipo: []
      }
    }
  }
}
