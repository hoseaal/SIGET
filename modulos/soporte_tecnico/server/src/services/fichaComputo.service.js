import { FichaComputoModel } from '../models/fichaComputo.model.js'
import { BienesService } from './bienes.service.js'

const LIMITES = {
  nombre_equipo: 100,
  sistema_operativo: 100,
  version_office: 100,
  marca: 100,
  modelo: 150,
  serial: 100,
  ip: 45,
  mac_address: 17,
  anydesk: 50,
  elaborado_por: 100,
  observaciones: 4000
}

const LIMITES_COMPONENTE = {
  tipo: 50,
  marca: 100,
  modelo: 150,
  serial: 100,
  capacidad: 100,
  nro_bien: 50,
  observaciones: 255
}

const CAMPOS_COMPONENTE = ['tipo', 'marca', 'modelo', 'serial', 'capacidad', 'nro_bien', 'observaciones']

function errorValidacion (message, status = 400) {
  const error = new Error(message)
  error.status = status
  return error
}

function limpiarTexto (valor, campo, maximo, { obligatorio = false } = {}) {
  if (valor === undefined || valor === null) {
    if (obligatorio) throw errorValidacion(`El campo ${campo} es obligatorio`)
    return null
  }

  const texto = String(valor).trim()
  if (!texto) {
    if (obligatorio) throw errorValidacion(`El campo ${campo} es obligatorio`)
    return null
  }

  if (texto.length > maximo) {
    throw errorValidacion(`El campo ${campo} no puede superar ${maximo} caracteres`)
  }

  return texto
}

function normalizarIp (valor) {
  const ip = limpiarTexto(valor, 'ip', LIMITES.ip)
  if (!ip) return null

  const partes = ip.split('.')
  const valida = partes.length === 4 && partes.every(parte => {
    if (!/^\d{1,3}$/.test(parte)) return false
    const numero = Number(parte)
    return numero >= 0 && numero <= 255
  })

  if (!valida) throw errorValidacion('La direccion IP no es valida (ej. 192.168.1.50)')
  return ip
}

function normalizarMac (valor) {
  const mac = limpiarTexto(valor, 'mac_address', LIMITES.mac_address)
  if (!mac) return null

  if (!/^([0-9A-Fa-f]{2}[:-]){5}[0-9A-Fa-f]{2}$/.test(mac)) {
    throw errorValidacion('La direccion MAC no es valida (ej. 00:1A:2B:3C:4D:5E)')
  }

  return mac.toUpperCase().replace(/-/g, ':')
}

function esComputador (bien) {
  const tipo = String(bien?.tipo_soporte || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()

  return tipo.includes('computador') || tipo.includes('laptop') ||
    tipo.includes('portatil') || tipo.includes('desktop') || tipo === 'pc'
}

function normalizarDetalle (datos = {}) {
  return {
    nombre_equipo: limpiarTexto(datos.nombre_equipo, 'nombre_equipo', LIMITES.nombre_equipo),
    sistema_operativo: limpiarTexto(datos.sistema_operativo, 'sistema_operativo', LIMITES.sistema_operativo),
    version_office: limpiarTexto(datos.version_office, 'version_office', LIMITES.version_office),
    marca: limpiarTexto(datos.marca, 'marca', LIMITES.marca),
    modelo: limpiarTexto(datos.modelo, 'modelo', LIMITES.modelo),
    serial: limpiarTexto(datos.serial, 'serial', LIMITES.serial),
    ip: normalizarIp(datos.ip),
    mac_address: normalizarMac(datos.mac_address),
    anydesk: limpiarTexto(datos.anydesk, 'anydesk', LIMITES.anydesk),
    elaborado_por: limpiarTexto(datos.elaborado_por, 'elaborado_por', LIMITES.elaborado_por),
    observaciones: limpiarTexto(datos.observaciones, 'observaciones', LIMITES.observaciones)
  }
}

function normalizarComponentes (componentes) {
  if (componentes === undefined || componentes === null) return []
  if (!Array.isArray(componentes)) {
    throw errorValidacion('Los componentes deben enviarse como una lista')
  }

  const resultado = []

  for (const [indice, componente] of componentes.entries()) {
    if (!componente || typeof componente !== 'object') continue

    const limpio = {}
    for (const campo of CAMPOS_COMPONENTE) {
      limpio[campo] = limpiarTexto(
        componente[campo],
        `${campo} del componente ${indice + 1}`,
        LIMITES_COMPONENTE[campo]
      )
    }

    const tieneDatos = CAMPOS_COMPONENTE
      .filter(campo => campo !== 'tipo')
      .some(campo => limpio[campo])

    // Las filas que solo tienen el tipo (por ejemplo, las filas guia del
    // formulario) no se guardan si el usuario no completo ningun dato.
    if (!tieneDatos) continue

    // El tipo tambien es opcional; si no se selecciono, se identifica
    // el componente como "Sin especificar".
    if (!limpio.tipo) limpio.tipo = 'Sin especificar'

    resultado.push(limpio)
  }

  return resultado
}

export class FichaComputoService {
  static async obtener (bimIde) {
    const id = String(bimIde || '').trim()
    if (!id) throw errorValidacion('El numero de bien es obligatorio')

    const data = await FichaComputoModel.getByBimIde(id)
    return { bim_ide: id, ...data }
  }

  static async guardar (bimIde, datos = {}, usuario = null) {
    const id = String(bimIde || '').trim()
    if (!id) throw errorValidacion('El numero de bien es obligatorio')
    if (id.length > 10) throw errorValidacion('El numero de bien no puede superar 10 caracteres')

    let bien
    try {
      bien = await BienesService.detalle(id)
    } catch (error) {
      if (error.status === 404) {
        throw errorValidacion('El bien mueble no existe en Bienes Muebles', 404)
      }
      throw error
    }

    if (!bien) throw errorValidacion('El bien mueble no existe en Bienes Muebles', 404)
    if (!esComputador(bien)) {
      throw errorValidacion('La ficha tecnica solo aplica a bienes de tipo Computador')
    }

    const idCanonico = String(bien.bim_ide || id).trim()
    const detalle = normalizarDetalle(datos)
    const componentes = normalizarComponentes(datos.componentes)

    if (!detalle.elaborado_por && usuario) {
      detalle.elaborado_por = [usuario.nombres, usuario.apellidos]
        .filter(Boolean)
        .join(' ')
        .trim() || null
    }

    // Todos los campos de la ficha son opcionales. Se guarda la ficha
    // aunque el usuario solo registre algunos datos o ninguno.
    const guardado = await FichaComputoModel.upsert(idCanonico, { ...detalle, componentes })
    return { bim_ide: idCanonico, ...guardado }
  }

  static async eliminar (bimIde) {
    const id = String(bimIde || '').trim()
    if (!id) throw errorValidacion('El numero de bien es obligatorio')

    const eliminado = await FichaComputoModel.delete(id)
    if (!eliminado) throw errorValidacion('La ficha tecnica no existe', 404)

    return { message: 'Ficha tecnica eliminada correctamente' }
  }
}
