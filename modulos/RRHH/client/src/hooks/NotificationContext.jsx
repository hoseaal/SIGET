import { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react'

const NotificationContext = createContext(null)

export function NotificationProvider({ children }) {
  const [vacationAlerts, setVacationAlerts] = useState({
    proximosDerecho: [],
    proximosRetornar: [],
    resumen: { por_derecho_funcionarios: 0, por_derecho_obreros: 0 }
  })
  const [loading, setLoading] = useState(false)
  const mountedRef = useRef(true)

  const refreshNotifications = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/vacaciones/alertas')
      if (res.ok) {
        const data = await res.json()
        if (mountedRef.current) {
          setVacationAlerts({
            proximosDerecho: Array.isArray(data?.proximosDerecho)
              ? data.proximosDerecho
              : (Array.isArray(data?.por_derecho) ? data.por_derecho : []),
            proximosRetornar: Array.isArray(data?.proximosRetornar)
              ? data.proximosRetornar
              : (Array.isArray(data?.caducidad) ? data.caducidad : []),
            resumen: data?.resumen || { por_derecho_funcionarios: 0, por_derecho_obreros: 0 }
          })
        }
      }
    } catch (error) {
      console.error('Error al obtener alertas de vacaciones:', error)
    } finally {
      if (mountedRef.current) setLoading(false)
    }
  }, [])

  useEffect(() => {
    refreshNotifications()
    return () => { mountedRef.current = false }
  }, [refreshNotifications])

  return (
    <NotificationContext.Provider value={{ vacationAlerts, loading, refreshNotifications }}>
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  const ctx = useContext(NotificationContext)
  if (!ctx) {
    throw new Error('useNotifications debe usarse dentro de un NotificationProvider')
  }
  return ctx
}
