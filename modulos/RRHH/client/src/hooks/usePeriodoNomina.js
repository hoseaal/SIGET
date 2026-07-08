import { useEffect, useState } from 'react'

export const MESES_NOMINA = [
  { id: 1, name: 'Enero' },
  { id: 2, name: 'Febrero' },
  { id: 3, name: 'Marzo' },
  { id: 4, name: 'Abril' },
  { id: 5, name: 'Mayo' },
  { id: 6, name: 'Junio' },
  { id: 7, name: 'Julio' },
  { id: 8, name: 'Agosto' },
  { id: 9, name: 'Septiembre' },
  { id: 10, name: 'Octubre' },
  { id: 11, name: 'Noviembre' },
  { id: 12, name: 'Diciembre' }
]

export const getMesNombre = (mes) => MESES_NOMINA.find(item => item.id === Number(mes))?.name || 'Mes'

export function usePeriodoNomina(apiBasePath, onError) {
  const [periodoNomina, setPeriodoNomina] = useState(null)
  const [periodoLoading, setPeriodoLoading] = useState(true)

  useEffect(() => {
    const loadPeriodoObjetivo = async () => {
      setPeriodoLoading(true)

      try {
        const res = await fetch(`${apiBasePath}/periodo-objetivo`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        })
        const data = await res.json()

        if (!data.ok) {
          throw new Error(data.message || 'No se pudo obtener el periodo de nomina.')
        }

        setPeriodoNomina(data.periodo)
      } catch (error) {
        console.error(error)
        onError?.(error)
      } finally {
        setPeriodoLoading(false)
      }
    }

    loadPeriodoObjetivo()
  }, [apiBasePath])

  return {
    periodoNomina,
    setPeriodoNomina,
    periodoLoading,
    mes: periodoNomina?.mes || '',
    anio: periodoNomina?.anio || '',
    mesNombre: periodoNomina?.mesNombre || getMesNombre(periodoNomina?.mes)
  }
}
