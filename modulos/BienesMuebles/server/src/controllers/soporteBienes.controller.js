import { SoporteBienesService } from '../services/soporteBienes.service.js'

function extraerFiltros (query = {}) {
  return {
    q: query.q,
    tipo: query.tipo,
    cae_ide: query.cae_ide,
    sca_ide: query.sca_ide,
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

export const obtenerBienesSoporte = async (req, res) => {
  try {
    const result = await SoporteBienesService.obtenerBienes(extraerFiltros(req.query))
    res.json(result)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

export const obtenerResumenSoporte = async (req, res) => {
  try {
    const result = await SoporteBienesService.obtenerResumen(extraerFiltros(req.query))
    res.json(result)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

export const obtenerCatalogosSoporte = async (req, res) => {
  try {
    const result = await SoporteBienesService.obtenerCatalogos()
    res.json(result)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

export const obtenerLookupSoporte = async (req, res) => {
  try {
    const result = await SoporteBienesService.obtenerLookup({
      ids: req.query.ids,
      q: req.query.q,
      limit: req.query.limit
    })
    res.json(result)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

export const obtenerBienSoporte = async (req, res) => {
  try {
    const bien = await SoporteBienesService.obtenerPorId(req.params.id)
    res.json(bien)
  } catch (error) {
    const status = error.message === 'Bien mueble no encontrado' ? 404 : 400
    res.status(status).json({ error: error.message })
  }
}

export const exportarBienesSoporte = async (req, res) => {
  try {
    const archivo = await SoporteBienesService.exportar(extraerFiltros(req.query))
    res.setHeader('Content-Type', archivo.contentType)
    res.setHeader('Content-Disposition', `attachment; filename="${archivo.filename}"`)
    res.send(archivo.buffer)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}
