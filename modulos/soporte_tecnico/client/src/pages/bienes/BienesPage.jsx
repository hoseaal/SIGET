import { useCallback, useEffect, useState } from 'react'
import {
  FaMagnifyingGlass, FaRotateLeft, FaFileExcel, FaEye,
  FaChevronLeft, FaChevronRight, FaCircleInfo, FaMicrochip
} from 'react-icons/fa6'
import { toast } from 'react-toastify'
import api, { downloadFile } from '../../utils/helpFetch.js'
import { formatDate } from '../../utils/dateHelpers.js'
import BienDetalleModal from './components/BienDetalleModal.jsx'
import FichaComputoModal from './components/FichaComputoModal.jsx'

const PAGE_SIZE = 10

const FILTROS_VACIOS = {
  q: '',
  tipo: '',
  dep_ide: '',
  est_ide: '',
  esu_ide: '',
  con_ide: '',
  marca: '',
  fechaDesde: '',
  fechaHasta: '',
  incluirBaja: false
}

function construirParams (filtros, page = 1, limit = PAGE_SIZE) {
  const params = new URLSearchParams()
  params.set('page', page)
  params.set('limit', limit)

  if (filtros.incluirBaja) {
    params.set('incluirBaja', '1')
  } else {
    params.set('activo', '1')
  }

  Object.entries(filtros).forEach(([key, value]) => {
    if (key === 'incluirBaja') return
    if (value !== '' && value !== null && value !== undefined) {
      params.set(key, value)
    }
  })

  return params
}

