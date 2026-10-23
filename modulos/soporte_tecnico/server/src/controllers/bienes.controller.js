import { BienesService } from '../services/bienes.service.js'

function extraerFiltros (query = {}) {
  return {
    q: query.q,
    tipo: query.tipo,
    cae_ide: query.cae_ide,
    sca_ide: query.sca_ide,
    departamento_id: query.departamento_id,
    dep_ide: query.dep_ide,
    est_ide: query.est_ide,
    esu_ide: query.esu_ide,
    con_ide: query.con_ide,
    foa_ide: query.foa_ide,
    marca: query.marca,
    modelo: query.modelo,
    serial: query.serial,
    codigo: query.codigo,
    sede: query.sede,
    activo: query.activo,
    incluirBaja: query.incluirBaja,
    fechaDesde: query.fechaDesde,
    fechaHasta: query.fechaHasta,
    page: query.page,
    limit: query.limit,
    sort: query.sort,
    order: query.order
  }
}

function responderError (res, error) {
  const status = error.status || 502
  res.status(status).json({ error: error.message })
}

export const obtenerBienes = async (req, res) => {
  try {
    const data = await BienesService.listar(extraerFiltros(req.query))
    res.json(data)
  } catch (error) {
    responderError(res, error)
  }
}

export const obtenerResumenBienes = async (req, res) => {
  try {
    const data = await BienesService.resumen(extraerFiltros(req.query))
    res.json(data)
  } catch (error) {
    responderError(res, error)
  }
}

export const obtenerCatalogosBienes = async (req, res) => {
  try {
    const data = await BienesService.catalogos()
    res.json(data)
  } catch (error) {
    responderError(res, error)
  }
}

export const obtenerLookupBienes = async (req, res) => {
  try {
    const data = await BienesService.lookup(req.query.ids)
    res.json(data)
  } catch (error) {
    responderError(res, error)
  }
}

export const obtenerBien = async (req, res) => {
  try {
    const data = await BienesService.detalle(req.params.id)
    res.json(data)
  } catch (error) {
    responderError(res, error)
  }
}

export const exportarBienes = async (req, res) => {
  try {
    const archivo = await BienesService.exportar(extraerFiltros(req.query))
    res.setHeader('Content-Type', archivo.contentType)
    res.setHeader('Content-Disposition', archivo.contentDisposition)
    res.send(archivo.buffer)
  } catch (error) {
    responderError(res, error)
  }
}

export const obtenerMapeoDepartamentos = async (req, res) => {
  try {
    const data = await BienesService.obtenerMapeoDepartamentos()
    res.json(data)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}
