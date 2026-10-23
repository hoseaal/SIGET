const BASE_URL = '/api/soporte'

async function parseError (res) {
  let message = `Error HTTP ${res.status}`
  try {
    const data = await res.json()
    message = data.error || data.message || message
  } catch (_) {
    // respuesta no JSON
  }
  const error = new Error(message)
  error.status = res.status
  return error
}

async function request (path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    credentials: 'include',
    ...options
  })

  if (!res.ok) throw await parseError(res)

  const contentType = res.headers.get('content-type') || ''
  if (contentType.includes('application/json')) return res.json()
  return res
}

const api = {
  get: (path) => request(path),
  post: (path, data) => request(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }),
  put: (path, data) => request(path, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }),
  delete: (path) => request(path, { method: 'DELETE' })
}

export async function downloadFile (path, fallbackName = 'reporte.xlsx') {
  const res = await fetch(`${BASE_URL}${path}`, { credentials: 'include' })
  if (!res.ok) throw await parseError(res)

  const blob = await res.blob()
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = fallbackName
  document.body.appendChild(a)
  a.click()
  a.remove()
  window.URL.revokeObjectURL(url)
}

export default api