export default function BienesPage () {
  const [bienes, setBienes] = useState([])
  const [meta, setMeta] = useState({ page: 1, total: 0, totalPages: 0 })
  const [catalogos, setCatalogos] = useState({ tipos: [], departamentos: [], estados: [], estados_uso: [], condiciones: [] })

  const [draft, setDraft] = useState(FILTROS_VACIOS)
  const [filtros, setFiltros] = useState(FILTROS_VACIOS)
  const [page, setPage] = useState(1)

  const [loading, setLoading] = useState(true)
  const [exportando, setExportando] = useState(false)
  const [detalle, setDetalle] = useState(null)
  const [ficha, setFicha] = useState(null)

  useEffect(() => {
    api.get('/bienes/catalogos')
      .then(setCatalogos)
      .catch(error => toast.error(error.message || 'No se pudieron cargar los catalogos'))
  }, [])

  const cargarBienes = useCallback(async () => {
    setLoading(true)
    try {
      const params = construirParams(filtros, page)
      const data = await api.get(`/bienes?${params.toString()}`)
      setBienes(data.data || [])
      setMeta(data.meta || { page: 1, total: 0, totalPages: 0 })
    } catch (error) {
      toast.error(error.message || 'No se pudieron cargar los bienes')
    } finally {
      setLoading(false)
    }
  }, [filtros, page])

  useEffect(() => {
    cargarBienes()
  }, [cargarBienes])

  const totalPages = Math.max(1, Number(meta.totalPages) || 0)
  const pageSafe = Math.min(page, totalPages)

  const handleDraft = (e) => {
    const { name, value, type, checked } = e.target
    setDraft(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  const aplicarFiltros = (e) => {
    e.preventDefault()
    setPage(1)
    setFiltros({ ...draft })
  }

  const limpiarFiltros = () => {
    setDraft(FILTROS_VACIOS)
    setFiltros(FILTROS_VACIOS)
    setPage(1)
  }

  const exportar = async () => {
    setExportando(true)
    try {
      const params = construirParams(filtros, 1, 5000)
      params.delete('page')
      params.delete('limit')
      await downloadFile(`/bienes/export?${params.toString()}`, `Bienes_Soporte_${new Date().toISOString().slice(0, 10)}.xlsx`)
      toast.success('Reporte generado correctamente')
    } catch (error) {
      toast.error(error.message || 'No se pudo generar el reporte')
    } finally {
      setExportando(false)
    }
  }

  return (
    <>
      <div className="page-head">
        <div>
          <h4>Bienes muebles de soporte</h4>
          <p>Equipos de computo, impresoras y perifericos registrados en el modulo de Bienes Muebles.</p>
        </div>

        <button className="btn btn-outline-success" onClick={exportar} disabled={exportando}>
          <FaFileExcel className="me-1" /> {exportando ? 'Generando...' : 'Exportar Excel'}
        </button>
      </div>

      <div className="card-cet mb-4">
        <div className="card-body p-3 p-lg-4">
          <form onSubmit={aplicarFiltros} className="row g-3 align-items-end">
            <div className="col-12 col-md-6 col-lg-3">
              <label className="form-label small fw-semibold" htmlFor="b-search">Buscar</label>
              <input
                id="b-search"
                type="text"
                className="form-control"
                name="q"
                value={draft.q}
                onChange={handleDraft}
                placeholder="Nro de bien, descripcion, serial, marca..."
              />
            </div>

            <div className="col-6 col-md-3 col-lg-2">
              <label className="form-label small fw-semibold" htmlFor="b-tipo">Tipo</label>
              <select id="b-tipo" className="form-select" name="tipo" value={draft.tipo} onChange={handleDraft}>
                <option value="">Todos</option>
                {(catalogos.tipos || []).map(t => (
                  <option key={t.value} value={t.value}>{t.label} ({t.total})</option>
                ))}
              </select>
            </div>

            <div className="col-6 col-md-3 col-lg-2">
              <label className="form-label small fw-semibold" htmlFor="b-depto">Departamento</label>
              <select id="b-depto" className="form-select" name="dep_ide" value={draft.dep_ide} onChange={handleDraft}>
                <option value="">Todos</option>
                {(catalogos.departamentos || []).map(d => (
                  <option key={d.dep_ide} value={d.dep_ide}>{d.dep_nom}</option>
                ))}
              </select>
            </div>

            <div className="col-6 col-md-3 col-lg-2">
              <label className="form-label small fw-semibold" htmlFor="b-estado">Estado</label>
              <select id="b-estado" className="form-select" name="est_ide" value={draft.est_ide} onChange={handleDraft}>
                <option value="">Todos</option>
                {(catalogos.estados || []).map(e => (
                  <option key={e.est_ide} value={e.est_ide}>{e.est_est}</option>
                ))}
              </select>
            </div>

            <div className="col-6 col-md-3 col-lg-2">
              <label className="form-label small fw-semibold" htmlFor="b-condicion">Condicion</label>
              <select id="b-condicion" className="form-select" name="con_ide" value={draft.con_ide} onChange={handleDraft}>
                <option value="">Todas</option>
                {(catalogos.condiciones || []).map(c => (
                  <option key={c.con_ide} value={c.con_ide}>{c.con_con}</option>
                ))}
              </select>
            </div>

            <div className="col-6 col-md-3 col-lg-2">
              <label className="form-label small fw-semibold" htmlFor="b-uso">Estado de uso</label>
              <select id="b-uso" className="form-select" name="esu_ide" value={draft.esu_ide} onChange={handleDraft}>
                <option value="">Todos</option>
                {(catalogos.estados_uso || []).map(e => (
                  <option key={e.esu_ide} value={e.esu_ide}>{e.esu_esu}</option>
                ))}
              </select>
            </div>

            <div className="col-6 col-md-3 col-lg-2">
              <label className="form-label small fw-semibold" htmlFor="b-marca">Marca</label>
              <select id="b-marca" className="form-select" name="marca" value={draft.marca} onChange={handleDraft}>
                <option value="">Todas</option>
                {(catalogos.marcas || []).map((m, index) => (
                  <option key={`${m.marca}-${index}`} value={m.marca}>{m.marca}</option>
                ))}
              </select>
            </div>

            <div className="col-6 col-md-3 col-lg-2">
              <label className="form-label small fw-semibold" htmlFor="b-desde">Ingreso desde</label>
              <input id="b-desde" type="date" className="form-control" name="fechaDesde" value={draft.fechaDesde} onChange={handleDraft} />
            </div>

            <div className="col-6 col-md-3 col-lg-2">
              <label className="form-label small fw-semibold" htmlFor="b-hasta">Ingreso hasta</label>
              <input id="b-hasta" type="date" className="form-control" name="fechaHasta" value={draft.fechaHasta} onChange={handleDraft} />
            </div>

            <div className="col-12 col-lg-4 d-flex align-items-center gap-3">
              <div className="form-check mt-3 mt-lg-0">
                <input
                  id="b-bajas"
                  type="checkbox"
                  className="form-check-input"
                  name="incluirBaja"
                  checked={draft.incluirBaja}
                  onChange={handleDraft}
                />
                <label className="form-check-label small" htmlFor="b-bajas">Incluir dados de baja</label>
              </div>
              <button type="submit" className="btn btn-primary">
                <FaMagnifyingGlass className="me-1" /> Buscar
              </button>
              <button type="button" className="btn btn-outline-secondary" onClick={limpiarFiltros}>
                <FaRotateLeft className="me-1" /> Limpiar
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="card-cet">
        <div className="card-header-cet">
          <h5 className="section-title">Bienes registrados</h5>
          <span className="text-muted small">{meta.total || 0} registro(s)</span>
        </div>

        <div className="table-responsive">
          <table className="table table-hover table-cet">
            <thead>
              <tr>
                <th>Nro. bien</th>
                <th>Descripcion</th>
                <th>Tipo</th>
                <th>Marca / Modelo</th>
                <th>Serial</th>
                <th>Codigo</th>
                <th>Departamento</th>
                <th>Estado</th>
                <th>Condicion</th>
                <th>Ingreso</th>
                <th className="text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={11} className="text-center py-5">
                    <div className="spinner-border spinner-border-sm text-primary" role="status" />
                    <span className="ms-2 text-muted">Cargando bienes...</span>
                  </td>
                </tr>
              )}

              {!loading && bienes.length === 0 && (
                <tr>
                  <td colSpan={11}>
                    <div className="empty-state">
                      <FaCircleInfo />
                      <div>No se encontraron bienes para los filtros seleccionados.</div>
                    </div>
                  </td>
                </tr>
              )}

              {!loading && bienes.map(bien => (
                <tr key={bien.bim_ide}>
                  <td className="fw-semibold text-body text-nowrap">{bien.bim_ide}</td>
                  <td style={{ minWidth: 220 }}>
                    <span
                      className="d-inline-block text-truncate"
                      style={{ maxWidth: 260 }}
                      title={bien.bim_des || ''}
                    >
                      {bien.bim_des || '-'}
                    </span>
                  </td>
                  <td className="text-nowrap">
                    <span className="badge badge-soft-blue">{bien.tipo_soporte || '-'}</span>
                  </td>
                  <td style={{ minWidth: 150 }}>
                    {[bien.marca, bien.modelo].filter(Boolean).join(' / ') || '-'}
                  </td>
                  <td className="text-nowrap">{bien.bim_ser || '-'}</td>
                  <td className="text-nowrap">{bien.bim_cod || '-'}</td>
                  <td style={{ minWidth: 180 }}>{bien.departamento || '-'}</td>
                  <td className="text-nowrap">{bien.estado || '-'}</td>
                  <td className="text-nowrap">{bien.condicion || '-'}</td>
                  <td className="text-nowrap">{formatDate(bien.bim_fec)}</td>
                  <td className="text-center text-nowrap">
                    <button
                      className="btn btn-sm btn-outline-primary"
                      title="Ver detalle"
                      onClick={() => setDetalle(bien)}
                    >
                      <FaEye />
                    </button>
                    {String(bien.tipo_soporte || '').toLowerCase().includes('computador') && (
                      <button
                        className="btn btn-sm btn-outline-success ms-1"
                        title="Ficha tecnica del computador"
                        onClick={() => setFicha(bien)}
                      >
                        <FaMicrochip />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {!loading && Number(meta.total) > 0 && (
          <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 p-3 border-top">
            <span className="text-muted small">
              Mostrando {(pageSafe - 1) * PAGE_SIZE + 1} - {Math.min(pageSafe * PAGE_SIZE, Number(meta.total))} de {meta.total}
            </span>
            <nav>
              <ul className="pagination pagination-sm mb-0">
                <li className={`page-item ${pageSafe === 1 ? 'disabled' : ''}`}>
                  <button className="page-link" onClick={() => setPage(pageSafe - 1)}>
                    <FaChevronLeft size={10} />
                  </button>
                </li>
                <li className="page-item active">
                  <span className="page-link">{pageSafe} / {totalPages}</span>
                </li>
                <li className={`page-item ${pageSafe === totalPages ? 'disabled' : ''}`}>
                  <button className="page-link" onClick={() => setPage(pageSafe + 1)}>
                    <FaChevronRight size={10} />
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        )}
      </div>

      <BienDetalleModal
        show={Boolean(detalle)}
        onHide={() => setDetalle(null)}
        bien={detalle}
        onFicha={() => {
          const actual = detalle
          setDetalle(null)
          setFicha(actual)
        }}
      />

      <FichaComputoModal
        show={Boolean(ficha)}
        onHide={() => setFicha(null)}
        bien={ficha}
        onSaved={cargarBienes}
      />
    </>
  )
}
