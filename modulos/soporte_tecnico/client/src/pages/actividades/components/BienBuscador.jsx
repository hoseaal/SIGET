import { useEffect, useMemo, useRef, useState } from 'react'
import { Form, InputGroup, Spinner } from 'react-bootstrap'
import { FaMagnifyingGlass, FaXmark } from 'react-icons/fa6'

const MAX_RESULTADOS = 50

function normalizarTexto (valor) {
  return String(valor ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

function etiquetaBien (bien) {
  if (!bien) return ''
  const descripcion = bien.bim_des ? ` - ${bien.bim_des}` : ''
  return `${bien.bim_ide}${descripcion}`
}

export default function BienBuscador ({
  id,
  value,
  options = [],
  onChange,
  disabled = false,
  loading = false,
  placeholder = 'Buscar por número o descripción...'
}) {
  const [abierto, setAbierto] = useState(false)
  const [busqueda, setBusqueda] = useState('')
  const [indiceActivo, setIndiceActivo] = useState(0)
  const inputRef = useRef(null)
  const listaRef = useRef(null)

  const bloqueado = disabled || loading

  const seleccionado = useMemo(
    () => options.find(b => String(b.bim_ide) === String(value)),
    [options, value]
  )

  const resultados = useMemo(() => {
    const terminos = normalizarTexto(busqueda).split(/\s+/).filter(Boolean)
    if (!terminos.length) return options

    return options.filter(b => {
      const texto = normalizarTexto(`${b.bim_ide ?? ''} ${b.bim_des ?? ''}`)
      return terminos.every(termino => texto.includes(termino))
    })
  }, [options, busqueda])

  const visibles = useMemo(() => resultados.slice(0, MAX_RESULTADOS), [resultados])

  const valorMostrado = abierto
    ? busqueda
    : (seleccionado ? etiquetaBien(seleccionado) : (value ? String(value) : ''))

  useEffect(() => {
    if (!abierto) return
    setIndiceActivo(prev => Math.min(prev, Math.max(visibles.length - 1, 0)))
  }, [abierto, visibles.length])

  useEffect(() => {
    if (bloqueado) {
      setAbierto(false)
      setBusqueda('')
    }
  }, [bloqueado])

  useEffect(() => {
    if (!abierto || !listaRef.current) return
    const opcion = listaRef.current.querySelector('[data-active="true"]')
    if (!opcion) return

    const { scrollTop, clientHeight } = listaRef.current
    const top = opcion.offsetTop
    const bottom = top + opcion.offsetHeight

    if (top < scrollTop) {
      listaRef.current.scrollTop = top
    } else if (bottom > scrollTop + clientHeight) {
      listaRef.current.scrollTop = bottom - clientHeight
    }
  }, [abierto, indiceActivo, visibles])

  const abrir = () => {
    if (bloqueado) return
    setAbierto(true)
    setBusqueda('')
    setIndiceActivo(0)
  }

  const cerrar = () => {
    setAbierto(false)
    setBusqueda('')
    setIndiceActivo(0)
  }

  const seleccionar = (bien) => {
    onChange(String(bien.bim_ide))
    cerrar()
  }

  const limpiar = () => {
    onChange('')
    cerrar()
    inputRef.current?.focus()
  }

  const handleBlur = (event) => {
    if (!event.currentTarget.contains(event.relatedTarget)) cerrar()
  }

  const handleKeyDown = (event) => {
    if (bloqueado) return

    if (event.key === 'ArrowDown') {
      event.preventDefault()
      event.stopPropagation()
      if (!abierto) {
        abrir()
        return
      }
      setIndiceActivo(prev => Math.min(prev + 1, Math.max(visibles.length - 1, 0)))
      return
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault()
      event.stopPropagation()
      if (!abierto) {
        abrir()
        return
      }
      setIndiceActivo(prev => Math.max(prev - 1, 0))
      return
    }

    if (event.key === 'Enter' && abierto) {
      event.preventDefault()
      event.stopPropagation()
      const bien = visibles[indiceActivo]
      if (bien) seleccionar(bien)
      return
    }

    if (event.key === 'Escape' && abierto) {
      event.preventDefault()
      event.stopPropagation()
      cerrar()
      inputRef.current?.blur()
    }
  }

  const handleChange = (event) => {
    if (!abierto) setAbierto(true)
    setBusqueda(event.target.value)
    setIndiceActivo(0)
  }

  return (
    <div className="bien-buscador" onBlur={handleBlur}>
      <InputGroup>
        <InputGroup.Text aria-hidden="true">
          {loading
            ? <Spinner animation="border" size="sm" />
            : <FaMagnifyingGlass />}
        </InputGroup.Text>

        <Form.Control
          id={id}
          ref={inputRef}
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={abierto}
          aria-controls={abierto ? `${id}-lista` : undefined}
          aria-activedescendant={abierto && visibles.length ? `${id}-opcion-${indiceActivo}` : undefined}
          autoComplete="off"
          value={valorMostrado}
          placeholder={loading ? 'Cargando bienes...' : placeholder}
          disabled={bloqueado}
          onFocus={abrir}
          onClick={() => { if (!abierto) abrir() }}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
        />

        {Boolean(value) && !bloqueado && (
          <button
            type="button"
            className="bien-buscador-limpiar"
            aria-label="Quitar bien asociado"
            title="Quitar bien asociado"
            onMouseDown={event => event.preventDefault()}
            onClick={limpiar}
          >
            <FaXmark size={13} />
          </button>
        )}
      </InputGroup>

      {abierto && !bloqueado && (
        <div className="bien-buscador-dropdown">
          {visibles.length > 0
            ? (
              <div
                id={`${id}-lista`}
                ref={listaRef}
                role="listbox"
                aria-label="Bienes disponibles"
                className="bien-buscador-lista"
              >
                {visibles.map((bien, index) => {
                  const activo = index === indiceActivo
                  const descripcion = bien.bim_des || 'Sin descripción'

                  return (
                    <div
                      key={bien.bim_ide}
                      id={`${id}-opcion-${index}`}
                      role="option"
                      aria-selected={String(bien.bim_ide) === String(value)}
                      data-active={activo ? 'true' : undefined}
                      className={`bien-buscador-opcion${activo ? ' activo' : ''}`}
                      onMouseDown={event => event.preventDefault()}
                      onMouseEnter={() => setIndiceActivo(index)}
                      onClick={() => seleccionar(bien)}
                    >
                      <span className="bien-buscador-numero">{bien.bim_ide}</span>
                      <span className="bien-buscador-descripcion" title={descripcion}>
                        {descripcion}
                      </span>
                      {bien.tipo_soporte && (
                        <span className="bien-buscador-tipo">{bien.tipo_soporte}</span>
                      )}
                    </div>
                  )
                })}
              </div>
            )
            : (
              <div className="bien-buscador-vacio">
                No se encontraron bienes con ese número o descripción.
              </div>
            )}

          <div className="bien-buscador-pie">
            {resultados.length === 0
              ? 'Pruebe con otro número o palabra de la descripción.'
              : resultados.length > visibles.length
                ? `Mostrando ${visibles.length} de ${resultados.length} coincidencias. Escriba para afinar la búsqueda.`
                : `${resultados.length} ${resultados.length === 1 ? 'bien disponible' : 'bienes disponibles'}`}
          </div>
        </div>
      )}
    </div>
  )
}
