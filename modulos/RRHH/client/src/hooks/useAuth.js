import { useState, useEffect } from 'react'

let cachedUser = null
let cachedPromise = null

// Exportar para invocarla en el logout y limpiar el usuario anterior
export function clearAuthCache() {
  cachedUser = null
  cachedPromise = null
}

export function useAuth() {
  const [user, setUser] = useState(cachedUser)
  const [loading, setLoading] = useState(!cachedUser)

  useEffect(() => {
    if (cachedUser) return

    if (cachedPromise) {
      cachedPromise.then(data => {
        cachedUser = data
        setUser(data)
        setLoading(false)
      })
      return
    }

    cachedPromise = fetch('/api/rrhh/auth/verify-auth', {
      method: 'GET',
      credentials: 'include'
    }).then(res => {
      if (!res.ok) throw new Error('No autorizado')
      return res.json()
    }).then(data => {
      if (!data.success) throw new Error(data.error || 'Error al verificar usuario')
      cachedUser = data.user
      setUser(data.user)
      return data.user
    }).catch(err => {
      cachedPromise = null
      throw err
    })

    cachedPromise.then(() => setLoading(false))
  }, [])

  return {
    user,
    rol_id: user?.rol_id,
    loading
  }
}
