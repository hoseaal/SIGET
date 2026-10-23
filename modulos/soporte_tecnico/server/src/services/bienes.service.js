import { DepartamentoMapModel } from '../models/departamentoMap.model.js'

const BASE_URL = String(process.env.BIENES_API_URL || 'http://localhost:5001').replace(/\/+$/, '')
const API_KEY = process.env.BIENES_API_KEY
const TIMEOUT = Number(process.env.BIENES_API_TIMEOUT) || 10000

function buildQuery (params = {}) {
  const search = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return
    if (Array.isArray(value)) {
      const joined = value.filter(v => v !== undefined && v !== null && v !== '').join(',')
      if (joined) search.set(key, joined)
      return
    }
    search.set(key, String(value))
  })

  const query = search.toString()
  return query ? `?${query}` : ''
}

async function request (path, params = {}) {
  if (!API_KEY) {
    throw new Error('BIENES_API_KEY no esta configurada en el servidor de Soporte Tecnico')
  }

  const url = `${BASE_URL}${path}${buildQuery(params)}`

  let response
  try {
    response = await fetch(url, {
      headers: {
        Accept: 'application/json',
        'x-api-key': API_KEY
      },
      signal: AbortSignal.timeout(TIMEOUT)
    })
  } catch (error) {
    const timeout = error.name === 'TimeoutError' || error.name === 'AbortError'
    const message = timeout
      ? 'La API de Bienes Muebles no respondio a tiempo'
      : `No se pudo conectar con la API de Bienes Muebles: ${error.message}`
    const apiError = new Error(message)
    apiError.status = timeout ? 504 : 502
    throw apiError
  }

  if (!response.ok) {
    let message = `Error HTTP ${response.status} de la API de Bienes Muebles`
    try {
      const data = await response.json()
      message = data.error || data.message || message
    } catch (_) {
      // respuesta no JSON
    }
    const apiError = new Error(message)
    apiError.status = response.status
    throw apiError
  }

  return await response.json()
}

async function traducirDepartamento (filters = {}) {
  const params = { ...filters }
  let departamentoMapeado = true

  if (params.departamento_id !== undefined && params.departamento_id !== null && params.departamento_id !== '') {
    const depIde = await DepartamentoMapModel.getDepIde(params.departamento_id)
    delete params.departamento_id

    if (depIde !== null && depIde !== undefined) {
      params.dep_ide = depIde
    } else {
      delete params.dep_ide
      departamentoMapeado = false
    }
  }

  return { params, departamentoMapeado }
}

export class BienesService {
  static async listar (filters = {}) {
    const { params, departamentoMapeado } = await traducirDepartamento(filters)
    const data = await request('/api/soporte/bienes', params)
    return {
      ...data,
      meta: {
        ...(data.meta || {}),
        departamento_mapeado: departamentoMapeado
      }
    }
  }

  static async resumen (filters = {}) {
    const { params, departamentoMapeado } = await traducirDepartamento(filters)
    const data = await request('/api/soporte/bienes/resumen', params)
    return { ...data, departamento_mapeado: departamentoMapeado }
  }

  static async catalogos () {
    return await request('/api/soporte/bienes/catalogos')
  }

  static async lookup (ids) {
    const lista = Array.isArray(ids) ? ids.filter(Boolean) : String(ids || '').split(',').filter(Boolean)
    if (!lista.length) return []
    return await request('/api/soporte/bienes/lookup', { ids: lista.join(',') })
  }

  static async detalle (id) {
    return await request(`/api/soporte/bienes/${encodeURIComponent(id)}`)
  }

  static async exportar (filters = {}) {
    const { params } = await traducirDepartamento(filters)

    if (!API_KEY) {
      throw new Error('BIENES_API_KEY no esta configurada en el servidor de Soporte Tecnico')
    }

    const url = `${BASE_URL}/api/soporte/bienes/export${buildQuery(params)}`
    const response = await fetch(url, {
      headers: { 'x-api-key': API_KEY },
      signal: AbortSignal.timeout(TIMEOUT * 3)
    })

    if (!response.ok) {
      let message = `Error HTTP ${response.status} al exportar desde Bienes Muebles`
      try {
        const data = await response.json()
        message = data.error || data.message || message
      } catch (_) {
        // respuesta no JSON
      }
      throw new Error(message)
    }

    return {
      buffer: Buffer.from(await response.arrayBuffer()),
      contentType: response.headers.get('content-type') || 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      contentDisposition: response.headers.get('content-disposition') || 'attachment; filename="Bienes_Soporte.xlsx"'
    }
  }

  static async obtenerMapeoDepartamentos () {
    return await DepartamentoMapModel.getAll()
  }
}
